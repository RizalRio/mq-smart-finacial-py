"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  ArrowRightLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Calendar,
  Loader2,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatRupiah, cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";

// --- Types ---
interface Transaction {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string;
  date: string;
  category?: { name: string; type: string };
  wallet_id: number;
}

interface Wallet {
  id: number;
  name: string;
  balance: number;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch tipe transaksi untuk atur form dinamis
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0], // Default Hari Ini
      wallet_id: "",
      target_wallet_id: "",
      category_id: "",
    },
  });

  const transactionType = watch("type"); // Pantau perubahan tipe

  // 1. Fetch Data (Trx, Wallets, Categories)
  const fetchData = async () => {
    try {
      const [trxRes, walletRes, catRes] = await Promise.all([
        api.get("/api/v1/transactions"),
        api.get("/api/v1/wallets"),
        api.get("/api/v1/transactions/categories"),
      ]);

      setTransactions(trxRes.data);
      setWallets(walletRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data transaksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Submit Transaksi
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    // Validasi Manual Sederhana
    if (!data.wallet_id) {
      toast.error("Pilih dompet sumber dulu!");
      setIsSubmitting(false);
      return;
    }
    if (data.type === "TRANSFER" && !data.target_wallet_id) {
      toast.error("Pilih dompet tujuan transfer!");
      setIsSubmitting(false);
      return;
    }

    try {
      // Bersihkan payload (hapus field kosong)
      const payload = {
        ...data,
        category_id: data.type === "TRANSFER" ? null : data.category_id || null,
        target_wallet_id:
          data.type === "TRANSFER" ? data.target_wallet_id : null,
      };

      await api.post("/api/v1/transactions", payload);
      toast.success("Transaksi berhasil dicatat! 📝");
      setIsModalOpen(false);
      reset();
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Helper: Generate Kategori Default (Kalau kosong)
  const generateDefaults = async () => {
    if (!confirm("Buat kategori bawaan (Makan, Gaji, Transport, dll)?")) return;
    try {
      const defaults = [
        { name: "Gaji Bulanan", type: "INCOME", is_fixed: true },
        { name: "Makan & Minum", type: "EXPENSE", is_fixed: false },
        { name: "Transportasi", type: "EXPENSE", is_fixed: false },
        { name: "Belanja Bulanan", type: "EXPENSE", is_fixed: false },
        { name: "Hiburan", type: "EXPENSE", is_fixed: false },
        { name: "Sewa Kost/Rumah", type: "EXPENSE", is_fixed: true },
      ];

      // Loop create (bisa dioptimalkan bulk insert di backend, tapi ini cara cepat di frontend)
      for (const cat of defaults) {
        await api.post("/api/v1/transactions/categories", cat);
      }
      toast.success("Kategori default dibuat!");
      fetchData();
    } catch (error) {
      toast.error("Gagal membuat kategori.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Riwayat Transaksi
          </h1>
          <p className="text-slate-500">Catat pemasukan dan pengeluaranmu.</p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <button
              onClick={generateDefaults}
              className="bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
            >
              <Tags className="w-5 h-5" /> Isi Kategori Default
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-yellow-400 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* List Transaksi */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Belum ada transaksi hari ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-700">
                    Keterangan
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-700">
                    Kategori
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-right">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(trx.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {trx.description || "Tanpa Keterangan"}
                      </div>
                      <div className="text-xs text-slate-400 uppercase font-semibold mt-0.5">
                        {trx.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {trx.type === "TRANSFER" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                          <ArrowRightLeft className="w-3 h-3" /> Transfer
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                          {trx.category?.name || "-"}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-black ${
                        trx.type === "INCOME"
                          ? "text-green-600"
                          : trx.type === "EXPENSE"
                            ? "text-red-500"
                            : "text-slate-900"
                      }`}
                    >
                      {trx.type === "INCOME" ? "+" : "-"}{" "}
                      {formatRupiah(trx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Transaksi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Transaksi Baru"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Tipe Transaksi (Tabs) */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("type", type)}
                className={cn(
                  "py-2 rounded-lg text-sm font-bold transition-all",
                  transactionType === type
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {type === "EXPENSE"
                  ? "Pengeluaran"
                  : type === "INCOME"
                    ? "Pemasukan"
                    : "Transfer"}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">
              Jumlah (Rp)
            </label>
            <input
              type="number"
              {...register("amount", { required: true, valueAsNumber: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-slate-300"
              placeholder="0"
            />
          </div>

          {/* Wallet Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">
                Dari Dompet
              </label>
              <select
                {...register("wallet_id", { required: true })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="">Pilih...</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Wallet (Hanya muncul jika TRANSFER) */}
            {transactionType === "TRANSFER" && (
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1.5">
                  Ke Dompet
                </label>
                <select
                  {...register("target_wallet_id", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="">Pilih Tujuan...</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category (Muncul jika BUKAN Transfer) */}
          {transactionType !== "TRANSFER" && (
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">
                Kategori
              </label>
              <select
                {...register("category_id")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="">Pilih Kategori...</option>
                {categories
                  .filter((c) => c.type === transactionType) // Filter kategori sesuai tipe (Income/Expense)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Belum ada kategori. Klik "Isi Kategori Default" di atas.
                </p>
              )}
            </div>
          )}

          {/* Deskripsi & Tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1.5">
                Catatan
              </label>
              <input
                {...register("description")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Contoh: Makan Siang"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-yellow-400 font-bold text-lg py-3 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Simpan Transaksi"
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
