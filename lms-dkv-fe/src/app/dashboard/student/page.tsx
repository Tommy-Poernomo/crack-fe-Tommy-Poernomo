'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]); // Menyimpan ID kursus yang diikuti

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     try {
//       const response = await api.get('/course');
//       setCourses(response.data);
//     } catch (error) {
//       console.error("Gagal mengambil materi", error);
//     } finally {
//       setLoading(false);
//     }
//   };

  // ==========================================
  // AMBIL DATA KATALOG KELAS DAN STATUS ENROLLMENT SEKALIGUS
  // ==========================================
  useEffect(() => {
    const dataInitialization = async () => {
      setLoading(true);
      
      // 1. Ambil Semua Katalog Materi (Menggantikan fungsi fetchCourses lama yang terkomentari)
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
          // Memanggil endpoint GET /enrollment/my-courses yang sudah kamu buat di backend
          const response = await api.get('/enrollment/my-courses', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // Data dari backend berbentuk array objek enrollment. Kita ekstrak ambil courseId-nya saja.
          // Format response: [{ id: 1, courseId: 5, ... }, { id: 2, courseId: 12, ... }]
          const ids = response.data.map((item: any) => item.courseId);
          
          // Simpan kumpulan ID yang sudah diikuti ke dalam state pembungkus
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

//   const handleEnroll = (courseId: number, courseTitle: string) => {
//     // Simulasi atau integrasi ke endpoint pendaftaran jika sudah ada nanti
//     if (enrolledCourses.includes(courseId)) {
//       alert(`Anda sudah terdaftar di kelas ${courseTitle}`);
//       return;
//     }
    
//     setEnrolledCourses([...enrolledCourses, courseId]);
//     alert(`Selamat! Anda berhasil mendaftar di kelas: ${courseTitle}`);
//   };

  // ==========================================
  // PROSES MENGIKUTI KELAS DAN SIMPAN KE DATABASE
  // ==========================================
  const handleEnroll = async (courseId: number, courseTitle: string) => {
    try {
      // 1. Ambil token akses dari localStorage untuk membuktikan siswa ini sah
      const token = localStorage.getItem('access_token');
      
      // 2. Tembak endpoint Backend resmi kamu
      const response = await api.post(
        '/enrollment', 
        { courseId: Number(courseId) }, // Pastikan dikirim dalam bentuk Number murni sesuai DTO NestJS
        {
          headers: {
            Authorization: `Bearer ${token}` // Selipkan token di Header
          }
        }
      );

      // 3. Jika sukses dimasukkan ke database, masukkan ID kursus ini ke state lokal
      setEnrolledCourses((prev) => [...prev, courseId]);
      alert(`🎉 Selamat! Anda berhasil mendaftar di kelas: ${courseTitle}`);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Gagal mengikuti kelas.";
      alert(`⚠️ ${errorMsg}`);
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
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  {/* Dekorasi Atas Card (Ciri Khas DKV) */}
                  <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600" />
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                        Materi DKV
                      </span>
                      <h3 className="text-lg font-bold text-blue-950 mt-3 line-clamp-1">{course.title}</h3>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-3 leading-relaxed">{course.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => handleEnroll(course.id, course.title)}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${
                          isEnrolled 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={isEnrolled} // Mencegah tombol di-klik ganda jika sudah terdaftar
                      >
                        {isEnrolled ? '✓ Sudah Diikuti' : 'Ikuti Kelas'}
                      </button>
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