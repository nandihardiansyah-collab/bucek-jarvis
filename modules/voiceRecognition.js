/**
 * Voice Recognition Module
 * Uses Windows built-in Speech Recognition (SAPI)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class VoiceRecognition {
  constructor(config) {
    this.config = config;
    this.language = config.voice.recognitionLanguage || 'id-ID';
    this.wakeWord = config.voice.wakeWord.toLowerCase();
  }

  /**
   * Listen for voice input using Windows Speech Recognition
   * Returns recognized text
   */
  async listen() {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary PowerShell script for speech recognition
        const script = this.createSpeechScript();
        const tempScriptPath = path.join(__dirname, '..', 'temp_speech.ps1');
        
        fs.writeFileSync(tempScriptPath, script);

        // Execute PowerShell script
        const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempScriptPath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        ps.stdout.on('data', (data) => {
          output += data.toString();
        });

        ps.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        ps.on('close', (code) => {
          // Clean up temp script
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            // Ignore cleanup errors
          }

          if (code === 0 && output.trim()) {
            const recognizedText = output.trim();
            console.log(`[VoiceRec] Recognized: ${recognizedText}`);
            resolve(recognizedText);
          } else {
            resolve(null);
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create PowerShell script for Windows Speech Recognition
   */
  createSpeechScript() {
    return `
Add-Type -AssemblyName System.Speech
$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$recognizer.SetInputToDefaultAudioDevice()
$grammar = New-Object System.Speech.Recognition.DictationGrammar
$recognizer.LoadGrammar($grammar)

Write-Host "🎤 Listening..." -ForegroundColor Green

$result = $recognizer.Recognize()

if ($result -and $result.Confidence -gt 0.5) {
    Write-Host $result.Text
} else {
    Write-Host ""
}
`;
  }

  /**
   * Simple wake word detection
   */
  isWakeWordDetected(text) {
    const lowerText = text.toLowerCase();
    return lowerText.includes(this.wakeWord);
  }
}

module.exports = VoiceRecognition;