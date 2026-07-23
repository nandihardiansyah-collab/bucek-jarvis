/**
 * Text-to-Speech Module
 * Uses Windows SAPI (Speech API) for Indonesian text-to-speech
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TextToSpeech {
  constructor(config) {
    this.config = config;
    this.language = config.tts.language || 'id-ID';
    this.voice = config.tts.voice || 'Microsoft Zira Desktop';
  }

  /**
   * Speak text using Windows SAPI
   */
  async speak(text) {
    return new Promise((resolve, reject) => {
      try {
        // Clean text
        text = this.cleanText(text);
        
        if (!text || text.length === 0) {
          resolve();
          return;
        }

        console.log(`[TTS] Speaking: ${text}`);

        // Create PowerShell script for TTS
        const script = this.createTTSScript(text);
        const tempScriptPath = path.join(__dirname, '..', 'temp_tts.ps1');
        
        fs.writeFileSync(tempScriptPath, script);

        // Execute PowerShell script
        const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempScriptPath], {
          stdio: 'pipe'
        });

        ps.on('close', (code) => {
          // Clean up temp script
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            // Ignore cleanup errors
          }

          resolve();
        });

        ps.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create PowerShell script for Windows Speech Synthesis
   */
  createTTSScript(text) {
    // Escape single quotes in text
    const escapedText = text.replace(/'/g, "''");
    
    return `
Add-Type -AssemblyName System.Speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Volume = 100
$speak.Rate = -1  # Slower speech for clarity

# Set voice if available
try {
    $speak.SelectVoice('Microsoft Zira Desktop')
} catch {
    # Use default if specific voice not available
}

$text = @'
${escapedText}
'@

$speak.Speak($text)
$speak.Dispose()
`;
  }

  /**
   * Clean text for better TTS
   */
  cleanText(text) {
    if (!text) return '';

    // Remove markdown symbols
    text = text.replace(/[\*\#\_\`\~]/g, '');
    
    // Remove extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove special characters that might cause issues
    text = text.replace(/[^\w\s.,!?;:\-()]/g, '');
    
    // Limit length (TTS can be slow for very long text)
    if (text.length > 500) {
      text = text.substring(0, 500) + '...';
    }

    return text;
  }

  /**
   * Get available voices
   */
  async getAvailableVoices() {
    return new Promise((resolve, reject) => {
      try {
        const script = `
Add-Type -AssemblyName System.Speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.GetInstalledVoices() | ForEach-Object { Write-Host $_.VoiceInfo.Name }
`;
        
        const tempScriptPath = path.join(__dirname, '..', 'temp_voices.ps1');
        fs.writeFileSync(tempScriptPath, script);

        const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempScriptPath]);
        
        let output = '';
        
        ps.stdout.on('data', (data) => {
          output += data.toString();
        });

        ps.on('close', () => {
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {}
          
          const voices = output.split('\n').filter(v => v.trim());
          resolve(voices);
        });

        ps.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = TextToSpeech;