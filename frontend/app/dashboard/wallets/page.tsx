"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Wallet,
  Trash2,
  Edit2,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import Modal from "@/components/ui/Modal";

// Tipe Data Wallet
interface WalletType {
  id: number;
  name: string;
  type: "BANK" | "EWALLET" | "CASH";
  balance: number;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null); // Menyimpan data dompet yang sedang diedit

  // Setup Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      type: "BANK",
      balance: 0,
    },
  });

  // 1. Fetch Wallets
  const fetchWallets = async () => {
    try {
      const res = await api.get("/api/v1/wallets");
      setWallets(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data dompet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  // 2. Handle Klik Tombol Edit
  const handleEditClick = (wallet: WalletType) => {
    setEditingWallet(wallet); // Set mode edit
    setValue("name", wallet.name); // Isi form dengan data lama
    setValue("type", wallet.type);
    setValue("balance", wallet.balance); // Sekedar info (nanti di-hide)
    setIsModalOpen(true);
  };

  // 3. Handle Tutup Modal (Reset Form)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWallet(null); // Hapus mode edit
    reset(); // Kosongkan form
  };

  // 4. Submit (Bisa Create atau Update)
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingWallet) {
        // --- LOGIC UPDATE (PUT) ---
        // Kita hanya kirim Name & Type, saldo tidak boleh diubah via PUT
        await api.put(`/api/v1/wallets/${editingWallet.id}`, {
          name: data.name,
          type: data.type,
        });
        toast.success("Dompet berhasil diupdate! ✨");
      } else {
        // --- LOGIC CREATE (POST) ---
        await api.post("/api/v1/wallets", data);
        toast.success("Dompet berhasil dibuat! 💸");
      }

      handleCloseModal();
      fetchWallets(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Gagal menyimpan dompet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Delete Wallet
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin mau hapus dompet ini?")) return;
    try {
      await api.delete(`/api/v1/wallets/${id}?permanent=false`);
      toast.success("Dompet dihapus.");
      fetchWallets();
    } catch (error) {
      toast.error("Gagal menghapus dompet.");
    }
  };

  // Helper Icon & Color
  const getWalletStyle = (type: string) => {
    switch (type) {
      case "BANK":
        return { icon: Wallet, color: "bg-blue-600", label: "Bank Account" };
      case "EWALLET":
        return { icon: CreditCard, color: "bg-purple-600", label: "E-Wallet" };
      case "CASH":
        return { icon: Banknote, color: "bg-green-600", label: "Cash Tunai" };
      default:
        return { icon: Wallet, color: "bg-slate-600", label: "Lainnya" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dompet Saya</h1>
          <p className="text-slate-500">Kelola sumber danamu di sini.</p>
        </div>
        <button
          onClick={() => {
            setEditingWallet(null); // Pastikan mode tambah
            reset();
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-yellow-400 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Dompet
        </button>
      </div>

      {/* Grid Wallets */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : wallets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum ada dompet</h3>
          <p className="text-slate-500 mb-6">
            Yuk tambah dompet pertamamu sekarang!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary font-bold hover:underline"
          >
            Buat Dompet Baru
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {wallets.map((wallet) => {
            const style = getWalletStyle(wallet.type);
            return (
              <div
                key={wallet.id}
                className="relative group overflow-hidden bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Background Decor */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${style.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:opacity-20 transition-opacity`}
                />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl ${style.color} flex items-center justify-center text-white shadow-md`}
                    >
                      <style.icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Tombol EDIT */}
                      <button
                        onClick={() => handleEditClick(wallet)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Tombol DELETE */}
                      <button
                        onClick={() => handleDelete(wallet.id)}
                        className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {style.label}
                  </p>
                  <h3
                    className="text-xl font-bold text-slate-900 mb-2 truncate"
                    title={wallet.name}
                  >
                    {wallet.name}
                  </h3>
                  <p className="text-2xl font-black text-slate-900">
                    {formatRupiah(wallet.balance)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form (Reusable untuk Create & Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWallet ? "Edit Dompet" : "Tambah Dompet Baru"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Input Nama */}
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">
              Nama Dompet
            </label>
            <input
              {...register("name", { required: "Nama wajib diisi" })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-slate-400"
              placeholder="Contoh: BCA Utama"
            />
          </div>

          {/* Select Tipe */}
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">
              Tipe
            </label>
            <div className="relative">
              <select
                {...register("type")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 appearance-none transition-all"
              >
                <option value="BANK">Bank Transfer</option>
                <option value="EWALLET">E-Wallet (Gopay/OVO/Dana)</option>
                <option value="CASH">Uang Tunai</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Input Saldo (Hanya Muncul saat Mode TAMBAH) */}
          {!editingWallet && (
            <div className="animate-fade-in-down">
              <label className="text-sm font-bold text-slate-700 block mb-1.5">
                Saldo Awal
              </label>
              <input
                type="number"
                {...register("balance", { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-slate-400"
                placeholder="0"
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                ℹ️ Saldo awal ini akan dianggap sebagai penyesuaian.
              </p>
            </div>
          )}

          {/* Info Saldo saat Mode EDIT */}
          {editingWallet && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">
                Saldo saat ini (Tidak bisa diedit)
              </p>
              <p className="text-xl font-bold text-slate-900">
                {formatRupiah(editingWallet.balance)}
              </p>
            </div>
          )}

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-yellow-400 font-bold text-lg py-3 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
              </>
            ) : editingWallet ? (
              "Update Dompet"
            ) : (
              "Simpan Dompet"
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
