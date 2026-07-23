#!/usr/bin/env node

/**
 * Bucek Jarvis - AI Assistant Lokal
 * Main entry point
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const VoiceRecognition = require('./modules/voiceRecognition');
const Ollama = require('./modules/ollama');
const TextToSpeech = require('./modules/textToSpeech');
const AppLauncher = require('./modules/appLauncher');
const AutoStart = require('./modules/autoStart');

// Load config
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

class Bucek {
  constructor() {
    this.config = config;
    this.voiceRec = new VoiceRecognition(config);
    this.ollama = new Ollama(config);
    this.tts = new TextToSpeech(config);
    this.appLauncher = new AppLauncher(config);
    this.autoStart = new AutoStart(config);
    this.isListening = false;
    this.ollamaProcess = null;
  }

  async init() {
    console.log('🎤 Bucek Jarvis sedang memulai...\n');

    try {
      // Start Ollama
      await this.startOllama();
      
      // Test Ollama connection
      console.log('✓ Menghubungkan ke Ollama...');
      await this.ollama.testConnection();
      console.log('✓ Ollama terkoneksi!\n');

      // Welcome message
      await this.tts.speak('Halo! Aku Bucek, asisten virtual Anda. Silakan katakan "Hey Bucek" untuk memulai.');
      
      // Start listening
      this.startListening();

    } catch (error) {
      console.error('❌ Error saat inisialisasi:', error.message);
      process.exit(1);
    }
  }

  async startOllama() {
    try {
      // Check if Ollama is already running
      const isRunning = await this.ollama.isRunning();
      if (isRunning) {
        console.log('✓ Ollama sudah berjalan');
        return;
      }

      console.log('⏳ Memulai Ollama...');
      
      if (process.platform === 'win32') {
        this.ollamaProcess = spawn('ollama', ['serve'], {
          detached: true,
          stdio: 'ignore'
        });
        this.ollamaProcess.unref();
      } else {
        this.ollamaProcess = spawn('ollama', ['serve']);
      }

      // Wait for Ollama to start
      await this.wait(3000);
      console.log('✓ Ollama dimulai');

    } catch (error) {
      console.error('❌ Error memulai Ollama:', error.message);
      throw error;
    }
  }

  startListening() {
    console.log('\n👂 Mendengarkan "Hey Bucek"...\n');
    this.isListening = true;

    // Use polling instead of event-based since Windows Speech API is limited
    this.voiceRecognitionLoop();
  }

  async voiceRecognitionLoop() {
    while (this.isListening) {
      try {
        const text = await this.voiceRec.listen();
        
        if (text) {
          console.log(`\n🗣️  Anda: ${text}`);

          // Check for wake word
          if (this.containsWakeWord(text)) {
            await this.handleCommand(text);
          }
        }

        // Small delay to prevent CPU spinning
        await this.wait(500);

      } catch (error) {
        console.error('❌ Error voice recognition:', error.message);
        await this.wait(1000);
      }
    }
  }

  containsWakeWord(text) {
    const lowerText = text.toLowerCase();
    const wakeWords = [
      'hey bucek',
      'halo bucek',
      'bucek',
      'hai bucek'
    ];
    
    return wakeWords.some(word => lowerText.includes(word));
  }

  async handleCommand(text) {
    try {
      // Remove wake word
      let command = text.toLowerCase()
        .replace('hey bucek', '')
        .replace('halo bucek', '')
        .replace('hai bucek', '')
        .replace('bucek', '')
        .trim();

      if (!command) {
        console.log('⚠️  Perintah kosong');
        return;
      }

      // Check for app launch commands
      const appResponse = await this.appLauncher.processCommand(command);
      if (appResponse) {
        console.log(`🤖 Bucek: ${appResponse}`);
        await this.tts.speak(appResponse);
        return;
      }

      // Send to Ollama AI
      console.log('⏳ Bucek berpikir...');
      const response = await this.ollama.query(command);
      
      if (response) {
        console.log(`🤖 Bucek: ${response}`);
        await this.tts.speak(response);
      }

    } catch (error) {
      console.error('❌ Error handling command:', error.message);
      await this.tts.speak('Maaf, ada kesalahan. Silakan coba lagi.');
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stop() {
    console.log('\n\n👋 Menghentikan Bucek...');
    this.isListening = false;
    
    if (this.ollamaProcess) {
      this.ollamaProcess.kill();
    }

    process.exit(0);
  }
}

// Main execution
const bucek = new Bucek();

// Handle graceful shutdown
process.on('SIGINT', () => bucek.stop());
process.on('SIGTERM', () => bucek.stop());

// Start Bucek
bucek.init().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});