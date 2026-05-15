'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]); // Menyimpan ID kursus yang diikuti

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/course');
      setCourses(response.data);
    } catch (error) {
      console.error("Gagal mengambil materi", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (courseId: number, courseTitle: string) => {
    // Simulasi atau integrasi ke endpoint pendaftaran jika sudah ada nanti
    if (enrolledCourses.includes(courseId)) {
      alert(`Anda sudah terdaftar di kelas ${courseTitle}`);
      return;
    }
    
    setEnrolledCourses([...enrolledCourses, courseId]);
    alert(`Selamat! Anda berhasil mendaftar di kelas: ${courseTitle}`);
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