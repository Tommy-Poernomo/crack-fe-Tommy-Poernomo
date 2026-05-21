import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Siswa", // Mengisi bagian %s
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}