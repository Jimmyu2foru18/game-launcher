const gameListElement = document.getElementById('game-list');
const statusMessageElement = document.getElementById('status-message');
const updatesSection = document.getElementById('updates-section');
const checkUpdatesButton = document.getElementById('check-updates-button');
const updatesList = document.getElementById('updates-list');

// Function to display status messages
function displayStatus(message, isError = false) {
  statusMessageElement.textContent = message;
  statusMessageElement.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    statusMessageElement.textContent = '';
  }, 5000);
}

// Modal Elements
const modManagerModal = document.getElementById('mod-manager-modal');
const closeModalButton = document.querySelector('.close-button');
const downloadModForm = document.getElementById('download-mod-form');
const installedModsList = document.getElementById('installed-mods-list');

// Current Game ID (Set when opening the modal)
let currentGameId = null;

// Function to open the mod manager modal
function openModManager(gameId) {
  currentGameId = gameId;
  modManagerModal.style.display = 'block';
  loadInstalledMods(gameId);
}

// Function to close the mod manager modal
function closeModManager() {
  modManagerModal.style.display = 'none';
  currentGameId = null;
  installedModsList.innerHTML = '';
  downloadModForm.reset();
}

// Event listener for closing the modal
closeModalButton.addEventListener('click', closeModManager);

// Event listener for clicking outside the modal content to close it
window.addEventListener('click', (event) => {
  if (event.target === modManagerModal) {
    closeModManager();
  }
});

// Function to load and display installed mods
function loadInstalledMods(gameId) {
  window.electronAPI.listMods(gameId)
    .then(response => {
      if (response.success) {
        installedModsList.innerHTML = '';
        if (response.mods.length === 0) {
          const li = document.createElement('li');
          li.textContent = 'No mods installed.';
          installedModsList.appendChild(li);
          return;
        }
        response.mods.forEach(mod => {
          const li = document.createElement('li');
          li.textContent = mod;
          
          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.addEventListener('click', () => {
            removeMod(gameId, mod);
          });
          
          li.appendChild(removeButton);
          installedModsList.appendChild(li);
        });
      } else {
        displayStatus(`Failed to list mods: ${response.message}`, true);
      }
    })
    .catch(err => {
      console.error('Error listing mods:', err);
      displayStatus('Error listing mods.', true);
    });
}

// Function to handle mod removal
function removeMod(gameId, modName) {
  window.electronAPI.removeMod(gameId, modName)
    .then(removeResponse => {
      if (removeResponse.success) {
        displayStatus(`Mod "${modName}" removed successfully.`);
        loadInstalledMods(gameId);
      } else {
        displayStatus(`Failed to remove mod: ${removeResponse.message}`, true);
      }
    })
    .catch(err => {
      console.error('Error removing mod:', err);
      displayStatus('Error removing mod.', true);
    });
}

// Function to validate mod name (e.g., no special characters)
function isValidModName(name) {
  const regex = /^[a-zA-Z0-9-_ ]+$/;
  return regex.test(name);
}

// Function to validate URLs
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

// Event listener for downloading a new mod
downloadModForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const modName = document.getElementById('mod-name').value.trim();
  const modUrl = document.getElementById('mod-url').value.trim();

  if (!modName || !modUrl) {
    displayStatus('Please provide both Mod Name and Mod URL.', true);
    return;
  }

  if (!isValidURL(modUrl)) {
    displayStatus('Please provide a valid Mod URL.', true);
    return;
  }

  if (!isValidModName(modName)) {
    displayStatus('Mod Name contains invalid characters.', true);
    return;
  }

  if (!currentGameId) {
    displayStatus('No game selected for mod installation.', true);
    return;
  }

  // Show loading message
  displayStatus(`Downloading mod "${modName}"...`);

  window.electronAPI.downloadMod(currentGameId, modUrl, modName)
    .then(response => {
      if (response.success) {
        displayStatus(`Mod "${modName}" downloaded successfully.`);
        loadInstalledMods(currentGameId);
        downloadModForm.reset();
      } else {
        displayStatus(`Failed to download mod: ${response.message}`, true);
      }
    })
    .catch(err => {
      console.error('Error downloading mod:', err);
      displayStatus('Error downloading mod.', true);
    });
});

// Load moddable games
window.electronAPI.getModdableGames()
  .then(moddableGames => {
    moddableGames.forEach(game => {
      const modSection = document.createElement('div');
      modSection.classList.add('mod-section');

      const modHeader = document.createElement('h3');
      modHeader.textContent = `${game.name} Mods`;
      modSection.appendChild(modHeader);

      const manageModsButton = document.createElement('button');
      manageModsButton.textContent = 'Manage Mods';
      manageModsButton.addEventListener('click', () => {
        openModManager(game.id);
      });
      modSection.appendChild(manageModsButton);

      document.getElementById('game-library').appendChild(modSection);
    });
  })
  .catch(err => {
    console.error('Error loading moddable games:', err);
    displayStatus('Failed to load moddable games.', true);
  });

// Using the exposed electronAPI to load games
window.electronAPI.loadGames()
  .then(games => {
    games.forEach(game => {
      const li = document.createElement('li');
      li.textContent = game.name;
      li.addEventListener('click', async () => {
        try {
          li.classList.add('launching'); // Add launching state
          li.textContent += ' (Launching...)';
          await window.electronAPI.launchGame(game.path);
          statusMessageElement.textContent = `Launching ${game.name}...`;
          setTimeout(() => {
            li.classList.remove('launching');
            li.textContent = game.name;
          }, 3000); // Reset after 3 seconds
        } catch (error) {
          console.error('Error launching game:', error);
          li.textContent = 'Error launching game';
          statusMessageElement.textContent = 'Failed to launch the game.';
        }
      });
      gameListElement.appendChild(li);
    });
  })
  .catch(err => {
    console.error('Error loading games:', err);
    // Display an error message in the UI
    statusMessageElement.textContent = 'Failed to load game library.';
  });

// Function to check for updates (to be triggered manually or automatically)
function checkForUpdates() {
  window.electronAPI.checkUpdates()
    .then(response => {
      if (response.success) {
        const updates = response.updates;
        updates.forEach(update => {
          if (update.updateAvailable) {
            const li = document.createElement('li');
            li.classList.add('update-item');
            li.textContent = `${update.gameName} - v${update.latestVersion}`;

            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download Update';
            downloadButton.addEventListener('click', () => {
              downloadUpdate(update.gameId, update.gameName);
            });

            li.appendChild(downloadButton);
            updatesList.appendChild(li);
          }
        });

        if (updates.filter(u => u.updateAvailable).length === 0) {
          displayStatus('All games are up-to-date.');
        }
      } else {
        displayStatus(`Failed to check updates: ${response.message}`, true);
      }
    })
    .catch(err => {
      console.error('Error checking updates:', err);
      displayStatus('Error checking updates.', true);
    });
}

// Function to download updates
function downloadUpdate(gameId, gameName) {
  displayStatus(`Downloading update for "${gameName}"...`);
  
  window.electronAPI.downloadUpdate(gameId)
    .then(response => {
      if (response.success) {
        displayStatus(`Update for "${gameName}" downloaded successfully.`);
        // Prompt user to install the update
        const install = confirm(`An update for "${gameName}" is ready to install. Do you want to install it now?`);
        if (install) {
          // Implement installation logic, such as restarting the launcher or running an installer
          // For example:
          const { shell } = require('electron');
          shell.openPath(path.join(__dirname, 'updates', `${gameName}-update.zip`));
          // You may need to handle unzipping and replacing game files programmatically
        }
      } else {
        displayStatus(`Failed to download update: ${response.message}`, true);
      }
    })
    .catch(err => {
      console.error('Error downloading update:', err);
      displayStatus('Error downloading update.', true);
    });
}

// Event listener for Check Updates button
checkUpdatesButton.addEventListener('click', () => {
  updatesList.innerHTML = '';
  checkForUpdates();
});

// Trigger automatic update check on application start
window.addEventListener('DOMContentLoaded', () => {
  checkForUpdates();
});

const scanButton = document.getElementById('scan-games-button');
const scanningProgress = document.getElementById('scanning-progress');
const foundGamesList = document.getElementById('found-games-list');

scanButton.addEventListener('click', async () => {
    try {
        scanButton.disabled = true;
        scanningProgress.style.display = 'block';
        foundGamesList.innerHTML = '';

        const foundGames = await window.electronAPI.scanner.scanGames();
        
        foundGames.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.className = 'game-item';
            
            const gameInfo = document.createElement('div');
            gameInfo.innerHTML = `
                <strong>${game.name}</strong>
                <br>
                <small>${game.path}</small>
            `;

            const importButton = document.createElement('button');
            importButton.textContent = 'Import';
            importButton.addEventListener('click', async () => {
                try {
                    await window.electronAPI.scanner.importGame(game);
                    displayStatus(`Successfully imported ${game.name}`);
                    importButton.disabled = true;
                    importButton.textContent = 'Imported';
                } catch (error) {
                    displayStatus(`Failed to import ${game.name}`, true);
                }
            });

            gameElement.appendChild(gameInfo);
            gameElement.appendChild(importButton);
            foundGamesList.appendChild(gameElement);
        });

        displayStatus(`Found ${foundGames.length} games`);
    } catch (error) {
        displayStatus('Failed to scan for games', true);
        console.error('Scan failed:', error);
    } finally {
        scanButton.disabled = false;
        scanningProgress.style.display = 'none';
    }
});