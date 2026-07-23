# Panduan Instalasi Bucek Jarvis

## Requirement

- **Windows 10/11** dengan microphone
- **Node.js 16+** https://nodejs.org/
- **Ollama** https://ollama.ai/
- **RAM minimal 6GB**
- **Koneksi internet** (hanya untuk instalasi pertama)

## Step-by-Step Installation

### 1. Install Ollama

1. Download Ollama dari https://ollama.ai/
2. Jalankan installer dan ikuti instruksi
3. Buka Command Prompt / PowerShell
4. Pull model Llama:
   ```bash
   ollama pull llama2
   ```
   Tunggu hingga selesai (ukuran ~4GB)

5. Test Ollama:
   ```bash
   ollama serve
   ```
   Jika berhasil, Anda akan melihat:
   ```
   2024/01/15 10:30:00 listening on 127.0.0.1:11434
   ```

6. Tekan `Ctrl+C` untuk stop (Ollama akan auto-start nanti)

### 2. Install Node.js

1. Download Node.js LTS dari https://nodejs.org/
2. Jalankan installer dan pilih:
   - ✓ Add to PATH
   - ✓ Install npm
3. Verifikasi instalasi:
   ```bash
   node --version
   npm --version
   ```

### 3. Setup Bucek Jarvis

1. Clone atau extract repository:
   ```bash
   git clone <repo-url>
   cd bucek-jarvis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Edit `config.json` dan sesuaikan:
   - Username di path aplikasi
   - Path aplikasi yang ingin dibuka
   - GPU memory allocation

### 4. Setup Auto-Start (Optional)

Agar Ollama auto-start saat Windows boot:

```bash
node setup-autostart.js
```

Atau manual:
1. Buat folder startup shortcut jika belum ada:
   ```
   C:\Users\YourUsername\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
   ```

2. Buat file `ollama-startup.bat`:
   ```batch
   @echo off
   start /B ollama serve
   ```

3. Copy file ke startup folder

### 5. Setup Microphone (Windows)

1. **Test microphone:**
   - Buka Settings > Sound
   - Cek "Input" - microphone terdeteksi?
   - Click "Volume meter" dan bicara - ada bar bergerak?

2. **Install Language Pack Indonesia (jika perlu):**
   - Settings > Time & Language > Language
   - Click "+" untuk tambah bahasa
   - Pilih "Bahasa Indonesia"
   - Download language pack

3. **Test Speech Recognition:**
   - Settings > Ease of Access > Speech Recognition
   - Click "Start Speech Recognition"
   - Katakan: "Hey Bucek"

## Menjalankan Bucek

### Terminal Method:

```bash
npm start
```

atau

```bash
node main.js
```

Anda akan melihat:
```
🎤 Bucek Jarvis sedang memulai...
✓ Menghubungkan ke Ollama...
✓ Ollama terkoneksi!
👂 Mendengarkan "Hey Bucek"...
```

### Menggunakan Bucek:

1. **Tunggu beep** atau "Mendengarkan" message
2. **Katakan "Hey Bucek"** ke microphone
3. **Tunggu beep lagi** (siap menerima perintah)
4. **Berikan perintah**, contoh:
   - "Buka Chrome"
   - "Buka Notepad"
   - "Apa kabar?"
   - "Buka folder Downloads"
   - "Tampilkan waktu"

5. **Bucek akan merespons** dengan suara

## Troubleshooting

### Problem: "Ollama tidak terhubung"

**Solusi:**
```bash
ollama serve
```
(jalankan di terminal terpisah)

### Problem: Microphone tidak terdeteksi

**Solusi:**
1. Cek Settings > Sound > Input
2. Test microphone Windows built-in:
   - Buka Cortana
   - Click microphone icon
   - Bicara untuk test

### Problem: Speech Recognition tidak bekerja

**Solusi:**
1. Update Windows ke versi terbaru
2. Install Language Pack Indonesia
3. Test Windows Speech Recognition:
   - Settings > Ease of Access > Speech Recognition

### Problem: Bahasa Indonesia tidak dikenali

**Solusi:**
1. Pastikan sudah install Language Pack Indonesia
2. Set Windows language ke "Bahasa Indonesia"
3. Update language files:
   - Settings > Time & Language > Language
   - Click "Bahasa Indonesia"
   - Click "Options"
   - Download speech recognition

### Problem: RAM penuh / lag

**Solusi:**
1. Edit `config.json`:
   ```json
   "ollama": {
     "maxMemory": 4096
   }
   ```

2. Tutup aplikasi lain (browser, IDE, dll)

3. Gunakan model lebih kecil:
   ```bash
   ollama pull mistral
   ```
   Kemudian ubah di config.json:
   ```json
   "model": "mistral"
   ```

### Problem: Ollama crash / error

**Solusi:**
```bash
# Stop Ollama
taskkill /F /IM ollama.exe

# Restart
ollama serve
```

## Tips & Tricks

1. **Perintah yang lebih natural:**
   - "Hey Bucek, buka Visual Studio Code"
   - "Halo Bucek, apa kabar?"
   - "Bucek, buka folder Downloads"

2. **Debugging:**
   - Edit `config.json`, set `"debug": true`
   - Lihat console output untuk error details

3. **Menambah aplikasi:**
   - Edit `config.json` section `"applications"`
   - Tambah path aplikasi baru

4. **Custom perintah:**
   - Edit `modules/appLauncher.js` untuk custom logic
   - Contoh: schedule, automation, dll

## Support

Jika ada masalah:
1. Check error message di console
2. Lihat `troubleshooting` section di atas
3. Buat issue di GitHub repository

---

**Selamat menggunakan Bucek Jarvis!** 🎉