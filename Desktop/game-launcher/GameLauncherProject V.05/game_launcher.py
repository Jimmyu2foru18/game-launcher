import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import subprocess
import json
import sys
from datetime import datetime
import threading
import psutil  # Add this line to import the psutil module
from PIL import Image, ImageTk  # Add this line to import Image and ImageTk

# Constants for known executable names
EXCLUDED_EXECUTABLES = ["dx11.exe", "utility crash handler.exe", "redis.64.exe"]

# Cache for loaded images
image_cache = {}
favorite_games = []
recently_launched = []

# Function to check if the application is already running
def is_already_running():
    return any("game_launcher.py" in p for p in (p.name() for p in psutil.process_iter()))

def create_default_metadata(metadata_file):
    default_metadata = {}
    with open(metadata_file, 'w') as f:
        json.dump(default_metadata, f)

def load_game_metadata(metadata_file):
    if not os.path.exists(metadata_file):
        create_default_metadata(metadata_file)
        return {}
    try:
        with open(metadata_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        messagebox.showerror("Error", f"Failed to load metadata: {str(e)}")
        return {}

def search_games(root_folder):
    game_files = []
    metadata = load_game_metadata(os.path.join(root_folder, 'game_metadata.json'))

    messagebox.showinfo("Searching", "Searching for games...")  # Notify user that search is starting

    for root, dirs, files in os.walk(root_folder):
        for file in files:
            if file.endswith(".exe") and file.lower() not in EXCLUDED_EXECUTABLES:
                game_path = os.path.join(root, file)
                file_size = os.path.getsize(game_path)
                last_modified = datetime.fromtimestamp(os.path.getmtime(game_path)).strftime('%Y-%m-%d %H:%M:%S')
                image_file = find_image_in_folder(root)
                game_files.append({
                    'name': os.path.basename(file),
                    'path': game_path,
                    'image': image_file,
                    'size': file_size,
                    'last_modified': last_modified
                })

    if game_files:
        messagebox.showinfo("Games Found", f"Found {len(game_files)} games.")  # Notify user of found games
    else:
        messagebox.showinfo("No Games Found", "No games were found in the selected directory.")  # Notify if no games found

    return game_files

def find_image_in_folder(folder):
    if folder in image_cache:
        return image_cache[folder]
    
    for file in os.listdir(folder):
        if file.lower().endswith((".png", ".jpg", ".jpeg")):
            image_cache[folder] = os.path.join(folder, file)
            return image_cache[folder]
    return None

def launch_game(game_path):
    """Launch the game in a separate thread to avoid freezing the UI."""
    def run():
        try:
            subprocess.Popen(game_path, shell=True)
            recently_launched.append(game_path)
            messagebox.showinfo("Game Launched", f"Launching {os.path.basename(game_path)}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to launch game: {str(e)}")

    threading.Thread(target=run).start()

def toggle_favorite(game_name):
    if game_name in favorite_games:
        favorite_games.remove(game_name)
    else:
        favorite_games.append(game_name)

def toggle_theme(root):
    current_bg = root.cget("bg")
    new_bg = "white" if current_bg == "black" else "black"
    root.config(bg=new_bg)
    for widget in root.winfo_children():
        widget.config(bg=new_bg)

def create_launcher_ui(games):
    root = tk.Tk()
    root.title("Game Launcher")
    root.geometry("800x600")  # Set a general size for the application
    root.minsize(800, 600)  # Set a minimum size for the window

    # Add a search bar
    search_var = tk.StringVar()
    search_entry = ttk.Entry(root, textvariable=search_var)
    search_entry.grid(row=0, column=0, sticky='ew', padx=5, pady=5)

    frame = ttk.Frame(root)
    frame.grid(row=1, column=0, sticky='nsew', padx=10, pady=10)

    # Create a canvas for scrolling
    canvas = tk.Canvas(frame)
    scroll_y = ttk.Scrollbar(frame, orient="vertical", command=canvas.yview)
    scrollable_frame = ttk.Frame(canvas)

    scrollable_frame.bind(
        "<Configure>",
        lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
    )

    canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
    canvas.configure(yscrollcommand=scroll_y.set)

    # Pack the canvas and scrollbar
    canvas.grid(row=0, column=0, sticky='nsew')
    scroll_y.grid(row=0, column=1, sticky='ns')

    # Add a button to toggle themes
    btn_toggle_theme = ttk.Button(root, text="Toggle Theme", command=lambda: toggle_theme(root))
    btn_toggle_theme.grid(row=2, column=0, pady=5)

    # Create dynamic cards for each game
    def update_game_display(games_to_display):
        for widget in scrollable_frame.winfo_children():
            widget.destroy()  # Clear previous game cards

        for idx, game in enumerate(games_to_display):
            card_frame = ttk.Frame(scrollable_frame, relief="raised", borderwidth=2, padding=10)
            card_frame.grid(row=idx, column=0, padx=5, pady=5, sticky="ew")  # Use grid for vertical positioning

            # Animation effect: Fade in effect
            card_frame.tk_setPalette(background='white')  # Set initial background
            card_frame.after(0, lambda frame=card_frame: fade_in(frame))  # Start fade-in animation

            card_frame.bind("<Enter>", lambda e: card_frame.config(background="lightblue"))
            card_frame.bind("<Leave>", lambda e: card_frame.config(background="white"))

            # Lazy load images
            if game['image']:
                img = Image.open(game['image'])
                img.thumbnail((100, 100))  # Resize image for the card
                img = ImageTk.PhotoImage(img)
                label_img = tk.Label(card_frame, image=img)
                label_img.image = img  # Keep a reference to prevent garbage collection
                label_img.pack(side='left', padx=5)

            btn_launch = ttk.Button(card_frame, text=game['name'], command=lambda p=game['path']: launch_game(p))
            btn_launch.pack(side='left', fill='x', expand=True)

            label_info = tk.Label(card_frame, text=f"Size: {game['size']} bytes\nLast Modified: {game['last_modified']}", wraplength=200)
            label_info.pack(side='left', padx=5)

            # Favorite button
            btn_favorite = ttk.Button(card_frame, text="Favorite", command=lambda name=game['name']: toggle_favorite(name))
            btn_favorite.pack(side='right', padx=5)

    def fade_in(frame, alpha=0):
        if alpha < 1:
            alpha += 0.05  # Increase alpha value
            frame.tk_setPalette(background=frame.winfo_rgb('white'))  # Change background color gradually
            frame.after(50, lambda: fade_in(frame, alpha))  # Call fade_in again

    # Update game display based on search query
    def search_games_in_ui(*args):
        query = search_var.get().lower()
        filtered_games = [game for game in games if query in game['name'].lower()]
        update_game_display(filtered_games)

    search_var.trace("w", search_games_in_ui)  # Trace changes in the search bar

    update_game_display(games)  # Initial display of games
    root.mainloop()  # Start the GUI event loop

def select_image_folder():
    image_folder = tk.filedialog.askdirectory(title="Select the folder containing game images")
    return image_folder

if __name__ == "__main__":
    if is_already_running():
        messagebox.showwarning("Warning", "The game launcher is already running.")
        sys.exit()  # Exit if already running

    root_folder = tk.filedialog.askdirectory(title="Select the root folder to search for games")
    if root_folder:  # Only proceed if a folder was selected
        image_folder = select_image_folder()  # Allow user to select image folder
        if image_folder:  # Ensure an image folder is selected
            games = search_games(root_folder)
            if games:
                create_launcher_ui(games)
            else:
                messagebox.showinfo("No Games Found", "No games were found in the selected directory.")
    else:
        messagebox.showwarning("Folder Selection", "No folder was selected. Exiting...")
