# Game Launcher Roadmap

This document outlines the roadmap for developing a Windows Game Launcher. The launcher will include features like opening games, modding capabilities, updating games, and common functionalities found in most game launchers.

## Features

### 1. **Core Features**
   - **Game Library Management**: Maintain a library of installed games.
   - **Game Launching**: Easily launch games directly from the launcher interface.
   - **Update Checker**: Check for and manage game updates.
   - **Mod Support**: Allow modding for games that support it.
   - **User Authentication**: Enable user login and secure session management.
   - **Settings**: Provide settings for custom configurations.

### 2. **Additional Features**
   - **Game News/Updates Feed**: Display recent updates or news related to installed games.
   - **Social Integration**: Basic social features like adding friends or seeing friends online.
   - **Achievements and Game Stats**: View achievements and track game stats.
   - **Automatic Cloud Saves**: Sync saves to cloud storage if applicable.
   - **Parental Controls**: Enable restricted access for certain games.
   - **Multi-Language Support**: Offer localization for different languages.

---

## Milestones

### Milestone 1: Basic Game Library and Launcher
   - **Develop Library Management**: Implement a simple game library interface.
   - **Add Game Launching Capability**: Enable the launcher to execute games.
   - **Basic UI Design**: Create a simple, user-friendly UI for the launcher.

### Milestone 2: Modding Support
   - **Identify Moddable Games**: [✓] Flag games that support mods.
   - **Implement Mod Management System**: [✓] Develop backend APIs and manage mod installations.
   - **UI for Modding Options**: [✓] Add a user-friendly interface for managing mods.

### Milestone 3: Update System
   - **Build Update Checker**: [✓] Implement a system to check for game updates.
   - **Automatic Update Option**: [✓] Allow users to enable or disable auto-updates.
   - **Manual Update Notifications**: [✓] Notify users of available updates.

### Milestone 4: User Account & Authentication
   - **User Login & Session**: Set up user accounts with login/logout functionality.
   - **Account Management**: Basic profile management options.
   - **Session Management**: Secure session handling.

### Milestone 5: Additional Functionalities
   - **Achievements and Game Stats Integration**: Track game achievements and display stats.
   - **Parental Controls and Multi-User Support**: Implement basic parental controls and user restrictions.
   - **Social Features**: Add a simple friends list and chat feature.

---

## Future Enhancements

- **In-Game Overlay**: Integrate an overlay for social features and achievements.
- **Cross-Platform Compatibility**: Expand to support Linux and macOS.
- **Enhanced UI and Theming**: Provide multiple themes and UI customization.
- **Performance Monitoring**: Track game performance, such as FPS and CPU/GPU usage.

---

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Electron or similar framework for desktop apps)
- **Backend**: Node.js for server-side functions, with optional integration of a database for user accounts and game management.
- **Database**: SQLite or similar lightweight database.
- **Modding Support**: Use Steam Workshop APIs or similar tools for supported games.
- **Update System**: Axios for HTTP requests, and custom scripts for handling updates.

---

## Development Timeline

1. **Week 1-4**: Basic UI and game library features.
2. **Week 5-8**: Game launching and modding support.
3. **Week 9-12**: Update system and user authentication.
4. **Week 13-16**: Additional functionalities, testing, and deployment.

---

## Notes

- Prioritize user experience and ease of access for non-technical users.
- Security is essential for user account management; consider using OAuth for secure authentication.
- Optimize the launcher for minimal CPU and RAM usage during idle states.

---

## References

- [Steamworks SDK](https://partner.steamgames.com/doc/sdk)
- [GOG Galaxy API](https://gog.com/galaxy)
- [Itch.io Integration Guide](https://itch.io/docs/itch/integrating/)

---

