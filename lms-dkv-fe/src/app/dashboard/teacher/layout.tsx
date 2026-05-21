import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ruang Pengajar", // Mengisi bagian %s
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}