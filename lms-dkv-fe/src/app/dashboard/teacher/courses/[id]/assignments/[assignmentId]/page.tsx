'use client';
import { useEffect, useState, use } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function AssignmentShowcasePage({ params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  // Unwrap token parameter dynamic routing Next.js terbaru
  const { id: courseId, assignmentId } = use(params);

  // State Manajemen Data
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State File Upload Siswa
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Base URL Backend untuk memunculkan gambar static assets asset
  const BACKEND_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchAssignmentAndShowcase();
  }, [assignmentId]);

  const fetchAssignmentAndShowcase = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Ambil detail instruksi tugas
      const assignResponse = await api.get(`/assignments/${assignmentId}`, { headers });
      setAssignment(assignResponse.data);

      // 2. Ambil daftar galeri gambar yang sudah kumpul (Showcase)
      const showcaseResponse = await api.get(`/submissions/showcase?assignmentId=${assignmentId}`, { headers });
      setSubmissions(showcaseResponse.data || []);
    } catch (error) {
      console.error("Gagal memuat data galeri showcase tugas", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler deteksi file gambar masuk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validasi ekstensi lokal browser
      if (!file.type.match(/\/(jpeg|jpg|png)$/)) {
        alert('Format file wajib berupa gambar JPG atau PNG!');
        return;
      }
      
      // Validasi ukuran lokal (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar, maksimal berukuran 5 MB!');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Ciptakan tautan preview instan
    }
  };

// Proses upload berkas multipart/form-data ke NestJS
const handleUploadKarya = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert('Silakan pilih berkas gambar karya Anda terlebih dahulu!');

    setIsUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('assignmentId', assignmentId);

      await api.post('/submissions/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('🎉 Karya foto/desain Anda berhasil diunggah ke showcase kelas!');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchAssignmentAndShowcase(); 
    } catch (error: any) {
      alert('Gagal mengunggah karya: ' + (error.response?.data?.message || 'Eror API'));
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 italic">Membuka ruang pameran karya...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-left">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigasi Tombol Mundur */}
        <Link href={`/dashboard/teacher/courses/${courseId}`} className="text-sm text-blue-600 hover:underline font-semibold block mb-6">
          ← Kembali ke Ruang Manajemen Kelas
        </Link>

        {/* 1. SEKTOR ATAS: DETAIL INSTRUKSI TUGAS GURU */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Lembar Instruksi Tugas Konten</span>
              <h1 className="text-3xl font-black text-slate-900 mt-2">🎯 {assignment?.title}</h1>
              <p className="text-xs font-bold text-red-500 mt-1">
                ⏰ Batas Pengumpulan: {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : ''} WITA
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-sm mt-4 border-t border-slate-100 pt-4 whitespace-pre-line leading-relaxed">
            {assignment?.instruction}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 2. SEKTOR KIRI: SIMULASI UPLOAD SISWA (TEMPAT PENGUMPULAN KARYA) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-1">📤 Serahkan Karya Gambar</h3>
              <p className="text-xs text-slate-400 mb-4">Kirimkan hasil jepretan foto atau desain terbaikmu di sini.</p>
              
              <form onSubmit={handleUploadKarya} className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center bg-slate-50 transition relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain shadow-sm" />
                      <p className="text-xs text-blue-600 font-semibold truncate">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="py-6 space-y-1">
                      <div className="text-3xl">📷</div>
                      <p className="text-sm font-bold text-slate-600">Pilih / Seret Gambar</p>
                      <p className="text-xs text-slate-400">Hanya mendukung berkas JPG / PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isUploading ? 'Sedang Mengunggah...' : 'Kirim Ke Galeri Showcase'}
                </button>
              </form>
            </div>
          </div>

          {/* 3. SEKTOR KANAN & BAWAH: SHOWCASE GALERI PORTFOLIO INSPIRASI */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                🖼️ Galeri Inspirasi Portofolio Komunitas <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">{submissions.length} Karya</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Siswa lain yang terdaftar di kelas ini bisa saling melihat karya di bawah ini sebagai bahan studi banding dan inspirasi kreasi.</p>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm italic">
                Belum ada karya foto atau gambar yang dikirimkan ke pameran kelas ini. Jadilah kreator pertama!
              </div>
            ) : (
              /* GRID STRUKTUR TAMPILAN PORTFOLIO MINI PINTEREST STYLE */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {submissions.map((sub: any) => (
                  <div key={sub.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                    {/* Frame Pembungkus Gambar */}
                    <div className="bg-slate-900 aspect-video w-full overflow-hidden relative flex items-center justify-center">
                      <img 
                        src={`${BACKEND_URL}${sub.imagePath}`} 
                        alt={`Karya ${sub.studentName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => {
                          // ✨ DETAIL LOG: Mencetak alamat URL gambar asli yang pecah/gagal muat ke console log browser
                          console.error("Gagal memuat berkas statis gambar dari alamat URL:", `${BACKEND_URL}${sub.imagePath}`);
                          e.target.src = "https://placehold.co/600x400?text=Gambar+Gagal+Dimuat";
                        }}
                      />
                    </div>
                    {/* Tag Nama Siswa Pembuat Karya */}
                    <div className="p-4 flex items-center justify-between bg-white border-t border-slate-50">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kreator Foto</p>
                        <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                          👤 {sub.studentName || 'Siswa DKV'}
                        </h4>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">
                        {new Date(sub.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}