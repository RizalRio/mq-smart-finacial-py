"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Cek Token Sederhana
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login"); // Tendang ke login kalau gak ada token
    } else {
      setIsAuthorized(true); // Izinkan masuk
    }
  }, [router]);

  // Tampilkan loading sebentar saat ngecek token
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar (Fixed di Kiri) */}
      <Sidebar />

      {/* Konten Utama (Geser ke Kanan 64 unit / 16rem) */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
