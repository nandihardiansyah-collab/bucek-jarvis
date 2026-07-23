# Panduan Penggunaan Bucek Jarvis

## Quick Start

### 1. Pastikan Ollama Berjalan

Buka Command Prompt dan jalankan:
```bash
ollama serve
```

Atau jika sudah setup auto-start, Ollama akan auto-start saat boot.

### 2. Jalankan Bucek

```bash
npm start
```

Anda akan melihat:
```
🎤 Bucek Jarvis sedang memulai...
✓ Menghubungkan ke Ollama...
✓ Ollama terkoneksi!
👂 Mendengarkan "Hey Bucek"...
```

### 3. Gunakan Voice Commands

- **Katakan:** "Hey Bucek" (atau "Halo Bucek")
- **Dengarkan:** Beep singkat = siap terima perintah
- **Perintah:** "Buka Chrome", "Apa itu AI?", dll
- **Respons:** Bucek akan menjawab dengan suara

---

## Contoh Perintah

### 1. Buka Aplikasi

```
"Buka Chrome"
"Buka Notepad"
"Buka Visual Studio Code"
"Jalankan Discord"
"Mulai Telegram"
"Bukain Spotify"
```

Aplikasi yang tersedia (default):
- Chrome
- Firefox
- Notepad
- VSCode
- Discord
- Telegram
- Spotify
- Excel
- PowerPoint
- Calculator
- Paint
- VLC
- Dan lainnya...

### 2. Buka Folder

```
"Buka Downloads"
"Buka Documents"
"Tampilkan Desktop"
"Buka Pictures"
"Akses Music folder"
```

### 3. Tanya ke AI

```
"Apa itu machine learning?"
"Jelaskan cara kerja AI"
"Siapa nama Anda?"
"Apa cuaca hari ini?"
"Berapa 2 + 2?"
"Siapa presiden Indonesia?"
"Apa kabar?"
```

### 4. Kombinasi

```
"Buka Chrome dan ke website Google"
"Jalankan Notepad dan buat file baru"
"Bukain folder Downloads"
```

---

## Perintah Sistem

### Hentikan Bucek

Tekan `Ctrl+C` di terminal untuk stop Bucek.

### Mode Debug

Edit `config.json`:
```json
"system": {
  "debug": true
}
```

Kemudian jalankan:
```bash
npm run dev
```

### Lihat Status Ollama

```bash
curl http://localhost:11434/api/tags
```

---

## Kustomisasi

### Tambah Aplikasi

Edit `config.json`, section `applications`:

```json
"applications": {
  "myapp": "C:\\path\\to\\myapp.exe",
  "anotherapp": "C:\\Program Files\\AnotherApp\\app.exe"
}
```

Kemudian gunakan:
```
"Buka myapp"
```

### Ubah Wake Word

Edit `config.json`:

```json
"voice": {
  "wakeWord": "halo bucek"
}
```

Opsi lain:
- "hey bucek"
- "hai bucek"
- "bucek"
- "dengar bucek"

### Ubah Kecepatan Bicara

Edit `modules/textToSpeech.js`, cari:

```javascript
$speak.Rate = -1  # -10 (sangat lambat) sampai +10 (sangat cepat)
```

- `-1` = normal (recommended)
- `-5` = sangat lambat
- `+5` = cepat

### Ubah Model Ollama

Edit `config.json`:

```json
"ollama": {
  "model": "mistral"
}
```

Model tersedia:
- `llama2` - Powerful, tapi butuh banyak RAM (recommended)
- `mistral` - Lebih ringan, lebih cepat
- `neural-chat` - Balanced
- `dolphin-mixtral` - Advanced (butuh GPU)

Pull model baru:
```bash
ollama pull mistral
```

### Ubah Memory Allocation

Edit `config.json`:

```json
"ollama": {
  "maxMemory": 4096  # 4GB (untuk RAM terbatas)
}
```

---

## Advanced Usage

### Akses Web Interface

Buka browser ke:
```
http://localhost:11434/api/tags
```

Untuk melihat model dan info Ollama.

### Streaming Response

Edit `main.js` dan uncomment section streaming untuk response real-time:

```javascript
// const response = await this.ollama.query(command);
// Uncomment untuk streaming:
// for await (const chunk of this.ollama.queryStream(command)) {
//   process.stdout.write(chunk);
// }
```

### Custom AI Personality

Edit `modules/ollama.js`, ubah `systemPrompt`:

```javascript
const systemPrompt = `Anda adalah Bucek, asisten yang...
[Sesuaikan personality sesuai keinginan]`;
```

---

## Best Practices

### 1. Microphone

- Gunakan microphone berkualitas baik (noise reduction)
- Kurangi background noise
- Bicara dengan jelas dan normal

### 2. Performance

- Tutup aplikasi berat saat menggunakan Bucek
- Jangan buka terlalu banyak tab browser
- Alokasikan RAM yang cukup untuk Ollama

### 3. Bahasa

- Gunakan Bahasa Indonesia yang jelas
- Hindari slang yang aneh
- Bicara normal, tidak terlalu cepat atau lambat

### 4. Offline Mode

- Bucek 100% offline (no internet needed)
- Semua proses lokal di komputer Anda
- Privacy terjamin!

---

## FAQ

### Q: Apakah Bucek bisa offline?
A: Ya! Bucek sepenuhnya offline. Tidak ada data yang dikirim ke cloud.

### Q: Berapa resource yang dibutuhkan?
A: Minimal 6GB RAM untuk Llama2. Untuk model lebih kecil bisa 4GB.

### Q: Apakah bisa di Linux/Mac?
A: Kode sudah support, tapi speech recognition Windows-only. Bisa diadapt untuk platform lain.

### Q: Apakah Bucek bisa belajar?
A: Tidak. Tapi Anda bisa customize personality dan perintahnya di config.

### Q: Apakah bisa integrate dengan layanan lain?
A: Ya! Bisa dikembangkan untuk integrate dengan API, webhook, dll.

---

## Kontribusi

Punya ide atau perbaikan? Buat pull request!

---

**Enjoy using Bucek Jarvis!** 🎉