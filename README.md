# Game Launcher

A modern, feature-rich game launcher built with Electron, designed to manage your game library, mods, and updates efficiently.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Building](#building)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

- 🎮 **Game Library Management**
  - Automatic game detection across your system
  - Easy game launching and management
  - Track playtime and game statistics

- 🔧 **Mod Support**
  - Download and install mods
  - Manage mod configurations
  - Automatic mod compatibility checking

- 🔄 **Update System**
  - Automatic game updates detection
  - Manual and automatic update options
  - Version tracking and rollback support

- 👥 **User Management**
  - User accounts and profiles
  - Game preferences synchronization
  - Playtime tracking

- 🔒 **Parental Controls**
  - Age-appropriate content filtering
  - Game time limits
  - Activity monitoring

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 16.20.0 (LTS)
  ```bash
  # Check Node.js version
  node --version
  ```

- **Visual Studio Build Tools 2022**
  - Download from: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
  - Required Components:
    - Desktop development with C++
    - Node.js development
    - Windows 10/11 SDK

- **Git**: Latest version
  ```bash
  # Check Git version
  git --version
  ```

- **Windows**: 10 or 11 (64-bit)

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Jimmyu2foru18/game-launcher.git
   cd game-launcher
   ```

2. **Install Dependencies**
   ```bash
   # Clean install
   npm ci

   # If npm ci fails, try:
   npm install
   ```

3. **Create Required Directories**
   ```bash
   mkdir data logs games mods temp
   ```

4. **Configure Environment**
   ```bash
   # Create .env file
   echo "NODE_ENV=development" > .env
   ```

5. **Initialize Database**
   ```bash
   # The database will be automatically initialized on first run
   npm start
   ```

## Development Setup

1. **Install Development Tools**
   ```bash
   npm install -g electron-builder electron-rebuild
   ```

2. **Setup Development Environment**
   ```bash
   # Install dev dependencies
   npm install --save-dev

   # Rebuild native modules
   npm run rebuild
   ```

3. **Run in Development Mode**
   ```bash
   npm run dev
   ```

## Building

1. **Prepare for Build**
   ```bash
   # Clean previous builds
   rm -rf dist/
   
   # Install dependencies
   npm ci
   ```

2. **Build the Application**
   ```bash
   # For Windows
   npm run build

   # The built application will be in the dist/ directory
   ```

3. **Build Options**
   ```bash
   # Build for specific platform
   npm run build -- --win # Windows
   npm run build -- --mac # macOS (requires macOS)
   npm run build -- --linux # Linux
   ```

## Project Structure
## Project Structure

```plaintext
game-launcher/
├── src/                      # Source code
│   ├── main/                 # Main process files
│   │   ├── main.js          # Main application entry
│   │   ├── ipc-handlers.js  # IPC communication handlers
│   │   ├── window-manager.js # Window management
│   │   └── app-check.js     # Application requirements checker
│   │
│   ├── services/            # Core services
│   │   ├── game-manager.js  # Game management service
│   │   ├── mod-manager.js   # Mod management service
│   │   ├── game-scanner.js  # Game detection service
│   │   ├── auth-service.js  # Authentication service
│   │   ├── update-checker.js # Update management
│   │   ├── stats-service.js # Game statistics tracking
│   │   ├── settings-manager.js # User settings management
│   │   └── parental-control.js # Parental controls service
│   │
│   ├── utils/               # Utility functions and helpers
│   │   ├── logger.js        # Logging utility
│   │   ├── constants.js     # Application constants
│   │   ├── validators.js    # Input validation
│   │   ├── error-handler.js # Error handling utility
│   │   ├── error-types.js   # Custom error definitions
│   │   ├── config-manager.js # Configuration management
│   │   └── performance-monitor.js # Performance tracking
│   │
│   ├── database/           # Database management
│   │   └── db-manager.js   # SQLite database manager
│   │
│   ├── preload/           # Preload scripts
│   │   └── preload.js     # Electron preload script
│   │
│   └── config/            # Application configuration
│       └── app.config.js  # Main configuration file
│
├── assets/                # Static assets
│   ├── styles/           # CSS styles
│   │   └── styles.css    # Main stylesheet
│   ├── images/           # Image assets
│   └── icons/            # Application icons
│
├── config/               # Configuration files
│   └── games.json       # Games library configuration
│
├── data/                # Application data
│   ├── launcher.db      # SQLite database
│   └── backups/         # Database backups
│
├── logs/                # Application logs
│   ├── error.log        # Error logs
│   └── combined.log     # Combined logs
│
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── setup.js        # Test setup file
│
├── docs/                # Documentation
│   ├── api/            # API documentation
│   └── guides/         # User guides
│
├── .github/             # GitHub specific files
│   ├── workflows/       # GitHub Actions
│   │   └── ci.yml      # CI configuration
│   ├── ISSUE_TEMPLATE/ # Issue templates
│   └── CONTRIBUTING.md # Contribution guidelines
│
├── node_modules/        # Dependencies (git-ignored)
├── dist/               # Built application (git-ignored)
├── .gitignore         # Git ignore file
├── .env               # Environment variables
├── .eslintrc.js       # ESLint configuration
├── jest.config.js     # Jest test configuration
├── package.json       # Project manifest
├── package-lock.json  # Dependency lock file
├── LICENSE           # License file
└── README.md         # Project documentation
```

### Key Components

#### 1. Main Process (`src/main/`)
- **main.js**: Application entry point
- **ipc-handlers.js**: Inter-process communication
- **window-manager.js**: Window management
- **app-check.js**: System requirements verification

#### 2. Services (`src/services/`)
- **game-manager.js**: Game library management
- **mod-manager.js**: Mod installation and management
- **game-scanner.js**: Game detection and import
- **auth-service.js**: User authentication
- **update-checker.js**: Game updates management
- **stats-service.js**: Game statistics
- **settings-manager.js**: User preferences
- **parental-control.js**: Access control

#### 3. Utilities (`src/utils/`)
- **logger.js**: Application logging
- **constants.js**: Global constants
- **validators.js**: Input validation
- **error-handler.js**: Error management
- **error-types.js**: Custom errors
- **config-manager.js**: Configuration
- **performance-monitor.js**: Performance tracking

#### 4. Database (`src/database/`)
- **db-manager.js**: SQLite database operations

#### 5. Configuration (`config/`)
- **games.json**: Game library data
- Environment configurations

#### 6. Assets
- Stylesheets
- Images
- Icons
- Other static resources

#### 7. Development Tools
- ESLint configuration
- Jest test setup
- GitHub workflows
- Documentation

### File Purposes

1. **Core Application Files**
   - `main.js`: Electron main process
   - `preload.js`: Secure IPC bridge
   - `index.html`: Main window layout

2. **Configuration Files**
   - `.env`: Environment variables
   - `package.json`: Project configuration
   - `.eslintrc.js`: Code style rules

3. **Documentation**
   - `README.md`: Project documentation
   - `LICENSE`: Legal information
   - `CONTRIBUTING.md`: Contribution guidelines

4. **Build Outputs**
   - `dist/`: Compiled application
   - `logs/`: Application logs
   - `data/`: Runtime data

### Development Workflow

1. **Source Code**
   - Write code in `src/`
   - Follow modular architecture
   - Maintain separation of concerns

2. **Testing**
   - Unit tests in `tests/unit/`
   - Integration tests in `tests/integration/`
   - Run with `npm test`

3. **Building**
   - Development: `npm run dev`
   - Production: `npm run build`

4. **Documentation**
   - Update docs in `docs/`
   - Maintain API documentation
   - Keep README.md current