'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function AdminDashboard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil nama admin yang sedang login dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setAdminName(parsed.name || 'Admin');
    }
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Menembak endpoint register bawaan NestJS yang sudah kita perbaiki DTO-nya
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'TEACHER', // Dikunci OTOMATIS sebagai TEACHER oleh Admin
      });

      setSuccess(true);
      // Bersihkan form setelah sukses
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Gagal menambahkan guru. Pastikan email belum terdaftar.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* NAVBAR UTAMA */}
      <nav className="bg-slate-900/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-black px-3 py-1 rounded-xl text-sm tracking-wider">
            ADMIN
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-300">LMS Ruang Kreatif</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">Selamat datang, <strong className="text-blue-400">{adminName}</strong></span>
          <button 
            onClick={handleLogout}
            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-3 py-1.5 rounded-xl border border-red-500/20 transition"
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white">Panel Manajemen Pengajar</h1>
          <p className="text-slate-400 text-sm mt-1">Daftarkan dan otorisasi guru baru agar dapat mengelola kelas dan materi DKV.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* INFO KANAN/KIRI */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
              <h3 className="font-bold text-sm text-blue-400 mb-2">Hak Akses Guru</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Akun yang dibuat melalui panel ini akan otomatis mendapatkan role <strong className="text-slate-200">TEACHER</strong>. Mereka memiliki akses penuh untuk membuat modul, melihat daftar siswa, dan melakukan manipulasi data kursus.
              </p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl">
              <h3 className="font-bold text-sm text-indigo-400 mb-2">Keamanan Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Password akan di-hash secara otomatis menggunakan sistem enkripsi Bcrypt 10 rounds pada backend NestJS sebelum disimpan ke database.
              </p>
            </div>
          </div>

          {/* FORM PENDAFTARAN GURU */}
          <div className="md:col-span-2 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Formulir Tambah Guru Baru</h2>

            {/* NOTIFIKASI */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-5 text-xs font-medium text-center">
                ⚠️ {typeof error === 'object' ? JSON.stringify(error) : error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl mb-5 text-xs font-medium text-center">
                🎉 Sukses! Akun Guru baru berhasil didaftarkan ke sistem database.
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Nama Lengkap Guru</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Pak Eko, S.ST." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600 text-sm transition"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Email Resmi Pengajar</label>
                <input 
                  type="email" 
                  placeholder="contoh@dkv.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600 text-sm transition"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Kata Sandi Akses</label>
                <input 
                  type="password" 
                  placeholder="Minimal 6-8 karakter aman" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600 text-sm transition"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition mt-4 shadow-xl ${
                  isSubmitting 
                    ? 'bg-blue-400/50 text-white/50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isSubmitting ? 'Mendaftarkan Guru ke Sistem...' : 'Daftarkan Akun Guru'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}