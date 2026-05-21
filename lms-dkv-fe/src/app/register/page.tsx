'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(''); // <-- state konfirmasi password
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
// <-- VALIDASI SISI KLIEN: Memastikan kedua password cocok sebelum menembak API
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi utama!');
      return;
    }

    // Validasi panjang karakter minimal
    if (password.length < 8) {
      setError('Kata sandi terlalu pendek, minimal wajib 8 karakter!');
      return;
    }    
    setIsSubmitting(true);

    try {
      // Menembak endpoint register bawaan NestJS kamu
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'STUDENT', // Dikunci otomatis sebagai STUDENT demi keamanan
      });

      setSuccess(true);
      // Otomatis pindah ke halaman login setelah 2 detik sukses
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Registrasi gagal. Pastikan email belum terdaftar dan password memenuhi syarat.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/10">
        
        {/* BRANDING */}
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-lg mb-3 tracking-wider">
            REGISTRASI SISWA
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Buat Akun Belajar</h2>
          <p className="text-blue-200/70 text-xs mt-1">Daftarkan dirimu untuk mulai mengakses materi kreatif.</p>
        </div>
        
        {/* NOTIFIKASI */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-xl mb-4 text-xs font-medium text-center">
            ⚠️ {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3 rounded-xl mb-4 text-xs font-medium text-center">
            🎉 Akun berhasil dibuat! Mengalihkan ke halaman login...
          </div>
        )}
        
        {/* FORM REGISTRASI */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1 text-left">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Masukkan nama lengkap" 
              value={name}
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-white/30 text-sm transition"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1 text-left">Email Akses</label>
            <input 
              type="email" 
              placeholder="siswa@dkv.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-white/30 text-sm transition"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1 text-left">Kata Sandi</label>
            <input 
              type="password" 
              placeholder="Minimal 8 karakter" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-white/30 text-sm transition"
              required 
            />
          </div>

{/* <-- FIELD: Input Konfirmasi Kata Sandi */}
          <div>
            <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1 text-left">Konfirmasi Kata Sandi</label>
            <input 
              type="password" 
              placeholder="Ulangi kata sandi Anda" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-white/30 text-sm transition"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || success}
            className={`w-full py-3 rounded-xl font-bold text-sm transition mt-2 shadow-xl ${
              isSubmitting || success
                ? 'bg-blue-400/50 text-white/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500'
            }`}
          >
            {isSubmitting ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        {/* LINK KE LOGIN */}
        <div className="text-center mt-6 pt-4 border-t border-white/5">
          <p className="text-xs text-blue-200/50">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-400 hover:underline font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}