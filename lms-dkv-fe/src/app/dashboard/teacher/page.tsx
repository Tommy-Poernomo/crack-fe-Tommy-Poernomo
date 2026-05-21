'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
//import router from 'next/dist/shared/lib/router/router';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null); // Untuk data yang mau diedit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [students, setStudents] = useState([]);
const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
const [activeCourseTitle, setActiveCourseTitle] = useState('');

  useEffect(() => {
    // Ambil data user dari localStorage yang disimpan ketika login
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const token = localStorage.getItem('access_token');
  if (!token) {
    router.push('/login'); // Tendang balik ke login jika tidak ada token
  } else {
    fetchCourses();
  }
  }, []);

  const fetchCourses = async () => {
    try {
      //const response = await api.get('/course');
      //const response = await api.get('/course/my-courses'); // Panggil endpoint khusus untuk guru agar hanya menampilkan kursus miliknya saja
      const token = localStorage.getItem('access_token'); // Ambil token
      const response = await api.get('/course/my-courses', {
        headers: { Authorization: `Bearer ${token}` } // Taruh di parameter kedua untuk GET
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Gagal mengambil kursus", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk buka modal dan isi datanya
  const openEditModal = (course: any) => {
    setIsEditMode(true);
    setSelectedCourse(course);
    setUpdateTitle(course.title);
    setUpdateDesc(course.description);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/course/${selectedCourse.id}`, {
        title: updateTitle,
        description: updateDesc,
      });
      alert('Kursus berhasil diperbarui!');
      setIsModalOpen(false);
      fetchCourses(); // Refresh data
    } catch (error) {
      alert('Gagal update kursus');
    }
  };

  const handleDelete = async (id: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus kursus ini? Semua data pendaftaran juga akan terhapus.')) {
    try {
        const token = localStorage.getItem('access_token'); // Ambil token
      await api.delete(`/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` } // Taruh di parameter kedua untuk DELETE
      });
      fetchCourses(); // Refresh daftar
    } catch (error) {
      alert('Gagal menghapus kursus');
    }
  }
};

// Fungsi untuk buka modal TAMBAH
const openAddModal = () => {
  setIsEditMode(false);
  setSelectedCourse(null);
  setUpdateTitle('');
  setUpdateDesc('');
  setIsModalOpen(true);
};

const fetchCourseStudents = async (courseId: number, courseTitle: string) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await api.get(`/course/${courseId}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Response data berisi array dari enrollment, kita map atau langsung simpan
    setStudents(response.data);
    setActiveCourseTitle(courseTitle);
    setIsStudentModalOpen(true);
  } catch (error) {
    alert('Gagal mengambil daftar siswa');
  }
};

// Gabungkan fungsi simpan (Create & Update)
const handleSubmit = async () => {

// Validasi dulu sebelum mengubah status tombol
  if (updateTitle.length < 5) {
    alert('Judul kursus terlalu pendek (minimal 5 karakter)');
    return; // Berhenti di sini, tombol tidak akan berubah caption menjadi "Sedang Memproses"
  }

  // Ambil token akses dari localStorage agar variabel 'token' di bawah valid dan terbaca
    const token = localStorage.getItem('access_token');

  // Jika validasi lolos, baru set submitting jadi true  
  setIsSubmitting(true);

  try {
    // Aturan Axios untuk POST dan PATCH: Headers ditaruh di PARAMETER KETIGA setelah objek data body
    if (isEditMode) {
      // Jika mode EDIT
      await api.patch(`/course/${selectedCourse.id}`, 
        { title: updateTitle, description: updateDesc }, // Parameter kedua (Body data)
        { headers: { Authorization: `Bearer ${token}` } } // Parameter ketiga (Headers)
    );
      alert('Kursus berhasil diperbarui!');
    } else {
      // Jika mode TAMBAH
      await api.post('/course', 
        { title: updateTitle, description: updateDesc }, // Parameter kedua (Body data)
        { headers: { Authorization: `Bearer ${token}` } } // Parameter ketiga (Headers)
      );
      alert('Kursus baru berhasil ditambahkan!');
    }
    
    setIsModalOpen(false);
    fetchCourses(); // Tarik data terbaru agar layar langsung update
  } catch (error: any) {
    // Menangani error dari server dengan bahasa yang sopan
    const message = error.response?.data?.message || 'Terjadi kesalahan pada server';
    alert('Gagal: ' + (Array.isArray(message) ? message.join(', ') : message));
  }finally {
    // finally digunakan agar status submitting selalu kembali ke false baik ketika sukses maupun error
  setIsSubmitting(false);
  }
};


  return (
    <div className="min-h-screen bg-blue-50 p-8"> {/* Warna dasar Biru */}
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 pt-4">
            <div>
                <h2 className="text-2xl font-bold text-blue-900 text-left">Ruang Kerja Pengajar</h2>
                <p className="text-slate-500 text-left text-sm">Kelola modul, materi, dan kelas DKV Anda.</p>
            </div>
          
          <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow-md">
            + Tambah Materi
          </button>
        </header>

{/* <-- VALIDASI UTAMA: Menangani kondisi layar loading, layar data kosong, dan layar daftar kelas */}
        {loading ? (
          <p className="text-left text-slate-500 italic text-sm">Menyelaraskan materi...</p>
        ) : courses.length === 0 ? (
          // <-- BLOK BARU: Pesan informatif modern jika guru baru masuk dan belum punya kelas
          <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-blue-200 max-w-md mx-auto my-8 shadow-sm">
            <span className="text-4xl">📚</span>
            <h3 className="text-base font-bold text-blue-900 mt-4">Belum Ada Materi Tersedia</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
              Anda belum menerbitkan materi kelas DKV apa pun. Tekan tombol di bawah untuk membuat ruang belajar pertama Anda.
            </p>
            <button onClick={openAddModal} className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold px-4 py-2.5 rounded-xl transition">
              Buat Kelas Sekarang
            </button>
          </div>
        ) : (
          // <-- BLOK RENDER DATA: Hanya akan muncul ke layar jika jumlah array "courses" di atas lebih dari 0
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
{courses.map((course: any) => (
  <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-between">
    <div>
      {/* Membuat judul bisa diklik untuk masuk ke dalam kelas */}
      <Link href={`/dashboard/teacher/courses/${course.id}`} className="group">
        <h3 className="text-xl font-bold text-blue-800 group-hover:text-blue-600 group-hover:underline transition text-left">
          📘 {course.title}
        </h3>
      </Link>
      <p className="text-slate-600 mt-2 mb-6 line-clamp-2 text-sm text-left">{course.description}</p>
    </div>
    
    <div className="space-y-3">
      {/* TOMBOL UTAMA BARU: Kelola Isi Konten Kelas */}
      <Link 
        href={`/dashboard/teacher/courses/${course.id}`}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-xs text-center block transition shadow-sm"
      >
        ⚙️ Kelola Isi Materi & Modul
      </Link>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => openEditModal(course)}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200"
                >
                  Edit (Update)
                </button>
                <button onClick={() => handleDelete(course.id)}
  className="px-4 py-2 text-red-400 hover:text-red-600 transition">Hapus</button>
              </div>
              {/* TOMBOL LIHAT SISWA BARU */}
  <button 
    onClick={() => fetchCourseStudents(course.id, course.title)}
    className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 text-xs text-center border border-slate-200"
  >
    👥 Lihat Daftar Siswa ({course.enrollments?.length || 0})
  </button>
            </div>
            </div>
          ))}
        </div>
        )}

        {/* MODAL UPDATE */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-blue-900/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">{isEditMode ? 'Edit Kursus' : 'Tambah Kursus Baru'}</h2>
              <div className="space-y-4">
                <input 
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Judul Kursus"
                />
                <textarea 
                  value={updateDesc}
                  onChange={(e) => setUpdateDesc(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Deskripsi"
                />
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-medium">Batal</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting} // Tombol mati saat proses kirim
                    className={`flex-1 py-3 rounded-xl font-bold text-white transition ${
                    isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  }`}
>
  {isSubmitting ? 'Sedang Memproses...' : 'Simpan'}
</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* MODAL DAFTAR SISWA */}
{isStudentModalOpen && (
  <div className="fixed inset-0 bg-blue-900/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
    <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Daftar Siswa Terdaftar</h2>
          <p className="text-xs text-slate-500 mt-1">Kelas: <strong className="text-blue-600">{activeCourseTitle}</strong></p>
        </div>
        <button 
          onClick={() => setIsStudentModalOpen(false)} 
          className="text-slate-400 hover:text-slate-600 font-bold text-lg"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 max-h-60 overflow-y-auto border border-blue-50 rounded-xl">
        {students.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm text-center italic">Belum ada siswa yang bergabung di kelas ini.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-50 text-xs font-bold text-blue-900 border-b border-blue-100">
              <tr>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-800">{item.user?.name}</td>
                  <td className="p-3 text-slate-500 text-xs">{item.user?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="flex justify-end pt-4 mt-2">
        <button 
          onClick={() => setIsStudentModalOpen(false)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold"
        >
          Selesai
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}

