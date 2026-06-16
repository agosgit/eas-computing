import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User,
  Auth
} from 'firebase/auth';

// Firebase Web App Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwgoRQb4zgTx6kQT1a90T1vfFgGmxEKXY",
  authDomain: "computing-fc46e.firebaseapp.com",
  projectId: "computing-fc46e",
  storageBucket: "computing-fc46e.firebasestorage.app",
  messagingSenderId: "199533577752",
  appId: "1:199533577752:web:36b231db7bcce1c8f1e56d",
  measurementId: "G-9XBFEPR40R"
};

// Initialize Firebase (Avoid multiple initializations in dev reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);

export { auth };

/**
 * Firebase Auth Services
 */
export const FirebaseService = {
  /**
   * Register a new user with Email and Password
   */
  async register(email: string, password: string): Promise<User> {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      return response.user;
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  },

  /**
   * Login user with Email and Password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return response.user;
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  },

  /**
   * Sign Out current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Gagal untuk keluar.');
    }
  },

  /**
   * Translate typical Firebase errors to user friendly Indonesian messages
   */
  handleAuthError(error: any): string {
    const code = error.code;
    switch (code) {
      case 'auth/invalid-email':
        return 'Format email tidak valid.';
      case 'auth/user-disabled':
        return 'Akun ini telah dinonaktifkan.';
      case 'auth/user-not-found':
        return 'Pengguna tidak ditemukan.';
      case 'auth/wrong-password':
        return 'Kata sandi salah.';
      case 'auth/email-already-in-use':
        return 'Email sudah terdaftar digunakan akun lain.';
      case 'auth/weak-password':
        return 'Kata sandi terlalu lemah (minimal 6 karakter).';
      case 'auth/network-request-failed':
        return 'Gagal terhubung ke Firebase. Periksa koneksi internet Anda.';
      case 'auth/invalid-credential':
        return 'Email atau kata sandi salah.';
      default:
        return error.message || 'Terjadi kesalahan pada sistem autentikasi.';
    }
  }
};
