'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Simpan Token dan Data User
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect berdasarkan role
if (response.data.user.role === 'ADMIN') {
  window.location.href = '/dashboard/admin';
} else if (response.data.user.role === 'TEACHER') {
  window.location.href = '/dashboard/teacher';
} else {
  window.location.href = '/dashboard/student';
}
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal, cek email/password!');
    }finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/10">
        
        {/* LOGO & BRANDING */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white font-extrabold text-xl px-4 py-2 rounded-2xl shadow-lg mb-3 tracking-wider">
            DKV
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">LMS Ruang Kreatif</h2>
          <p className="text-blue-200/70 text-sm mt-1">Satu ruang untuk sejuta karya luar biasa.</p>
        </div>
        
        {/* NOTIFIKASI ERROR */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3.5 rounded-xl mb-5 text-xs font-medium text-center backdrop-blur-sm">
            ⚠️ {error}
          </div>
        )}
        
        {/* FORM LOGIN */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1.5 text-left">
              Email Akses
            </label>
            <input 
              type="email" 
              placeholder="nama@dkv.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-white/30 text-sm transition"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1.5 text-left">
              Kata Sandi
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-white/30 text-sm transition"
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
            {isSubmitting ? 'Memverifikasi Akses...' : 'Masuk ke Ruang Belajar'}
          </button>
        </form>

<div className="text-center mt-4">
  <p className="text-xs text-blue-200/50">
    Belum punya akun?{' '}
    <a href="/register" className="text-blue-400 hover:underline font-semibold">
      Daftar sebagai Siswa
    </a>
  </p>
</div>

        {/* FOOTER KECIL */}
        <div className="text-center mt-8 pt-4 border-t border-white/5">
          <p className="text-xs text-blue-200/40">v1.0.0 Pro • Vocational Learning Management System</p>
        </div>

      </div>
    </div>
  );
}