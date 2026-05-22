'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // ✨ Impor Link untuk navigasi antar halaman Next.js

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  
  // ✨ STATE BARU: Menampung data role user secara dinamis
  const [role, setRole] = useState('');

  useEffect(() => {
    // 💡 Jalankan fungsi sinkronisasi data profile saat layout pertama kali dimuat
    syncProfileName();

    // Membuat event listener kustom agar ketika halaman /profile sukses menyimpan data,
    // komponen Navbar ini langsung mendeteksi perubahan nama secara instan.
    window.addEventListener('storage', syncProfileName);
    window.addEventListener('profileUpdated', syncProfileName);

    return () => {
      window.removeEventListener('storage', syncProfileName);
      window.removeEventListener('profileUpdated', syncProfileName);
    };
  }, []);

  const syncProfileName = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setName(parsed.name || '');
        
        // ✨ SINKRONISASI ROLE: Ambil nilai role dari payload objek user
        setRole(parsed.role || '');
      } catch (e) {
        console.error("Gagal membaca objek user di layout", e);
      }
    } else {
      // Fallback data terpisah jika dibutuhkan
      setRole(localStorage.getItem('user_role') || '');
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      // 1. Bersihkan session data
      localStorage.clear(); 
      
      // 2. ✨ Pindahkan halaman dengan router bawaan Next.js secara aman
      router.push('/login'); 
      
      // 3. (Opsional) Refresh singkat setelah berpindah untuk memastikan state benar-benar kosong
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col flex-1">
      {/* NAVBAR ATAS (Nuansa Biru DKV) */}
      <nav className="sticky top-0 z-50 bg-blue-950 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-bold text-sm tracking-wider transition-all">
            DKV LMS
          </Link>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">

          {/* INFORMASI NAMA USER */}
          <span className="text-sm bg-blue-900/50 px-4 py-2 rounded-full border border-blue-800 font-bold">
            👤 {name || 'Pengguna'}
          </span>
          
          {/* SAKLAR INDIKATOR ROLE YANG DINAMIS DI SEBELAH NAMA */}
          <span className="text-xs text-slate-400 hidden sm:inline">Masuk sebagai</span>
          {role && (
            <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider border shadow-sm ${
              role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
              role === 'TEACHER' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              🔑 {role}
            </span>
          )}
                    
          {/* ✨ TOMBOL EDIT PROFIL BARU: Muncul universal untuk Admin, Guru, dan Siswa */}
          <Link 
            href="/dashboard/profile" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition border border-blue-500/30 shadow-sm"
          >
            ⚙️ Edit Profil
          </Link>

          <button 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-600 text-red-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition border border-red-500/20"
          >
            Keluar (Logout)
          </button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="sticky border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 w-full mt-auto">
        &copy; {new Date().getFullYear()} Tommy Poernomo. All Rights Reserved.
      </footer>
    </div>
  );
}