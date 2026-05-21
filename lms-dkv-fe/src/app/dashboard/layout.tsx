'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setName(JSON.parse(savedUser).name);
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.clear(); // Hapus token dan data user
      window.location.href = '/login'; // Tendang ke halaman login
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col flex-1">
      {/* NAVBAR ATAS (Nuansa Biru DKV) */}
      <nav className="sticky top-0 z-50 bg-blue-950 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg font-bold text-sm tracking-wider">DKV LMS</div>
          {/*<span className="font-semibold text-lg tracking-wide">DKV LMS</span> */}
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-xs text-slate-400">Masuk sebagai</span>
          <span className="text-sm bg-blue-900/50 px-4 py-2 rounded-full border border-blue-800">
            👤 {name || 'Pengguna'}
          </span>
          <button 
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition border border-red-500/30"
          >
            Keluar (Logout)
          </button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-1">
        {children}
      </main>
      {/* FOOTER (Sticky Mode Enabled) */}
      <footer className="sticky border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 w-full mt-auto">
        &copy; {new Date().getFullYear()} Tommy Poernomo. All Rights Reserved.
      </footer>
      </div>
  );
}