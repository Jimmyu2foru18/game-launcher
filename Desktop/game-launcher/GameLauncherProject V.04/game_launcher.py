import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from PIL import Image, ImageTk
import subprocess
import json
import requests  # Import requests for API calls
import threading

# Constants for known executable names
EXCLUDED_EXECUTABLES = ["dx11.exe", "utility crash handler.exe", "redis.64.exe"]
API_KEY = 'YOUR_RAWG_API_KEY'  # Replace with your actual API key
API_URL = 'https://api.rawg.io/api/games'

# Cache for loaded images
image_cache = {}
favorite_games = []
recently_launched = []

def create_default_metadata(metadata_file):
    default_metadata = {}
    with open(metadata_file, 'w') as f:
        json.dump(default_metadata, f)

def load_game_metadata(metadata_file):
    if not os.path.exists(metadata_file):
        create_default_metadata(metadata_file)  # Create the file if it doesn't exist
        return {}  # Return an empty dictionary
    try:
        with open(metadata_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        messagebox.showerror("Error", f"Failed to load metadata: {str(e)}")
        return {}

def fetch_game_description(game_name):
    """Fetch game description from RAWG API."""
    try:
        response = requests.get(API_URL, params={'key': API_KEY, 'page_size': 1, 'search': game_name})
        response.raise_for_status()  # Raise an error for bad responses
        data = response.json()
        if data['results']:
            return data['results'][0]['description']  # Return the description of the first result
        else:
            return "No description available."
    except Exception as e:
        print(f"Error fetching description: {e}")
        return "Error fetching description."

def fetch_game_description_async(game_name, callback):
    """Fetch game description from RAWG API asynchronously."""
    def fetch():
        description = fetch_game_description(game_name)
        callback(description)

    threading.Thread(target=fetch).start()

def search_games(root_folder):
    game_files = []
    metadata = load_game_metadata(os.path.join(root_folder, 'game_metadata.json'))

    # Define acceptable game file extensions
    acceptable_extensions = ['.exe', '.bat', '.cmd']  # Add more extensions as needed

    for root, dirs, files in os.walk(root_folder):
        largest_file = None
        largest_size = 0

        for file in files:
            if any(file.lower().endswith(ext) for ext in acceptable_extensions) and file.lower() not in EXCLUDED_EXECUTABLES:
                game_path = os.path.join(root, file)
                file_size = os.path.getsize(game_path)

                if file_size > largest_size:
                    largest_size = file_size
                    largest_file = game_path

        if largest_file:
            image_file = find_image_in_folder(root)
            # Fetch description asynchronously
            fetch_game_description_async(os.path.basename(largest_file), lambda description: game_files.append(
                (os.path.basename(largest_file), largest_file, image_file, description)
            ))
            print(f"Found largest game: {os.path.basename(largest_file)}")  # Debugging line

    if not game_files:
        print("No games found in the selected directory.")  # Debugging line

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
    try:
        subprocess.Popen(game_path, shell=True)
        recently_launched.append(game_path)
    except Exception as e:
        messagebox.showerror("Error", f"Failed to launch game: {str(e)}")

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
    root.geometry("800x600")  # Set a default size for the window
    root.configure(bg="#2E2E2E")  # Set a dark background color

    # Add a search bar
    search_var = tk.StringVar()
    search_entry = ttk.Entry(root, textvariable=search_var, font=("Arial", 14))
    search_entry.pack(side='top', fill='x', padx=10, pady=10)

    frame = ttk.Frame(root)
    frame.pack(fill='both', expand=True, padx=10, pady=10)

    # Create a canvas for scrolling
    canvas = tk.Canvas(frame, bg="#2E2E2E")
    scroll_y = ttk.Scrollbar(frame, orient="vertical", command=canvas.yview)
    scrollable_frame = ttk.Frame(canvas, bg="#2E2E2E")

    scrollable_frame.bind(
        "<Configure>",
        lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
    )

    canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
    canvas.configure(yscrollcommand=scroll_y.set)

    # Pack the canvas and scrollbar
    canvas.pack(side="left", fill="both", expand=True)
    scroll_y.pack(side="right", fill="y")

    # Add a button to toggle themes
    btn_toggle_theme = ttk.Button(root, text="Toggle Theme", command=lambda: toggle_theme(root))
    btn_toggle_theme.pack(side='top', pady=5)

    # Create dynamic cards for each game
    for idx, (name, path, image_path, description) in enumerate(games):
        card_frame = ttk.Frame(scrollable_frame, relief="raised", borderwidth=2, padding=10, bg="#3E3E3E")
        card_frame.grid(row=idx // 3, column=idx % 3, padx=5, pady=5, sticky="nsew")  # Grid layout

        card_frame.bind("<Enter>", lambda e: card_frame.config(background="#4E4E4E"))
        card_frame.bind("<Leave>", lambda e: card_frame.config(background="#3E3E3E"))

        if image_path:
            img = Image.open(image_path)
            img.thumbnail((100, 100))  # Resize image for the card
            img = ImageTk.PhotoImage(img)
            label_img = tk.Label(card_frame, image=img)
            label_img.image = img  # Keep a reference to prevent garbage collection
            label_img.pack(side='left', padx=5)

        btn_launch = ttk.Button(card_frame, text=name, command=lambda p=path: (launch_game(p), show_game_details(name, description)))
        btn_launch.pack(side='left', fill='x', expand=True)

        label_desc = tk.Label(card_frame, text=description, wraplength=200, bg="#3E3E3E", fg="white")
        label_desc.pack(side='left', padx=5)

    root.mainloop()  # Start the GUI event loop

def show_game_details(name, description):
    details_window = tk.Toplevel()
    details_window.title(name)
    details_window.configure(bg="#2E2E2E")
    details_label = tk.Label(details_window, text=description, wraplength=300, bg="#2E2E2E", fg="white")
    details_label.pack(padx=10, pady=10)
    close_button = ttk.Button(details_window, text="Close", command=details_window.destroy)
    close_button.pack(pady=5)

def select_image_folder():
    image_folder = tk.filedialog.askdirectory(title="Select the folder containing game images")
    return image_folder

if __name__ == "__main__":
    root_folder = tk.filedialog.askdirectory(title="Select the root folder to search for games")
    image_folder = select_image_folder()  # Allow user to select image folder
    if root_folder:
        games = search_games(root_folder)
        if games:
            create_launcher_ui(games)
        else:
            messagebox.showinfo("No Games Found", "No games were found in the selected directory.")
    else:
        messagebox.showwarning("Folder Selection", "No folder was selected. Exiting...")
