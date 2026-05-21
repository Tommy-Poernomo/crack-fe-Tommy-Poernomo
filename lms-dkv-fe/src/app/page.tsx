'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data katalog kelas secara publik saat landing page dibuka
  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        const response = await api.get('/course');
        setCourses(response.data);
      } catch (error) {
        console.error("Gagal memuat katalog Kelas/Materi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      {/* NAVBAR LANDING PAGE */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-black px-3 py-1 rounded-xl text-xs tracking-wider">
            DKV LMS
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-800">Ruang Kreatif Konsentrasi Keahlian DKV</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition px-3 py-2"
          >
            Masuk
          </Link>
          <Link 
            href="/register" // Antisipasi jika halaman login ini punya toggle register
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
          >
            Daftar Sekarang
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="py-16 px-6 text-center max-w-4xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
          Asah <br />Skill Desain Komunikasi Visual <br />Bersama <br /><span className="text-blue-600">Para Guru Profesional</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Akses modul pembelajaran DKV, bimbingan langsung dari guru terverifikasi, dan bangun portofolio kreatifmu dari sekarang.
        </p>
      </header>

      {/* KATALOG KELAS PUBLIK */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pb-24">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950 text-left">Jelajahi Kelas yang Tersedia</h2>
            <p className="text-xs text-slate-500 text-left mt-0.5">Katalog materi DKV yang siap kamu pelajari setelah bergabung.</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            ✨ {courses.length} Kelas Aktif
          </span>
        </div>

        {loading ? (
          <p className="text-left text-slate-500 italic text-sm">Menyiapkan katalog kelas...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {courses.map((course: any) => (
              <div 
                key={course.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition duration-200"
              >
                {/* Dekorasi Card */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* INFO GURU PENGASUH */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span>👨‍🏫 Pengajar:</span>
                      <strong className="text-slate-700 font-semibold">
                        {course.teacher?.name || 'Pengajar Terverifikasi'}
                      </strong>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {course.description || 'Belum ada deskripsi singkat untuk kelas ini.'}
                    </p>
                  </div>

                  {/* ACTION REDIRECT */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href="/login"
                      className="w-full inline-block text-center py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl font-bold text-xs transition duration-200 border border-slate-200/60 hover:border-blue-200"
                    >
                      Login untuk Ikut Kelas →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto">
            <p className="text-slate-400 text-sm">Belum ada kelas terbuka saat ini. Hubungi admin atau pengajar.</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="sticky border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 mt-auto">
        &copy; {new Date().getFullYear()} Tommy Poernomo. All Rights Reserved.
      </footer>
    </div>
  );
}