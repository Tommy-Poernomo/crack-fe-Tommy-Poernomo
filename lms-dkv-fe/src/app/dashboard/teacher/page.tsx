'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
//import router from 'next/dist/shared/lib/router/router';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    // Ambil data user dari localStorage yang disimpan ketika login
    // const savedUser = localStorage.getItem('user');
    // if (savedUser) {
    //   setUser(JSON.parse(savedUser));
    //   fetchCourses();
    // }
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

// Gabungkan fungsi simpan (Create & Update)
const handleSubmit = async () => {
//   // --- VALIDASI (Anti-Cacat) ---
//   if (updateTitle.length < 5) {
//     return alert('Judul kursus minimal 5 karakter!');
//   }
//   if (!updateDesc) {
//     return alert('Deskripsi tidak boleh kosong!');
//   }

//   try {
//     if (isEditMode && selectedCourse) {
//       // Logic Update
//       await api.patch(`/course/${selectedCourse.id}`, { title: updateTitle, description: updateDesc });
//     } else {
//       // Logic Create
//       await api.post('/course', { title: updateTitle, description: updateDesc });
//     }
    
//     setIsModalOpen(false);
//     fetchCourses();
//   } catch (error: any) {
//     alert(error.response?.data?.message || 'Gagal menyimpan data');
//   }
// Validasi Sederhana (Celah B - Mencegah data kotor masuk ke server)

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

/*  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Pengajar</h1>
          <p className="text-slate-500">Halo, {user?.name}. Kelola materi DKV Anda di sini.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          + Kursus Baru
        </button>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-700 text-left">Daftar Kursus Anda</h2>
        
        {loading ? (
          <p>Sedang memuat data...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course: any) => (
              <div key={course.id} className="border p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                <h3 className="text-lg font-bold text-indigo-900 text-left">{course.title}</h3>
                <p className="text-slate-600 text-sm mt-2 text-left line-clamp-2">{course.description}</p>
                
                <div className="mt-4 flex gap-2">
                  {/* Tombol Update yang akan kita fungsikan nanti */ /*}
                  <button className="flex-1 bg-amber-50 text-amber-700 px-3 py-2 rounded-md font-medium hover:bg-amber-100 transition">
                    Edit Kursus (Update)
                  </button>
                  <button className="bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border-2 border-dashed rounded-xl">
            <p className="text-slate-500">Anda belum memiliki kursus. Mulai buat kursus pertama Anda!</p>
          </div>
        )}
      </section>
    </div>
  ); */
  return (
    <div className="min-h-screen bg-blue-50 p-8"> {/* Warna dasar Biru */}
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 pt-4">
            <div>
                <h2 className="text-2xl font-bold text-blue-900 text-left">Ruang Kerja Pengajar</h2>
                <p className="text-slate-500 text-left text-sm">Kelola modul, materi, dan kelas fotografi/desain Anda.</p>
            </div>
          
          <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow-md">
            + Tambah Materi
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
              <h3 className="text-xl font-bold text-blue-800">{course.title}</h3>
              <p className="text-slate-600 mt-2 mb-6 line-clamp-2">{course.description}</p>
              
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
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
}

