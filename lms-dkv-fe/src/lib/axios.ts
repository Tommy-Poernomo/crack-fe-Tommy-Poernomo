// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', // Harus selalu pastikan port backend benar
});

//Saat Live di Vercel:
//Nanti begitu proyek ini diunggah ke dashboard Vercel, jangan lupa memasukkan variabel lingkungan tersebut di bagian pengaturan env:
//Key: `NEXT_PUBLIC_API_URL`
//Value:(Alamat URL deploy backend NestJS, misalnya: `[https://lms-dkv-be.railway.app](https://lms-dkv-be.railway.app)` atau sejenisnya)

// Interceptor untuk menyisipkan token secara otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;