import Navbar from "@/components/Navbar";
import { ArrowRight, Zap, ScanLine, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 px-4 flex flex-col items-center text-center">
        {/* Dekorasi Background (Glow Effect) */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-tertiary/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-4xl space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-bold animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            Solusi Keuangan Gen-Z 🚀
          </div>

          {/* Headline Besar */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Atur Duit, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-600">
              Gak Pake Rumit.
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Aplikasi pintar buat pantau gaji, scan struk belanja, dan prediksi
            "kesehatan dompet" biar gak makan mie instan di akhir bulan.
          </p>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground hover:bg-yellow-400 font-bold text-lg px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-yellow-400/20 hover:-translate-y-1"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="bg-white border-2 border-slate-200 text-slate-700 hover:border-secondary hover:text-secondary font-bold text-lg px-8 py-4 rounded-full transition-all"
            >
              Intip Fiturnya
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Kenapa Harus SmartPlanner?
            </h2>
            <p className="text-slate-500 mt-2">
              Tiga fitur andalan kami buat dompetmu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: PINK (Tertiary) */}
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-tertiary/50 shadow-sm hover:shadow-2xl hover:shadow-tertiary/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-tertiary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Anti Bangkrut
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Kami kasih warning{" "}
                <span className="text-tertiary font-bold">BAHAYA</span> kalau
                gaya hidupmu mulai boros sebelum akhir bulan.
              </p>
            </div>

            {/* Feature 2: BLUE (Secondary) */}
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-secondary/50 shadow-sm hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ScanLine className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Scan Struk
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Gak perlu ngetik. Foto struk belanjaanmu, AI kami yang input
                datanya otomatis.
              </p>
            </div>

            {/* Feature 3: YELLOW (Primary) */}
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Transfer Kilat
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Pindah saldo dari Bank ke E-Wallet cuma sekali klik. Database
                Transaction menjamin uangmu aman.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
