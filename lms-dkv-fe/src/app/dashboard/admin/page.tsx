'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function AdminDashboard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]); // State tambahan untuk menampung daftar guru

    // STATE UNTUK MODAL EDIT (UPDATE)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Ambil nama admin yang sedang login dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setAdminName(parsed.name || 'Admin');
    }
    fetchTeachers(); // Ambil daftar guru saat halaman dimuat
  }, []);

  // Fungsi untuk mengambil daftar guru dari database agar panel admin lebih informatif
  const fetchTeachers = async () => {
    try {
      const response = await api.get('auth/users'); // Memanggil endpoint get semua user di backend
      // Filter hanya user yang memiliki role TEACHER
      const filteredTeachers = response.data.filter((u: any) => u.role === 'TEACHER');
      setTeachers(filteredTeachers);
    } catch (err) {
      console.error("Gagal memuat daftar pengajar", err);
    }
  };

  // ==========================================
  // 1. PROSES CREATE: TAMBAH GURU BARU
  // ==========================================
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Menembak endpoint register bawaan NestJS
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'TEACHER', // Dikunci OTOMATIS sebagai TEACHER oleh Admin
      });

      setSuccess(true);
      // Bersihkan form setelah sukses
      setName('');
      setEmail('');
      setPassword('');
      fetchTeachers(); // Refresh daftar tabel guru setelah berhasil menambah data baru
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Gagal menambahkan guru. Pastikan email belum terdaftar.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

// ==========================================
  // 2. PROSES UPDATE: MODAL TRIGGER & SUBMIT
  // ==========================================
  const openEditModal = (teacher: any) => {
    setEditingTeacherId(teacher.id);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsEditing(true); // <-- Aktifkan loading saat mulai mengirim data
    
    try {
      const token = localStorage.getItem('access_token');
      // Menembak endpoint PATCH/PUT users di backend bawaan
      await api.patch(`/auth/users/${editingTeacherId}`, {
        name: editName,
        email: editEmail,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('🎉 Data pengajar berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchTeachers(); // Refresh data tabel
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui data pengajar.');
    } finally {
      setIsEditing(false); // <-- Matikan loading setelah proses selesai (sukses/gagal)
    }
  };

  // ==========================================
  // 3. PROSES DELETE: HAPUS AKUN GURU
  // ==========================================
  const handleDeleteTeacher = async (id: number, teacherName: string) => {
    if (confirm(`⚠️ Apakah Anda yakin ingin menghapus akun pengajar "${teacherName}"?\nSemua kelas yang dibuat oleh pengajar ini mungkin akan ikut terhapus.`)) {
      try {
        const token = localStorage.getItem('access_token');
        // Menembak endpoint DELETE users di backend
        await api.delete(`/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert('✅ Akun pengajar berhasil dihapus dari sistem.');
        fetchTeachers(); // Refresh data tabel
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus pengajar.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* NAVBAR UTAMA */}
      <nav className="bg-slate-900/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-black px-3 py-1 rounded-xl text-sm tracking-wider">
            ADMIN
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-300">LMS Ruang Kreatif</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">Selamat datang, <strong className="text-blue-400">{adminName}</strong></span>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white">Panel Manajemen Pengajar</h1>
          <p className="text-slate-400 text-sm mt-1">Daftarkan dan otorisasi guru baru agar dapat mengelola kelas dan materi DKV.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          
          {/* INFO KANAN/KIRI */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
              <h3 className="font-bold text-sm text-blue-400 mb-2">Hak Akses Guru</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Akun yang dibuat melalui panel ini akan otomatis mendapatkan role <strong className="text-slate-200">TEACHER</strong>. Mereka memiliki akses penuh untuk membuat modul, melihat daftar siswa, dan melakukan manipulasi data kursus.
              </p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl">
              <h3 className="font-bold text-sm text-indigo-400 mb-2">Keamanan Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Password akan di-hash secara otomatis menggunakan sistem enkripsi Bcrypt 10 rounds pada backend NestJS sebelum disimpan ke database.
              </p>
            </div>
          </div>

          {/* FORM PENDAFTARAN GURU */}
          <div className="md:col-span-2 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Formulir Tambah Guru Baru</h2>

            {/* NOTIFIKASI */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-5 text-xs font-medium text-center">
                ⚠️ {typeof error === 'object' ? JSON.stringify(error) : error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl mb-5 text-xs font-medium text-center">
                🎉 Sukses! Akun Guru baru berhasil didaftarkan ke sistem database.
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Nama Lengkap Guru</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Pak Eko, S.ST." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600 text-sm transition"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Email Resmi Pengajar</label>
                <input 
                  type="email" 
                  placeholder="contoh@dkv.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600 text-sm transition"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Kata Sandi Akses</label>
                <input 
                  type="password" 
                  placeholder="Minimal 6-8 karakter aman" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600 text-sm transition"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition mt-4 shadow-xl ${
                  isSubmitting 
                    ? 'bg-blue-400/50 text-white/50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isSubmitting ? 'Mendaftarkan Guru ke Sistem...' : 'Daftarkan Akun Guru'}
              </button>
            </form>
          </div>
        </div>

        {/* TABEL DAFTAR GURU AKTIF */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4 tracking-tight text-left">Daftar Pengajar Terverifikasi</h2>
          {teachers.length === 0 ? (
            <p className="text-slate-500 text-sm text-left italic">Belum ada akun pengajar tambahan di database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Email Akses</th>
                    <th className="p-3">Status Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teachers.map((t: any) => (
                    <tr key={t.id} className="hover:bg-white/5 transition">
                      <td className="p-3 font-semibold text-white">{t.name}</td>
                      <td className="p-3 text-slate-400">{t.email}</td>
                      <td className="p-3">
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          {t.role}
                        </span>
                      </td>
                      {/* KOLOM AKSI EDIT DAN DELETE */}
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-white px-2.5 py-1 rounded-md transition font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t.id, t.name)}
                          className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-2.5 py-1 rounded-md transition font-medium"
                        >
                          ❌ Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* ==========================================
          MODAL INTERAKTIF UNTUK EDIT DATA GURU (UPDATE)
          ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white mb-2 text-left">Ubah Informasi Pengajar</h3>
            <p className="text-xs text-slate-400 text-left mb-6">Perbarui nama resmi atau alamat email koordinasi guru terkait.</p>

            <form onSubmit={handleUpdateTeacher} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Akses</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditing} // <-- Mencegah spam klik saat proses berlangsung
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
    isEditing
      ? 'bg-blue-400/50 text-white/50 cursor-not-allowed'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white'
  }`}
>
  {isEditing ? 'Sedang Memproses...' : 'Simpan Perubahan'}
</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}