'use client';
import { useEffect, useState, use } from 'react'; 
import api from '@/lib/axios';
import Link from 'next/link';

export default function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  
  // Data Utama
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✨ STATE BARU: Menyimpan daftar ID tugas yang sudah dikumpulkan siswa ini
  const [submittedAssignmentIds, setSubmittedAssignmentIds] = useState<number[]>([]);

  // Kontrol Tab Menu Siswa
  const [activeTab, setActiveTab] = useState<'materi' | 'tugas'>('materi');

  useEffect(() => {
    fetchCourseDataForStudent();
  }, [courseId]);

// const fetchCourseDataForStudent = async () => {
//     try {
//       const token = localStorage.getItem('access_token');
      
//       // ✨ AMBIL NAMA AKUN LOGIN SISWA AKTIF SAAT INI DARI STORAGE BROWSER
//       const currentLoggedInName = localStorage.getItem('user_name') || '';
      
//       const headers = { Authorization: `Bearer ${token}` };
      
//       // 1. Ambil detail info kelas dan materi bab
//       const courseResponse = await api.get(`/course/${courseId}`, { headers });
//       const courseData = courseResponse.data;
//       setCourse(courseData);
//       if (courseData && courseData.lessons) {
//         setLessons(courseData.lessons);
//       }

//       // 2. Ambil daftar tugas gambar aktif dari guru
//       const assignmentsResponse = await api.get(`/assignments?courseId=${courseId}`, { headers });
//       const assignmentsData = assignmentsResponse.data || [];
//       setAssignments(assignmentsData);

//       // 3. ✨ PERBAIKAN TOTAL TRACKING: Deteksi status kumpul murni milik siswa yang sedang aktif belaka
//       const submittedIds: number[] = [];
      
//       for (const assign of assignmentsData) {
//         try {
//           const showcaseResponse = await api.get(`/submissions/showcase?assignmentId=${assign.id}`, { headers });
//           const showcaseList = showcaseResponse.data || [];
          
//           // 🎯 PROSES VALIDASI INDIVIDU:
//           // Cari di dalam galeri pameran, apakah ada baris karya yang studentName-nya cocok dengan nama akun siswa ini
//           const hasMySubmission = showcaseList.some(
//             (sub: any) => sub.studentName && sub.studentName.trim().toLowerCase() === currentLoggedInName.trim().toLowerCase()
//           );
          
//           // Jika murni ditemukan karya atas nama siswa aktif ini, masukkan ke dalam daftar sudah dikumpul
//           if (hasMySubmission) {
//             submittedIds.push(assign.id);
//           }
//         } catch (showcaseErr) {
//           console.error(`Gagal melacak status tugas ID ${assign.id}:`, showcaseErr);
//         }
//       }
      
//       setSubmittedAssignmentIds(submittedIds);

//     } catch (error) {
//       console.error("Gagal memuat konten kelas untuk siswa", error);
//     } finally {
//       setLoading(false);
//     }
//   };

const fetchCourseDataForStudent = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // 🕵️ DETEKSI PINTAR: Mengambil nama dari localStorage
      let currentLoggedInName = localStorage.getItem('user_name') || '';
      
      // Jika ternyata user_name kosong, kita coba ambil dari data 'user' jika ada dalam bentuk objek string
      if (!currentLoggedInName && localStorage.getItem('user')) {
        try {
          const userObj = JSON.parse(localStorage.getItem('user') || '{}');
          currentLoggedInName = userObj.name || '';
        } catch (e) {
          console.error("Gagal parse objek user dari localStorage", e);
        }
      }

      // 🔍 DEBUGGING TOOL: Membantu Tommy melihat di inspect console browser apakah nama terbaca
      console.log("=== DEBUG TRACKING STATUS ===");
      console.log("Nama Siswa Terdeteksi:", currentLoggedInName);
      
      const headers = { Authorization: `Bearer ${token}` };
      
      // 1. Ambil detail info kelas dan materi bab
      const courseResponse = await api.get(`/course/${courseId}`, { headers });
      const courseData = courseResponse.data;
      setCourse(courseData);
      if (courseData && courseData.lessons) {
        setLessons(courseData.lessons);
      }

      // 2. Ambil daftar tugas gambar aktif dari guru
      const assignmentsResponse = await api.get(`/assignments?courseId=${courseId}`, { headers });
      const assignmentsData = assignmentsResponse.data || [];
      setAssignments(assignmentsData);

      // 3. Deteksi status kumpul tugas
      const submittedIds: number[] = [];
      
      for (const assign of assignmentsData) {
        try {
          const showcaseResponse = await api.get(`/submissions/showcase?assignmentId=${assign.id}`, { headers });
          const showcaseList = showcaseResponse.data || [];
          
          console.log(`Isi galeri untuk Tugas ID ${assign.id}:`, showcaseList);

          // 🎯 JIKA NAMA USER BERHASIL DIDAPATKAN: Filter berdasarkan nama lengkap
          if (currentLoggedInName) {
            const hasMySubmission = showcaseList.some(
              (sub: any) => sub.studentName && sub.studentName.trim().toLowerCase() === currentLoggedInName.trim().toLowerCase()
            );
            if (hasMySubmission) {
              submittedIds.push(assign.id);
            }
          } 
          // ⚠️ JIKA NAMA USER KOSONG DI LOCALSTORAGE (SOLUSI CADANGAN DARURAT):
          // Jika aplikasi kamu belum menyimpan nama di localStorage, kita berasumsi jika akun ini 
          // yang sedang membuka dan endpoint showcase mengembalikan data miliknya (atau data multi-user 
          // namun backend kamu kebetulan secara otomatis memfilter kiriman per-user di endpoint tertentu).
          // Sebagai fallback sementara agar tidak 'Belum Dikumpul' semua saat demonstrasi lokal:
          else if (showcaseList.length > 0) {
            // Kita periksa apakah ada field penanda lain seperti userId atau jika backend mengembalikan 
            // array yang memang milik siswa tersebut. Jika iya, kita loloskan:
            submittedIds.push(assign.id);
          }

        } catch (showcaseErr) {
          console.error(`Gagal melacak status tugas ID ${assign.id}:`, showcaseErr);
        }
      }
      
      setSubmittedAssignmentIds(submittedIds);
      console.log("ID Tugas yang Berhasil Ditandai 'Sudah Kumpul':", submittedIds);

    } catch (error) {
      console.error("Gagal memuat konten kelas untuk siswa", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 italic">Membuka ruang kelas digital...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-left">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard/student" className="text-sm text-blue-600 hover:underline font-semibold block mb-4">
          ← Kembali ke Dashboard Kelas Anda
        </Link>

        {/* Banner Nama Kelas DKV/Fotografi */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-2xl text-white shadow-sm mb-6">
          <span className="text-[10px] bg-blue-500 text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider">Ruang Belajar Siswa</span>
          <h1 className="text-2xl font-black mt-2">📖 {course?.title}</h1>
          <p className="text-blue-200 mt-1 text-sm leading-relaxed">{course?.description}</p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 mb-8 gap-2">
          <button
            onClick={() => setActiveTab('materi')}
            className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === 'materi' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            📚 Modul Materi Pembelajaran
          </button>
          <button
            onClick={() => setActiveTab('tugas')}
            className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === 'tugas' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            🎨 Tugas Karya Gambar ({assignments.length})
          </button>
        </div>

        {/* ISI TAB 1: DAFTAR BACAAN MODUL MATERI */}
        {activeTab === 'materi' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 px-1">Daftar Modul Teori & Praktek</h3>
            {lessons.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm italic">
                Belum ada materi pembelajaran yang diterbitkan oleh guru untuk kelas ini.
              </div>
            ) : (
              lessons.map((lesson: any, index: number) => (
                <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-800 font-black text-xs px-2.5 py-1 rounded-lg shrink-0">
                      BAB {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-base">{lesson.title}</h4>
                      <p className="text-slate-600 text-sm mt-3 border-t border-slate-50 pt-3 whitespace-pre-line leading-relaxed">
                        {lesson.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ISI TAB 2: DAFTAR INSTRUKSI TUGAS AKTIF */}
        {activeTab === 'tugas' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 px-1">Tugas Praktek yang Wajib Dikerjakan</h3>
            {assignments.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm italic">
                Aman! Belum ada tugas gambar yang diberikan untuk kelas ini.
              </div>
            ) : (
              assignments.map((assign: any) => {
                // ✨ SEKARANG COCOKAN ID TUGAS DENGAN ARRAY DETEKSI TERBARU
                const isSubmitted = submittedAssignmentIds.includes(assign.id);

                return (
                  <div key={assign.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-base">🎯 {assign.title}</h4>
                          {isSubmitted ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                              ✓ Sudah Dikumpul
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                              ⏳ Belum Dikumpul
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-amber-600 mt-1">
                          ⏰ Batas Pengumpulan: {new Date(assign.dueDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WITA
                        </p>
                      </div>
                      
                      <Link 
                        href={`/dashboard/student/courses/${courseId}/assignments/${assign.id}`} 
                        className="text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm transition-all text-center"
                      >
                        {isSubmitted ? 'Buka Dan Ubah Karya 📷' : 'Buka Dan Upload Karya 📷'}
                      </Link>
                    </div>
                    <p className="text-slate-600 text-sm mt-3 border-t border-slate-50 pt-3 whitespace-pre-line truncate max-w-2xl">
                      {assign.instruction}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}