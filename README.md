# Bucek Jarvis - AI Assistant Lokal untuk Windows

Bucek adalah AI assistant lokal yang berjalan di Windows menggunakan Ollama + Llama, dengan kemampuan voice recognition, text-to-speech, dan automation untuk membuka aplikasi.

## Fitur

✅ **Voice Commands** - Dengarkan perintah dengan wake word "Hey Bucek"
✅ **AI Response** - Proses perintah menggunakan Ollama Llama lokal
✅ **Text-to-Speech** - Bucek berbicara balik dalam Bahasa Indonesia
✅ **Aplikasi Launcher** - Buka semua aplikasi di laptop Anda
✅ **Auto-Start** - Ollama otomatis berjalan saat Windows boot
✅ **Auto-Restart** - Restart otomatis jika Ollama crash
✅ **Offline** - Sepenuhnya lokal, tanpa koneksi internet

## Requirement

- **Windows 10/11**
- **Node.js 16+** (https://nodejs.org/)
- **Ollama** (https://ollama.ai/)
- **Ollama Llama Model** (`ollama pull llama2`)
- **RAM minimal 6GB** (untuk Ollama Llama)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Ollama

```bash
ollama pull llama2
ollama serve
```

### 3. Run Bucek

```bash
npm start
```

### 4. Use Voice Commands

Katakan: **"Hey Bucek"** kemudian berikan perintah:
- "Buka Chrome"
- "Apa kabar?"
- "Buka folder Downloads"

## Dokumentasi Lengkap

- [Installation Guide](./INSTALLATION.md) - Panduan instalasi step-by-step
- [Usage Guide](./USAGE.md) - Cara menggunakan dan contoh perintah

## Struktur File

```
bucek-jarvis/
├── main.js                 # Entry point
├── package.json            # Dependencies
├── config.json             # Konfigurasi aplikasi
├── modules/
│   ├── voiceRecognition.js # Speech-to-text (Windows built-in)
│   ├── ollama.js           # Integration dengan Ollama
│   ├── textToSpeech.js     # Text-to-speech (Windows SAPI)
│   ├── appLauncher.js      # Buka aplikasi
│   └── autoStart.js        # Auto-start Ollama
├── INSTALLATION.md         # Panduan instalasi
├── USAGE.md               # Panduan penggunaan
└── README.md
```

## Konfigurasi

Edit `config.json` untuk:
- Menambah aplikasi
- Ubah wake word
- Sesuaikan memory allocation
- Ganti model Ollama

## Troubleshooting

### Ollama tidak jalan
```bash
ollama serve
```

### Microphone tidak terdeteksi
- Periksa sound settings di Windows
- Pastikan microphone terhubung dan aktif

### Speech Recognition tidak bekerja
- Update Windows ke versi terbaru
- Install Language Pack Indonesia

## License

MIT

## Support

Untuk bug report atau feature request, buat issue di repository ini.

---

**Made with ❤️ by Bucek**