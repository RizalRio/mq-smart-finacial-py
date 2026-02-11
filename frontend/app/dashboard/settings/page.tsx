"use client";

import { useEffect, useState } from "react";
import { User, Mail, LogOut, Shield, ChevronRight, Bell } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user); // Ambil data user dari State

  // Fungsi Logout
  const handleLogout = () => {
    if (confirm("Yakin mau keluar?")) {
      logout(); // Hapus state user
      localStorage.removeItem("token"); // Hapus token
      toast.success("Berhasil keluar. Sampai jumpa! 👋");
      router.push("/auth/login"); // Balik ke login
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-slate-500">Kelola akun dan preferensi aplikasimu.</p>
      </div>

      {/* 1. KARTU PROFIL */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

        {/* Avatar Placeholder */}
        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg shrink-0 z-10">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="z-10">
          <h2 className="text-xl font-bold text-slate-900">
            Pengguna SmartPlanner
          </h2>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <Mail className="w-4 h-4" />
            <span>{user?.email || "user@example.com"}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] uppercase font-bold mt-3 border border-green-200">
            <Shield className="w-3 h-3" /> Akun Aktif
          </div>
        </div>
      </div>

      {/* 2. MENU PENGATURAN */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {/* Menu: Edit Profil (Dummy) */}
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Edit Profil</h4>
              <p className="text-xs text-slate-500">
                Ubah nama dan foto profil
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>

        {/* Menu: Notifikasi (Dummy) */}
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 p-2.5 rounded-xl text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Notifikasi</h4>
              <p className="text-xs text-slate-500">Atur peringatan tagihan</p>
            </div>
          </div>
          <div className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
            SOON
          </div>
        </button>

        {/* Menu: Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-2.5 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-red-600">
                Keluar Aplikasi
              </h4>
              <p className="text-xs text-slate-500 group-hover:text-red-400">
                Akhiri sesi login ini
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400">Smart Financial Planner v1.0.0</p>
      </div>
    </div>
  );
}
