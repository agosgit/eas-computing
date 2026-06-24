# FlavorForge 🍳 - Meal Finder & Recipe Book App

FlavorForge adalah aplikasi mobile berbasis **React Native (Expo v54)** yang dirancang untuk membantu pengguna menemukan resep kuliner terbaik dari seluruh dunia dan mengelola buku resep (*Cookbook*) pribadi mereka. 

Aplikasi ini mengintegrasikan **The MealDB API** menggunakan **Axios** untuk penarikan data resep secara dinamis, serta **Firebase** untuk Autentikasi Pengguna dan penyimpanan database cloud (*Cloud Firestore*) secara real-time.

---

## 👥 Nama Anggota Kelompok & Pembagian Tugas
Sesuai dengan ketentuan **Skenario B (Tim Berisi 2 Orang)**, berikut adalah detail pembagian peran dan tanggung jawab:

| Peran | Anggota Tim | Deskripsi Tugas & Tanggung Jawab |
| :--- | :--- | :--- |
| **Anggota 1: Frontend & Axios Specialist** | **[M. Fachrul Reza]** | - Merancang seluruh tata letak (UI/UX) aplikasi dan navigasi antar halaman.<br>- Menangani pengambilan data dari API eksternal menggunakan Axios.<br>- Mengerjakan dan mendemonstrasikan **Fitur 1 (Dashboard & Search)** & **Fitur 2 (Recipe Detail & Checklist)**. |
| **Anggota 2: Backend, State & Firebase Specialist** | **[Agus Tri Sucipto]** | - Melakukan setup dan konfigurasi SDK Firebase.<br>- Mengelola session Auth dan sinkronisasi database Cloud Firestore.<br>- Mengelola state local aplikasi (loading, error handling, checklist resep).<br>- Mengerjakan dan mendemonstrasikan **Fitur 3 (Firebase Auth & Real-time Cookbook)**. |

---

## 🌟 3 Fitur Utama untuk Demo Penilaian
Berikut adalah 3 fitur utama yang diimplementasikan dan siap didemokan ke dosen penguji:

### 1. Fitur 1: Dashboard Kategori & Pencarian Resep (UI/UX & Axios)
* **Deskripsi**: Halaman beranda yang menampilkan daftar kategori makanan (Seafood, Beef, Chicken, Vegetarian, dll.) secara horizontal dan kolom pencarian resep secara dinamis.
* **Teknis**: Data kategori dan daftar makanan diambil secara asinkron dari API menggunakan Axios.
* **Tanggung Jawab Demo**: **Anggota 1** (Menjelaskan layout UI, navigasi tab, dan pemanggilan Axios).

### 2. Fitur 2: Detail Resep Interaktif & Checklist Bahan (UI/UX & Axios)
* **Deskripsi**: Halaman detail yang menampilkan foto makanan beresolusi tinggi, asal negara, link video YouTube tutorial memasak, instruksi memasak terperinci, serta daftar bahan masakan yang interaktif (dapat dicentang/di-checklist).
* **Teknis**: Detail resep ditarik berdasarkan ID Resep menggunakan Axios, dan status centang dikelola menggunakan state lokal React.
* **Tanggung Jawab Demo**: **Anggota 1** (Menjelaskan parsing data JSON dari Axios dan rendering checklist bahan).

### 3. Fitur 3: Firebase Authentication & Real-time Cookbook (Firebase & State)
* **Deskripsi**: Sistem Autentikasi (Daftar & Masuk akun) terenkripsi serta halaman Cookbook pribadi yang menyimpan resep favorit pengguna.
* **Teknis**: Autentikasi dikelola oleh Firebase Auth SDK (sesi tetap tersimpan). Resep yang ditandai sebagai favorit akan disimpan ke Cloud Firestore secara real-time. Jika koneksi aktif, daftar resep di halaman Cookbook akan ter-update otomatis (*real-time listener*).
* **Tanggung Jawab Demo**: **Anggota 2** (Menjelaskan integrasi SDK Firebase, aturan Firestore, manajemen sesi Auth, dan state sinkronisasi data).

---

## 🔌 Daftar API yang Digunakan
Aplikasi ini menggunakan layanan public API dari **The MealDB API** (`https://www.themealdb.com/`):
1. **Mengambil Kategori**: `GET https://www.themealdb.com/api/json/v1/1/categories.php`
2. **Filter Resep Berdasarkan Kategori**: `GET https://www.themealdb.com/api/json/v1/1/filter.php?c={CategoryName}`
3. **Mencari Resep**: `GET https://www.themealdb.com/api/json/v1/1/search.php?s={Query}`
4. **Melihat Detail Resep**: `GET https://www.themealdb.com/api/json/v1/1/lookup.php?i={MealID}`

---

## 🛠️ Cara Menjalankan Aplikasi

1. **Clone Repositori**:
   ```bash
   git clone <link-repo-anda>
   cd eas
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Firebase**:
   Buka file [services/firebase.ts](file:///c:/Mobile%20Computing/eas/services/firebase.ts) dan ganti nilai `firebaseConfig` dengan kredensial web app proyek Firebase Anda:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY_HERE",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
   *Catatan: Pastikan Anda telah mengaktifkan **Email/Password Provider** di bagian Authentication dan membuat database **Cloud Firestore** di konsol Firebase Anda.*

4. **Jalankan Project**:
   ```bash
   npx expo start
   ```
   *Gunakan aplikasi Expo Go di smartphone Anda atau Emulator untuk menjalankan aplikasi.*

---

## 🎓 Panduan Demo untuk Anggota Tim (Persiapan Pertanyaan Dosen)

### 🧑‍💻 Panduan Anggota 1 (Frontend & Axios Specialist)
* **Alur Kode Axios**: Tunjukkan file `services/api.ts`. Jelaskan bahwa Anda membuat *instance* Axios `apiClient` dengan konfigurasi `baseURL` dan `timeout: 10000ms`. 
* **Error Handling**: Jelaskan fungsi `handleApiError` yang menangani error spesifik dari Axios seperti:
  - `ECONNABORTED` untuk timeout koneksi.
  - Skenario tanpa respon server (masalah koneksi internet).
  - Status HTTP error khusus (404 untuk data tidak ditemukan, 500 untuk error server).
* **Alur Rendering**: Tunjukkan `app/(tabs)/index.tsx` dan jelaskan bagaimana `useEffect` memanggil `ApiService.getCategories()` saat pertama kali halaman dibuka, lalu menampilkan data ke komponen `FlatList`.

### 🧑‍💻 Panduan Anggota 2 (Backend, State & Firebase Specialist)
* **Konfigurasi SDK**: Tunjukkan file `services/firebase.ts`. Jelaskan inisialisasi Firebase menggunakan `initializeApp` dan ekspor instance `auth` serta database `db` (Firestore).
* **Autentikasi**: Tunjukkan `app/_layout.tsx` dan jelaskan penggunaan `onAuthStateChanged` untuk memantau status login pengguna secara real-time. Jika terdeteksi user aktif, aplikasi otomatis me-redirect ke `/(tabs)` menggunakan Expo Router, jika tidak akan diarahkan ke `/(auth)/login`.
* **Real-time Database**: Jelaskan fungsi `subscribeToCookbook` di `services/firebase.ts` yang menggunakan method `onSnapshot` dari Firestore. Terangkan bahwa Firestore akan mendorong (*push*) data resep ter-update ke aplikasi secara otomatis (real-time) setiap kali ada penambahan atau penghapusan dokumen di koleksi `users/{userId}/cookbook/{recipeId}`.
