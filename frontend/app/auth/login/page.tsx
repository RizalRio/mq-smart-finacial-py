"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wallet, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

// 1. Schema Validasi
const loginSchema = z.object({
  email: z.string().email("Format email salah bro"),
  password: z.string().min(1, "Password jangan kosong dong"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginState = useUserStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 2. Fungsi Submit
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);

      const response = await api.post("/api/v1/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;

      localStorage.setItem("token", access_token);
      loginState({ email: data.email });

      toast.success("Login Berhasil! 🎉");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.detail || "Gagal login, cek koneksi backend.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* --- BAGIAN KIRI: FORM --- */}
      <div className="flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12">
        {/* Header Logo */}
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-slate-900 tracking-tight">
              Smart<span className="text-secondary">Planner</span>
            </span>
          </Link>
        </div>

        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-black text-slate-900">
            Welcome Back! 👋
          </h1>
          <p className="text-slate-500">
            Masuk untuk melihat seberapa{" "}
            <span className="text-tertiary font-bold">sehat</span> dompetmu hari
            ini.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="nama@email.com"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-400 font-medium"
            />
            {errors.email && (
              <p className="text-tertiary text-sm font-medium animate-pulse">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>
              <Link
                href="#"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-400 font-medium"
            />
            {errors.password && (
              <p className="text-tertiary text-sm font-medium animate-pulse">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button (Primary Yellow) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-yellow-400 font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-yellow-400/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Masuk Sekarang <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium">
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="text-secondary font-bold hover:underline"
          >
            Daftar Gratis
          </Link>
        </p>
      </div>

      {/* --- BAGIAN KANAN: DEKORASI (Artistic) --- */}
      <div className="hidden md:flex relative flex-col justify-between p-12 bg-slate-900 overflow-hidden text-white">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 mt-auto mb-20">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-2xl">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            Pantau Gaji <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
              Sebelum Pergi.
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            "Kaya itu bukan soal seberapa besar gajimu, tapi seberapa pintar
            kamu ngatur sisanya."
          </p>
        </div>

        {/* Footer Kecil di kanan */}
        <div className="relative z-10 flex gap-4 text-sm text-slate-500 font-medium">
          <span>© 2024 SmartPlanner</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
