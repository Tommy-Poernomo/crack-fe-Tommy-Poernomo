'use client';
import { useEffect, useState, use } from 'react'; 
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const router = useRouter();
  
  // Data Utama
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Navigasi Tab Kontrol
  const [activeTab, setActiveTab] = useState<'materi' | 'tugas'>('materi');

  // State Form Bab Materi (Lessons)
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);

  // State Form Tugas Baru (Assignment)
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentInstruction, setAssignmentInstruction] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

  // ✨ STATE BARU: Untuk mengontrol pengeditan tugas (Assignment)
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [editAssignTitle, setEditAssignTitle] = useState('');
  const [editAssignInstruction, setEditAssignInstruction] = useState('');
  const [editAssignDueDate, setEditAssignDueDate] = useState('');
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

const fetchCourseData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // 1. Ambil info kursus beserta materi lessons
      const courseResponse = await api.get(`/course/${courseId}`, { headers });
      const courseData = courseResponse.data;
      setCourse(courseData);
      
      if (courseData && courseData.lessons) {
        // ✨ KUNCI UTAMA SORTING MATERI: 
        // Mengurutkan array lessons berdasarkan ID terkecil ke terbesar secara permanen di browser
        const sortedLessons = [...courseData.lessons].sort((a: any, b: any) => a.id - b.id);
        setLessons(sortedLessons);
      }

      // 2. Ambil daftar tugas resmi dari endpoint /assignments
      const assignmentsResponse = await api.get(`/assignments?courseId=${courseId}`, { headers });
      
      // ✨ OPSIONAL: Kita urutkan juga daftarnya berdasarkan ID agar tugas tidak ikut lompat saat di-edit
      const sortedAssignments = (assignmentsResponse.data || []).sort((a: any, b: any) => a.id - b.id);
      setAssignments(sortedAssignments);

    } catch (error) {
      console.error("Gagal memuat detail data kelas", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA KONTROL MATERI (LESSONS) ---
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lessonTitle.length < 3) return alert('Judul materi terlalu pendek!');
    setIsSubmittingLesson(true);
    try {
      const token = localStorage.getItem('access_token');
      await api.post('/lessons', 
        { title: lessonTitle, content: lessonContent, courseId: Number(courseId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('🎉 Materi baru berhasil ditambahkan!');
      setLessonTitle('');
      setLessonContent('');
      fetchCourseData();
    } catch (error) {
      alert('Gagal menambah materi');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const startEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setEditTitle(lesson.title);
    setEditContent(lesson.content);
  };

  const handleUpdateLesson = async (lessonId: number) => {
    if (editTitle.length < 3) return alert('Judul materi minimal 3 karakter!');
    setIsUpdatingLesson(true);
    try {
      const token = localStorage.getItem('access_token');
      await api.patch(`/lessons/${lessonId}`, { title: editTitle, content: editContent }, { headers: { Authorization: `Bearer ${token}` } });
      alert('✏️ Materi berhasil diperbarui!');
      setEditingLessonId(null);
      fetchCourseData();
    } catch (error) {
      alert('Gagal mengedit materi');
    } finally {
      setIsUpdatingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number, title: string) => {
    if (!confirm(`Hapus materi "${title}"?`)) return;
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('🗑️ Materi dihapus.');
      fetchCourseData();
    } catch (error) {
      alert('Gagal menghapus materi');
    }
  };

  // --- LOGIKA KONTROL TUGAS (ASSIGNMENTS) ---
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignmentTitle.length < 3) return alert('Judul tugas terlalu pendek!');
    if (!assignmentDueDate) return alert('Tenggat waktu penyerahan wajib diisi!');

    setIsSubmittingAssignment(true);
    try {
      const token = localStorage.getItem('access_token');
      await api.post('/assignments', 
        { 
          title: assignmentTitle, 
          instruction: assignmentInstruction, 
          dueDate: assignmentDueDate, 
          courseId: Number(courseId) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('🚀 Instruksi tugas baru berhasil diterbitkan!');
      setAssignmentTitle('');
      setAssignmentInstruction('');
      setAssignmentDueDate('');
      fetchCourseData(); 
    } catch (error: any) {
      alert('Gagal menerbitkan tugas: ' + (error.response?.data?.message || 'Eror API'));
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  // ✨ HANDLER BARU: Membuka mode pengeditan tugas dan mengisi form dengan data lama
  const startEditAssignment = (assign: any) => {
    setEditingAssignmentId(assign.id);
    setEditAssignTitle(assign.title);
    setEditAssignInstruction(assign.instruction || '');
    
    // Format tanggal agar sesuai dengan input type="datetime-local" (YYYY-MM-DDTHH:MM)
    if (assign.dueDate) {
      const date = new Date(assign.dueDate);
      const tzOffset = date.getTimezoneOffset() * 60000; // offset dalam milidetik
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setEditAssignDueDate(localISOTime);
    } else {
      setEditAssignDueDate('');
    }
  };

// ✨ HANDLER UPDATE TUGAS (Dilengkapi Konversi ISO Tanggal)
  const handleUpdateAssignment = async (assignmentId: number) => {
    if (editAssignTitle.length < 3) return alert('Nama / Tema tugas minimal 3 karakter!');
    if (!editAssignDueDate) return alert('Tenggat waktu penyerahan wajib diisi!');
    
    setIsUpdatingAssignment(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // ✨ KUNCI UTAMA FE: Ubah teks tanggal mentah browser menjadi objek Waktu ISO resmi
      const isoFormattedDate = new Date(editAssignDueDate).toISOString();

      await api.patch(`/assignments/${assignmentId}`, 
        { 
          title: editAssignTitle, 
          instruction: editAssignInstruction, 
          dueDate: isoFormattedDate // Kirim tanggal yang sudah berstandar ISO
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✏️ Perubahan instruksi tugas berhasil disimpan!');
      setEditingAssignmentId(null);
      fetchCourseData(); // Memperbarui data list tugas di layar
    } catch (error: any) {
      console.error("Eror detail update tugas:", error.response?.data || error.message);
      alert('Gagal memperbarui data tugas: ' + (error.response?.data?.message || 'Eror internal server'));
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  const handleHapusTugas = async (assignmentId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus instruksi tugas ini?')) {
      try {
        const token = localStorage.getItem('access_token');
        await api.delete(`/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('❌ Tugas berhasil dihapus dari sistem!');
        fetchCourseData();
      } catch (error) {
        alert('Gagal menghapus tugas');
      }
    }
  };

  const handleSetExpiredSimulasi = async (assignmentId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const sepuluhMenitLalu = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      await api.patch(`/assignments/${assignmentId}`, 
        { dueDate: sepuluhMenitLalu },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('⚡ Berhasil! Tugas ini sekarang disimulasikan telah EXPIRED. Silakan cek statusnya di akun siswa!');
      fetchCourseData(); 
    } catch (error) {
      alert('Gagal memperbarui batas waktu simulasi');
    }
  };

  if (loading) return <div className="p-8 text-slate-500 italic">Memuat isi kelas...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-8 text-left">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard/teacher" className="text-sm text-blue-600 hover:underline font-semibold block mb-4">
          ← Kembali ke Dashboard Utama
        </Link>

        {/* Informasi Atas Kelas */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-6">
          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full uppercase">Ruang Manajemen Konten</span>
          <h1 className="text-3xl font-black text-blue-900 mt-2">{course?.title}</h1>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed">{course?.description}</p>
        </div>

        {/* BAR NAVIGASI TAB MENU */}
        <div className="flex border-b border-blue-100 mb-8 gap-2">
          <button
            onClick={() => setActiveTab('materi')}
            className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === 'materi' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-100/50'
            }`}
          >
            📖 Kurikulum Materi
          </button>
          <button
            onClick={() => setActiveTab('tugas')}
            className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === 'tugas' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-100/50'
            }`}
          >
            🎨 Pengelolaan Tugas Gambar
          </button>
        </div>

        {/* KONTEN TAB 1: KURIKULUM MATERI */}
        {activeTab === 'materi' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-blue-950 mb-4">＋ Tambah Bab Materi</h3>
                <form onSubmit={handleAddLesson} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Bab</label>
                    <input type="text" placeholder="Contoh: Komposisi Rule of Thirds" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="w-full p-3 border border-blue-100 rounded-xl bg-slate-50 text-sm outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isi Panduan</label>
                    <textarea placeholder="Tulis instruksi atau taruh link panduan..." value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} className="w-full p-3 border border-blue-100 rounded-xl bg-slate-50 text-sm h-36 outline-none" required />
                  </div>
                  <button type="submit" disabled={isSubmittingLesson} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition">
                    {isSubmittingLesson ? 'Menyimpan...' : 'Terbitkan Materi'}
                  </button>
                </form>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              {lessons.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-blue-200 text-center text-slate-400 text-sm italic">Belum ada bab materi.</div>
              ) : (
                lessons.map((lesson: any, index: number) => (
                  <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                    {editingLessonId === lesson.id ? (
                      <div className="space-y-3">
                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2.5 border border-amber-200 bg-amber-50 rounded-xl text-sm font-bold" />
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-2.5 border border-amber-200 bg-amber-50 rounded-xl text-sm h-28" />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditingLessonId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Batal</button>
                          <button onClick={() => handleUpdateLesson(lesson.id)} disabled={isUpdatingLesson} className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg">{isUpdatingLesson ? 'Saving...' : 'Simpan'}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-800 font-black text-xs px-2.5 py-1 rounded-lg">BAB {index + 1}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-blue-900 text-base">{lesson.title}</h4>
                            <div className="flex gap-1">
                              <button onClick={() => startEditLesson(lesson)} className="text-xs text-amber-600 hover:bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Edit</button>
                              <button onClick={() => handleDeleteLesson(lesson.id, lesson.title)} className="text-xs text-red-600 hover:bg-red-50 px-2 py-0.5 rounded border border-red-100">Hapus</button>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm mt-2 whitespace-pre-line leading-relaxed">{lesson.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* KONTEN TAB 2: PENGELOLAAN TUGAS */}
        {activeTab === 'tugas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* SISI KIRI: FORM INSTRUKSI TUGAS KARYA */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-blue-950 mb-4">📐 Buat Tugas Gambar</h3>
                <form onSubmit={handleAddAssignment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama / Tema Tugas</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Fotografi Macro Semut" 
                      value={assignmentTitle} 
                      onChange={(e) => setAssignmentTitle(e.target.value)} 
                      className="w-full p-3 border border-blue-100 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instruksi & Ketentuan Alat</label>
                    <textarea 
                      placeholder="Tulis instruksi wajib berkas JPG/PNG, sudut pencahayaan, atau resolusi kamera..." 
                      value={assignmentInstruction} 
                      onChange={(e) => setAssignmentInstruction(e.target.value)} 
                      className="w-full p-3 border border-blue-100 rounded-xl bg-slate-50 text-sm h-36 outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tenggat Waktu (Deadline)</label>
                    <input 
                      type="datetime-local" 
                      value={assignmentDueDate} 
                      onChange={(e) => setAssignmentDueDate(e.target.value)} 
                      className="w-full p-3 border border-blue-100 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmittingAssignment} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md disabled:bg-blue-300"
                  >
                    {isSubmittingAssignment ? 'Menerbitkan...' : 'Terbitkan Tugas'}
                  </button>
                </form>
              </div>
            </div>

            {/* SISI KANAN: LIST DAFTAR TUGAS AKTIF GURU DENGAN UTALITAS EDIT & HAPUS */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-blue-950 px-1">📊 Status Penugasan Berjalan</h3>
              
              {assignments.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-blue-200 text-center text-slate-400 text-sm italic">
                  Belum ada instruksi tugas gambar yang diterbitkan untuk kelas ini.
                </div>
              ) : (
                assignments.map((assign: any) => (
                  <div key={assign.id} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition-all">
                    
                    {/* ✨ FORM MODE EDIT AKTIF JIKA ID TUGAS COCOK */}
                    {editingAssignmentId === assign.id ? (
                      <div className="space-y-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                        <div>
                          <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Edit Nama Tugas</label>
                          <input 
                            type="text" 
                            value={editAssignTitle} 
                            onChange={(e) => setEditAssignTitle(e.target.value)} 
                            className="w-full p-2.5 border border-amber-200 bg-white rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-amber-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Edit Instruksi Tugas</label>
                          <textarea 
                            value={editAssignInstruction} 
                            onChange={(e) => setEditAssignInstruction(e.target.value)} 
                            className="w-full p-2.5 border border-amber-200 bg-white rounded-xl text-sm h-28 text-slate-700 outline-none focus:border-amber-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Edit Batas Waktu (WITA)</label>
                          <input 
                            type="datetime-local" 
                            value={editAssignDueDate} 
                            onChange={(e) => setEditAssignDueDate(e.target.value)} 
                            className="w-full p-2.5 border border-amber-200 bg-white rounded-xl text-sm text-slate-700 outline-none focus:border-amber-500" 
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-amber-100">
                          <button 
                            type="button"
                            onClick={() => setEditingAssignmentId(null)} 
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:underline"
                          >
                            Batal
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleUpdateAssignment(assign.id)} 
                            disabled={isUpdatingAssignment} 
                            className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm"
                          >
                            {isUpdatingAssignment ? 'Menyimpan...' : 'Simpan Perubahan'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* TAMPILAN NORMAL JIKA TIDAK SEDANG DIEDIT */
                      <>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-blue-900 text-base">🎯 {assign.title}</h4>
                            <p className="text-xs font-bold text-amber-600 mt-1">
                              📅 Batas Waktu: {new Date(assign.dueDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WITA
                            </p>
                          </div>
                          
                          {/* PANEL KENDALI GURU */}
                          <div className="flex gap-1.5 items-center flex-wrap">
                            <button
                              type="button"
                              onClick={() => startEditAssignment(assign)}
                              className="text-[11px] bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 font-extrabold px-2.5 py-1.5 rounded-lg border border-slate-200/60 transition"
                              title="Edit judul, instruksi, atau batas waktu tugas ini"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetExpiredSimulasi(assign.id)}
                              className="text-[11px] bg-amber-50 hover:bg-amber-200 text-amber-800 font-extrabold px-2.5 py-1.5 rounded-lg border border-amber-100 transition"
                              title="Klik untuk langsung mengubah tugas ini menjadi kedaluwarsa seketika"
                            >
                              ⏳ Set Expired
                            </button>
                            <button
                              type="button"
                              onClick={() => handleHapusTugas(assign.id)}
                              className="text-[11px] bg-red-50 hover:bg-red-100 text-red-600 font-extrabold px-2.5 py-1.5 rounded-lg border border-red-100 transition"
                            >
                              🗑️ Hapus
                            </button>
                            <Link 
                              href={`/dashboard/teacher/courses/${courseId}/assignments/${assign.id}`} 
                              className="text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg border border-blue-100 transition-all shrink-0"
                            >
                              Showcase 🖼️
                            </Link>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mt-3 border-t border-slate-50 pt-3 whitespace-pre-line leading-relaxed">
                          {assign.instruction}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}