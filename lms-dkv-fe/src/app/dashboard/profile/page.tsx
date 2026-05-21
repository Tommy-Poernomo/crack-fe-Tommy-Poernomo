'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function EditProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 💡 SINKRONISASI AWAL: Membaca data profile yang tersimpan dari objek 'user' JSON
    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      try {
        const userObj = JSON.parse(savedUserStr);
        setName(userObj.name || '');
        setEmail(userObj.email || '');
        setRole(userObj.role || 'student');
      } catch (e) {
        console.error("Gagal memuat objek user", e);
      }
    } else {
      // Fallback cadangan jika format login lama masih aktif di browser
      setName(localStorage.getItem('user_name') || '');
      setEmail(localStorage.getItem('user_email') || ''); 
      setRole(localStorage.getItem('user_role') || 'student');
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 3) {
      return alert('Nama terlalu pendek! Minimal 3 karakter.');
    }

    if (password && password !== confirmPassword) {
      return alert('⚠️ Konfirmasi password baru tidak cocok!');
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await api.patch('/auth/profile-update', 
        { name, password: password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✨ KUNCI UTAMA SINKRONISASI NAVBAR:
      // Perbarui nilai properti 'name' di dalam string objek 'user' localstorage
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        try {
          const userObj = JSON.parse(savedUserStr);
          userObj.name = response.data.user.name; // Ganti dengan nama baru sukses API
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (e) {
          console.error(e);
        }
      }

      // Simpan juga ke data individual sebagai cadangan system
      localStorage.setItem('user_name', response.data.user.name);
      
      // 🔥 TRICK JITU: Memicu event kustom agar Navbar di layout mendeteksi perubahan seketika!
      window.dispatchEvent(new Event('profileUpdated'));
      
      alert('✏️ Profil Anda berhasil diperbarui!');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      alert('Gagal memperbarui profil: ' + (error.response?.data?.message || 'Eror server'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getBackLink = () => {
    const userRole = role.toLowerCase();
    if (userRole === 'admin') return '/dashboard/admin';
    if (userRole === 'teacher') return '/dashboard/teacher';
    return '/dashboard/student';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-left">
      <div className="max-w-md mx-auto">
        
        <Link href={getBackLink()} className="text-sm text-blue-600 hover:underline font-semibold block mb-4">
          ← Kembali ke Dashboard Utama
        </Link>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-1">⚙️ Pengaturan Profil Akun</h2>
          <p className="text-xs text-slate-400 mb-6">Kelola data informasi identitas digital Anda di dalam platform LMS.</p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* INPUT EMAIL (DIKUNCI / DISABLED) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email (Username Login)</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                className="w-full p-3 border border-slate-100 rounded-xl bg-slate-100 text-slate-400 text-sm outline-none cursor-not-allowed font-medium"
                title="Email tidak dapat diubah karena digunakan sebagai pengenal utama akun"
              />
            </div>

            {/* INPUT ROLE (DIKUNCI / DISABLED) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hak Akses Sistem</label>
              <span className="inline-block text-[10px] bg-blue-100 text-blue-700 font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
                {role}
              </span>
            </div>

            {/* INPUT NAMA (BISA DIEDIT) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Lengkap Baru</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>

            <hr className="my-4 border-slate-100" />
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
              <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                *Kosongkan kolom password di bawah ini jika Anda tidak ingin mengganti password login lama Anda.
              </p>
            </div>

            {/* GANTI PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password Baru</label>
              <input 
                type="password" 
                placeholder="Tulis password baru jika ingin diganti..." 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            {/* KONFIRMASI PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ulangi Password Baru</label>
              <input 
                type="password" 
                placeholder="Konfirmasi ulang password baru..." 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            {/* BUTTON SIMPAN */}
            <button 
              type="submit" 
              disabled={isUpdating} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm disabled:bg-slate-300"
            >
              {isUpdating ? 'Menyimpan Perubahan...' : 'Simpan Pembaruan Profil'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}