# Streamline - Host Briefing Dashboard

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

Sebuah *dashboard briefing* internal yang dirancang sebagai *Proof of Concept* (PoC) 2 hari. Tujuan utamanya adalah untuk meningkatkan produktivitas dan mengurangi kesalahan operasional bagi Host Live Stream di PT Grand Meiga Indonesia (GMG Top Agency).

---

## 🚩 Latar Belakang & Masalah

Di lingkungan *e-commerce* yang serba cepat, Host Live Stream adalah ujung tombak penjualan. Namun, di PT Grand Meiga, proses *briefing* host saat ini tidak efisien:

* **Informasi Tersebar:** Jadwal, daftar produk, harga diskon, kode voucher, dan *talking points* dikirim secara manual melalui grup WhatsApp, spreadsheet, atau arahan lisan.
* **Risiko Kesalahan Tinggi:** Host berisiko salah menyebutkan harga, menggunakan kode voucher kedaluwarsa, atau melupakan promosi utama, yang berdampak langsung pada pendapatan dan kepercayaan pelanggan.
* **Waktu Terbuang:** Host menghabiskan waktu berharga sebelum siaran hanya untuk mengumpulkan dan memverifikasi informasi, alih-alih mempersiapkan materi siaran.

## 💡 Solusi: "Streamline"

**Streamline** adalah *dashboard* web internal *mobile-first* yang berfungsi sebagai **Single Source of Truth (SSOT)** untuk semua host.

Aplikasi ini menyederhanakan alur kerja host menjadi tiga langkah sederhana:
1.  **Login:** Host masuk ke sistem.
2.  **Lihat Jadwal:** Host melihat daftar jadwal siaran yang ditugaskan kepadanya untuk hari itu.
3.  **Akses & Konfirmasi:** Host membuka "Kartu Briefing" untuk melihat semua detail (produk, harga, skrip) dan menekan tombol "Saya Siap Siaran" sebagai tanda konfirmasi.

Solusi ini mengeliminasi kebingungan, mengurangi kesalahan krusial, dan memastikan host siap siaran dengan informasi yang akurat dalam hitungan detik.

## ✨ Fitur Utama (PoC)

* **Autentikasi Host:** Sistem login aman menggunakan JWT.
* **Dashboard Jadwal:** Menampilkan daftar jadwal *real-time* yang ditugaskan khusus untuk host yang login.
* **Modal Briefing Detail:** Satu klik untuk melihat semua informasi siaran:
    * Tema & Judul Siaran
    * Daftar Produk (SKU, Nama, Harga Asli, Harga Promo)
    * Daftar Poin Pembicaraan (Key Talking Points)
    * Daftar Kode Voucher Aktif
    * Target Penjualan Sesi
* **Fitur "Acknowledge":** Tombol konfirmasi ("Saya Siap Siaran") untuk memberi tahu manajer bahwa host telah membaca *briefing* dan siap.

## 💻 Tumpukan Teknologi (Tech Stack)

Proyek ini dibangun menggunakan arsitektur *Clean Architecture* sederhana (Routes -> Controllers -> Repositories) pada *backend*.

### Backend (`/server-bun-express`)
* **Runtime:** **Bun**
* **Package Manager:** **Bun**
* **Framework:** **Express.js**
* **Database:** **PostgreSQL**
* **ORM:** **Prisma**
* **Autentikasi:** JSON Web Token (JWT) & `bcryptjs`

### Frontend (`/client`)
* **Framework:** **Next.js** / **React** (Dapat disesuaikan)
* **Data Fetching:** `axios`
* **UI:** (Dapat menggunakan TailwindCSS, ChakraUI, atau lainnya)
