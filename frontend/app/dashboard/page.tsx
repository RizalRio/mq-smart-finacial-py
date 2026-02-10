"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatRupiah } from "@/lib/utils"; // Pastikan buat utils ini nanti
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// Tipe Data Response Backend
interface HealthResponse {
  total_balance: number;
  total_variable_expense: number;
  average_daily_burn_rate: number;
  projected_balance_end_month: number;
  days_remaining: number;
  status: "SAFE" | "WARNING" | "DANGER";
  message: string;
}

export default function DashboardPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/v1/health");
        setHealthData(res.data);
      } catch (error) {
        console.error("Gagal ambil data health:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <p className="text-slate-500">Menyiapkan data keuanganmu...</p>;

  // Tentukan Warna Status
  const statusColors = {
    SAFE: "bg-green-100 text-green-700 border-green-200",
    WARNING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    DANGER: "bg-red-100 text-red-700 border-red-200",
  };

  const StatusIcon = {
    SAFE: CheckCircle2,
    WARNING: AlertTriangle,
    DANGER: Activity,
  }[healthData?.status || "SAFE"];

  return (
    <div className="space-y-8">
      {/* 1. Header & Greeting */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Pantau arus kas dan kesehatan dompetmu.
          </p>
        </div>

        {/* Badge Status Kesehatan */}
        {healthData && (
          <div
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold ${statusColors[healthData.status]}`}
          >
            <StatusIcon className="w-5 h-5" />
            <span>Status: {healthData.status}</span>
          </div>
        )}
      </div>

      {/* 2. Statistik Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Saldo Card (Primary) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-24 h-24 text-primary" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Total Aset Bersih</p>
          <h3 className="text-3xl font-black text-slate-900">
            {formatRupiah(healthData?.total_balance || 0)}
          </h3>
          <p className="text-xs text-slate-400 mt-4">Semua dompet & rekening</p>
        </div>

        {/* Burn Rate (Pengeluaran Harian) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingDown className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Burn Rate Harian</p>
          <h3 className="text-3xl font-black text-slate-900">
            {formatRupiah(healthData?.average_daily_burn_rate || 0)}
          </h3>
          <p className="text-xs text-red-500 mt-4 flex items-center gap-1">
            Rata-rata uang keluar / hari
          </p>
        </div>

        {/* Prediksi Sisa Akhir Bulan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingUp className="w-24 h-24 text-secondary" />
          </div>
          <p className="text-slate-500 font-medium mb-1">
            Prediksi Akhir Bulan
          </p>
          <h3
            className={`text-3xl font-black ${healthData?.projected_balance_end_month! < 0 ? "text-red-500" : "text-slate-900"}`}
          >
            {formatRupiah(healthData?.projected_balance_end_month || 0)}
          </h3>
          <p className="text-xs text-slate-400 mt-4">
            Estimasi sisa uang ({healthData?.days_remaining} hari lagi)
          </p>
        </div>
      </div>

      {/* 3. Pesan dari "AI" */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-start gap-4 shadow-xl">
        <div className="bg-white/10 p-3 rounded-xl">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-lg mb-1">Analisis Keuangan</h4>
          <p className="text-slate-300 leading-relaxed">
            "{healthData?.message}"
          </p>
        </div>
      </div>
    </div>
  );
}
