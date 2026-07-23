/**
 * Application Launcher Module
 * Opens applications and folders based on voice commands
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class AppLauncher {
  constructor(config) {
    this.config = config;
    this.applications = config.applications || {};
    this.folders = config.folders || {};
  }

  /**
   * Process command and launch app/folder if needed
   */
  async processCommand(command) {
    const lowerCommand = command.toLowerCase();

    // Check for "buka" (open) commands
    if (!this.isOpenCommand(lowerCommand)) {
      return null;
    }

    // Extract app/folder name
    const appName = this.extractAppName(lowerCommand);
    
    if (!appName) {
      return 'Maaf, saya tidak tahu aplikasi atau folder apa yang ingin dibuka.';
    }

    try {
      await this.launchApplication(appName);
      return `Membuka ${appName}...`;
    } catch (error) {
      console.error(`[AppLauncher] Error launching ${appName}:`, error.message);
      return `Maaf, saya tidak bisa membuka ${appName}.`;
    }
  }

  /**
   * Check if command is an open/launch command
   */
  isOpenCommand(text) {
    const openKeywords = [
      'buka',
      'bukas',
      'bukain',
      'jalankan',
      'mulai',
      'tampilkan',
      'launch'
    ];

    return openKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Extract app/folder name from command
   */
  extractAppName(command) {
    const openKeywords = ['buka', 'bukas', 'bukain', 'jalankan', 'mulai', 'tampilkan', 'launch'];
    
    let appName = command;
    
    // Remove open keywords
    for (const keyword of openKeywords) {
      appName = appName.replace(keyword, '').trim();
    }

    // Remove common filler words
    appName = appName
      .replace('aplikasi', '')
      .replace('folder', '')
      .replace('file', '')
      .replace('di', '')
      .trim();

    return appName || null;
  }

  /**
   * Launch application or folder
   */
  async launchApplication(appName) {
    const normalizedName = appName.toLowerCase().trim();

    // Check if it's a known application
    for (const [key, path] of Object.entries(this.applications)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return this.executeApplication(path);
      }
    }

    // Check if it's a known folder
    for (const [key, folderPath] of Object.entries(this.folders)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return this.openFolder(folderPath);
      }
    }

    // Try to find and launch by name (scan Program Files, AppData)
    return this.searchAndLaunchApp(appName);
  }

  /**
   * Execute an application
   */
  executeApplication(appPath) {
    return new Promise((resolve, reject) => {
      try {
        if (process.platform === 'win32') {
          // Check if file exists
          if (fs.existsSync(appPath)) {
            const proc = spawn(appPath, {
              detached: true,
              stdio: 'ignore'
            });
            proc.unref();
            resolve();
          } else {
            // Try to execute by name (for system apps)
            exec(`start "" "${appPath}"`, (error) => {
              if (error) reject(error);
              else resolve();
            });
          }
        } else {
          exec(`open "${appPath}"`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Open folder in Explorer
   */
  openFolder(folderPath) {
    return new Promise((resolve, reject) => {
      try {
        // Expand environment variables
        const expandedPath = this.expandPath(folderPath);

        if (process.platform === 'win32') {
          exec(`explorer "${expandedPath}"`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        } else {
          exec(`open "${expandedPath}"`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Expand Windows environment variables
   */
  expandPath(folderPath) {
    return folderPath
      .replace('%USERPROFILE%', os.homedir())
      .replace('~', os.homedir());
  }

  /**
   * Search for application in common locations
   */
  async searchAndLaunchApp(appName) {
    return new Promise((resolve, reject) => {
      try {
        // Try common locations
        const commonPaths = [
          path.join('C:\\Program Files', `${appName}.exe`),
          path.join('C:\\Program Files (x86)', `${appName}.exe`),
          path.join(os.homedir(), 'AppData\\Local\\Programs', appName, `${appName}.exe`),
          path.join(os.homedir(), 'AppData\\Roaming', appName, `${appName}.exe`),
          `${appName}.exe` // System PATH
        ];

        for (const fullPath of commonPaths) {
          if (fs.existsSync(fullPath)) {
            const proc = spawn(fullPath, {
              detached: true,
              stdio: 'ignore'
            });
            proc.unref();
            resolve();
            return;
          }
        }

        // If not found, try to execute by name (Windows will search PATH)
        exec(`start "" "${appName}"`, (error) => {
          if (error) reject(new Error(`Aplikasi "${appName}" tidak ditemukan`));
          else resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get list of available apps
   */
  getAvailableApps() {
    return {
      applications: Object.keys(this.applications),
      folders: Object.keys(this.folders)
    };
  }
}

module.exports = AppLauncher;