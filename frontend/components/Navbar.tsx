import Link from "next/link";
import { Wallet } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-110 transition-transform duration-300">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Smart<span className="text-secondary">Planner</span>
          </span>
        </Link>

        {/* BUTTONS */}
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-slate-600 hover:text-secondary font-semibold text-sm transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground hover:bg-yellow-400 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
          >
            Daftar Gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
