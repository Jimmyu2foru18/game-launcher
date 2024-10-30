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