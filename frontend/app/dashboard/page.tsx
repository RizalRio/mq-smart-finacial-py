"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatRupiah, cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowRightLeft,
} from "lucide-react";

// Tipe Data
interface HealthResponse {
  total_balance: number;
  total_variable_expense: number;
  average_daily_burn_rate: number;
  projected_balance_end_month: number;
  days_remaining: number;
  status: "SAFE" | "WARNING" | "DANGER";
  message: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string;
  date: string;
  category?: { name: string; type: string };
}

export default function DashboardPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [recentTrx, setRecentTrx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, trxRes] = await Promise.all([
          api.get("/api/v1/health"),
          api.get("/api/v1/transactions"), // Kita ambil semua dulu, nanti di-slice 5
        ]);
        setHealthData(healthRes.data);
        // Ambil 5 transaksi teratas
        setRecentTrx(trxRes.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-slate-500">Menyiapkan data keuanganmu...</div>
    );

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
      {/* 1. Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Ringkasan kondisi keuanganmu hari ini.
          </p>
        </div>

        {healthData && (
          <div
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold animate-fade-in ${statusColors[healthData.status]}`}
          >
            <StatusIcon className="w-5 h-5" />
            <span>Status: {healthData.status}</span>
          </div>
        )}
      </div>

      {/* 2. Statistik Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Aset */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-24 h-24 text-primary" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Total Aset Bersih</p>
          <h3 className="text-3xl font-black text-slate-900">
            {formatRupiah(healthData?.total_balance || 0)}
          </h3>
          <p className="text-xs text-slate-400 mt-4">Semua dompet & rekening</p>
        </div>

        {/* Burn Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Burn Rate Harian</p>
          <h3 className="text-3xl font-black text-slate-900">
            {formatRupiah(healthData?.average_daily_burn_rate || 0)}
          </h3>
          <p className="text-xs text-red-500 mt-4">
            Rata-rata uang keluar / hari
          </p>
        </div>

        {/* Prediksi */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-secondary" />
          </div>
          <p className="text-slate-500 font-medium mb-1">
            Prediksi Akhir Bulan
          </p>
          <h3
            className={cn(
              "text-3xl font-black",
              (healthData?.projected_balance_end_month || 0) < 0
                ? "text-red-500"
                : "text-slate-900",
            )}
          >
            {formatRupiah(healthData?.projected_balance_end_month || 0)}
          </h3>
          <p className="text-xs text-slate-400 mt-4">
            Estimasi sisa ({healthData?.days_remaining} hari lagi)
          </p>
        </div>
      </div>

      {/* 3. AI Message & Recent Transactions */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: AI Insight */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="bg-white/10 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">Analisis Keuangan</h4>
              <p className="text-slate-300 leading-relaxed text-sm">
                "{healthData?.message}"
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Transaksi Terakhir */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900">
                Transaksi Terakhir
              </h3>
              <Link
                href="/dashboard/transactions"
                className="text-sm font-bold text-primary hover:text-yellow-600 flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentTrx.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Belum ada transaksi.
                </p>
              ) : (
                recentTrx.map((trx) => (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border",
                          trx.type === "INCOME"
                            ? "bg-green-50 border-green-100 text-green-600"
                            : trx.type === "EXPENSE"
                              ? "bg-red-50 border-red-100 text-red-600"
                              : "bg-blue-50 border-blue-100 text-blue-600",
                        )}
                      >
                        {trx.type === "INCOME" ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : trx.type === "EXPENSE" ? (
                          <TrendingDown className="w-5 h-5" />
                        ) : (
                          <ArrowRightLeft className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {trx.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(trx.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          • {trx.category?.name || trx.type}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-bold text-sm",
                        trx.type === "INCOME"
                          ? "text-green-600"
                          : trx.type === "EXPENSE"
                            ? "text-red-500"
                            : "text-slate-900",
                      )}
                    >
                      {trx.type === "EXPENSE" ? "-" : "+"}{" "}
                      {formatRupiah(trx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
