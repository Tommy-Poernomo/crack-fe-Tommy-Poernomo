import { Metadata } from "next";

// Berkas ini berjalan di Server, sehingga bisa mengekspor metadata
export const metadata: Metadata = {
  title: "Panel Admin", // Nilai ini akan otomatis masuk ke %s di root layout
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}