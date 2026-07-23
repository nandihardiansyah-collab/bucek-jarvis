/**
 * Auto-Start Module
 * Handles Ollama auto-start on Windows boot and crash recovery
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class AutoStart {
  constructor(config) {
    this.config = config;
    this.ollamaCheckInterval = config.system.checkInterval || 5000;
    this.isMonitoring = false;
  }

  /**
   * Setup auto-start on Windows boot
   */
  setupAutoStart() {
    if (process.platform !== 'win32') {
      console.log('[AutoStart] Platform bukan Windows, skip setup');
      return;
    }

    try {
      const startupDir = path.join(
        os.homedir(),
        'AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup'
      );

      const batchFile = path.join(startupDir, 'bucek-ollama-startup.bat');
      const batchContent = this.generateStartupBatch();

      fs.writeFileSync(batchFile, batchContent);
      console.log(`✓ Auto-start setup di: ${batchFile}`);

      return batchFile;
    } catch (error) {
      console.error('[AutoStart] Error setting up auto-start:', error.message);
      throw error;
    }
  }

  /**
   * Generate startup batch file
   */
  generateStartupBatch() {
    return `@echo off
REM Bucek Ollama Auto-Start
REM This file starts Ollama service on Windows boot

echo Starting Ollama...
start /B ollama serve

REM Wait for Ollama to initialize
timeout /t 3 /nobreak

REM (Optional) Start Bucek application
REM cd ${__dirname}
REM npm start
`;
  }

  /**
   * Start monitoring Ollama health
   */
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    console.log('[AutoStart] Memulai monitoring Ollama...');
    this.isMonitoring = true;

    this.monitoringLoop();
  }

  /**
   * Monitoring loop - check if Ollama is running
   */
  async monitoringLoop() {
    while (this.isMonitoring) {
      try {
        const isRunning = await this.checkOllamaHealth();

        if (!isRunning && this.config.system.autoRestartOllama) {
          console.log('⚠️  Ollama tidak berjalan, restart otomatis...');
          await this.restartOllama();
        }

        await this.wait(this.ollamaCheckInterval);

      } catch (error) {
        console.error('[AutoStart] Monitoring error:', error.message);
        await this.wait(this.ollamaCheckInterval);
      }
    }
  }

  /**
   * Check if Ollama is healthy
   */
  async checkOllamaHealth() {
    return new Promise((resolve) => {
      const http = require('http');
      
      const options = {
        hostname: this.config.ollama.host,
        port: this.config.ollama.port,
        path: '/api/tags',
        method: 'GET',
        timeout: 2000
      };

      const req = http.request(options, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.abort();
        resolve(false);
      });

      req.end();
    });
  }

  /**
   * Restart Ollama service
   */
  async restartOllama() {
    return new Promise((resolve, reject) => {
      try {
        if (process.platform === 'win32') {
          // Kill existing Ollama processes
          exec('taskkill /F /IM ollama.exe', { stdio: 'ignore' }, () => {
            // Wait and restart
            setTimeout(() => {
              const proc = spawn('ollama', ['serve'], {
                detached: true,
                stdio: 'ignore'
              });
              proc.unref();
              console.log('✓ Ollama restarted');
              resolve();
            }, 2000);
          });
        } else {
          exec('pkill -f ollama', () => {
            setTimeout(() => {
              const proc = spawn('ollama', ['serve']);
              console.log('✓ Ollama restarted');
              resolve();
            }, 2000);
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    console.log('[AutoStart] Menghentikan monitoring Ollama');
    this.isMonitoring = false;
  }

  /**
   * Get auto-start status
   */
  getAutoStartStatus() {
    if (process.platform !== 'win32') {
      return { enabled: false, reason: 'Platform bukan Windows' };
    }

    try {
      const startupDir = path.join(
        os.homedir(),
        'AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup'
      );
      const batchFile = path.join(startupDir, 'bucek-ollama-startup.bat');

      return {
        enabled: fs.existsSync(batchFile),
        path: batchFile
      };
    } catch (error) {
      return { enabled: false, error: error.message };
    }
  }

  /**
   * Helper: wait function
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AutoStart;