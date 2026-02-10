"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  LogOut,
  Settings,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Dompet Saya", href: "/dashboard/wallets", icon: Wallet },
  { name: "Transaksi", href: "/dashboard/transactions", icon: ArrowRightLeft },
  { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    logout(); // Hapus state user
    localStorage.removeItem("token"); // Hapus token
    router.push("/auth/login"); // Redirect ke login
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-40">
      {/* 1. Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-slate-50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl text-slate-900"
        >
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <Wallet className="w-5 h-5" />
          </div>
          <span>
            Smart<span className="text-secondary">Planner</span>
          </span>
        </Link>
      </div>

      {/* 2. Menu Items */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-primary/10 text-yellow-700 font-bold" // Active State
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900" // Inactive State
                }
              `}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-yellow-600" : "text-slate-400"}`}
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* 3. User & Logout Section */}
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
