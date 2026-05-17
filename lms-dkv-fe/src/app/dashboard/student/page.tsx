'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]); // Menyimpan ID kursus yang diikuti
  const [completedCourses, setCompletedCourses] = useState<number[]>([]); // Menyimpan ID kursus yang sudah selesai

  // ==========================================
  // AMBIL DATA KATALOG KELAS DAN STATUS ENROLLMENT
  // ==========================================
  useEffect(() => {
    const dataInitialization = async () => {
      setLoading(true);
      
      // 1. Ambil Semua Katalog Materi
      try {
        const courseResponse = await api.get('/course');
        setCourses(courseResponse.data);
      } catch (error) {
        console.error("Gagal mengambil materi", error);
      }

      // 2. Ambil Riwayat Kelas yang Sudah Diikuti oleh Student Ini dari Database
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await api.get('/enrollment/my-courses', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const ids = response.data.map((item: any) => item.courseId);
          setEnrolledCourses(ids);
        }
      } catch (err) {
        console.error("Gagal memuat status pendaftaran kelas siswa:", err);
      } finally {
        setLoading(false);
      }
    };

    dataInitialization();
  }, []);

  // ==========================================
  // PROSES MENGIKUTI KELAS DAN SIMPAN KE DATABASE
  // ==========================================
  const handleEnroll = async (courseId: number, courseTitle: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.post(
        '/enrollment', 
        { courseId: Number(courseId) }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setEnrolledCourses((prev) => [...prev, courseId]);
      alert(`🎉 Selamat! Anda berhasil mendaftar di kelas: ${courseTitle}`);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Gagal mengikuti kelas.";
      alert(`⚠️ ${errorMsg}`);
    }
  };

  // ==========================================
  // PROSES MENYELESAIKAN KELAS (UPDATE)
  // ==========================================
  const handleComplete = async (courseId: number, courseTitle: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.patch(`/enrollment/${courseId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCompletedCourses((prev) => [...prev, courseId]);
      alert(`🎉 Bagus sekali! Anda telah menyelesaikan kelas: ${courseTitle}`);
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gagal memperbarui progres.';
      alert(errorMsg);
    }
  };

  // ==========================================
  // PROSES MEMBATALKAN PENDAFTARAN KELAS (DELETE)
  // ==========================================
  const handleUnenroll = async (courseId: number, courseTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin keluar dari kelas "${courseTitle}"?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await api.delete(`/enrollment/${courseId}/unenroll`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert('Anda telah berhasil keluar dari kelas.');
        setEnrolledCourses((prev) => prev.filter((id) => id !== courseId));
        setCompletedCourses((prev) => prev.filter((id) => id !== courseId)); // Kembalikan status selesai ke awal saat keluar kelas
        
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Gagal membatalkan pendaftaran.';
        alert(errorMsg);
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* HEADER DASHBOARD */}
      <header className="mb-8 pt-4">
        <h2 className="text-2xl font-bold text-blue-900 text-left">Eksplorasi Ruang Belajar</h2>
        <p className="text-slate-500 text-left text-sm">Pilih dan ikuti kelas desain, fotografi, dan seni digital terbaik.</p>
      </header>

      {/* DAFTAR MATERI */}
      <section>
        {loading ? (
          <p className="text-left text-slate-500 italic">Sedang memuat materi kelas...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {courses.map((course: any) => {
              const isEnrolled = enrolledCourses.includes(course.id);
              const isCompleted = completedCourses.includes(course.id);
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  {/* Dekorasi Atas Card */}
                  <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600" />
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* MENAMPILKAN NAMA GURU */}
                      <span className="text-xs text-slate-500 font-medium">
                        👨‍🏫 Pengajar: {course.teacher?.name || 'Pengajar'}
                      </span>
                      <h3 className="text-lg font-bold text-blue-950 mt-3 line-clamp-1">{course.title}</h3>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-3 leading-relaxed">{course.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {/* TOMBOL UTAMA: ENROLL / SUDAH DIIKUTI */}
                      <button 
                        onClick={() => handleEnroll(course.id, course.title)}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${
                          isEnrolled 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={isEnrolled}
                      >
                        {isEnrolled ? '✓ Sudah Diikuti' : 'Ikuti Kelas'}
                      </button>

                      {/* AREA KENDALI STRUKTUR BAWAH */}
                      <div className="mt-4 border-t pt-4 flex justify-between items-center">
                        {isCompleted ? (
                          <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700 transition">
                            🎓 Selesai
                          </span>
                        ) : isEnrolled ? (
                          /* JIKA SUDAH DAFTAR & BELUM SELESAI: Ganti Teks Menjadi Tombol Selesai Belajar */
                          <button
                            onClick={() => handleComplete(course.id, course.title)}
                            className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md font-semibold shadow-sm transition"
                          >
                            ✔️ Selesai Belajar
                          </button>
                        ) : (
                          /* JIKA BELUM DAFTAR: Tampilkan Label Belum Diikuti Seperti Biasa */
                          <span className="text-xs px-3 py-1 rounded-full font-medium bg-slate-100 text-slate-400 transition">
                            Belum Diikuti
                          </span>
                        )}

                        {/* TOMBOL DELETE / UNENROLL */}
                        <button
                          onClick={() => handleUnenroll(course.id, course.title)}
                          disabled={!isEnrolled}
                          className={`text-xs font-medium transition duration-200 ${
                            isEnrolled
                              ? 'text-red-500 hover:text-red-700 cursor-pointer'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          ❌ Keluar Kelas
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 border-2 border-dashed border-blue-200 rounded-2xl bg-white">
            <p className="text-slate-500">Belum ada kelas yang dibuka oleh pengajar saat ini.</p>
          </div>
        )}
      </section>
    </div>
  );
}