# **📂 Smart Financial Planner \- Project Structure**

Berikut adalah struktur folder Monorepo untuk proyek kita. Pastikan semua anggota tim mengikuti standar ini agar tidak terjadi konflik file.

## **🌳 Root Directory**

smart-financial-planner/  
├── .gitignore                   \# File yang diabaikan git (node\_modules, venv, .env)  
├── README.md                    \# Dokumentasi Setup & Cara Install  
├── CONTRIBUTING.md              \# Aturan Penulisan Kode (Coding Guidelines)  
├── docker-compose.yml           \# (Opsional) Config Docker untuk jalanin FE & BE barengan  
├── backend/                     \# 🐍 Folder Project Backend (Python FastAPI)  
└── frontend/                    \# ⚛️ Folder Project Frontend (Next.js)

## **🐍 Backend Structure (Python FastAPI)**

Folder ini berisi logika server, database, dan API.

backend/  
├── app/  
│   ├── \_\_init\_\_.py  
│   ├── main.py              \# 🏁 Entry Point Aplikasi (Tempat inisialisasi FastAPI)  
│   │  
│   ├── core/                \# ⚙️ Konfigurasi Utama  
│   │   ├── config.py        \# Load Environment Variables (.env)  
│   │   └── security.py      \# Logic JWT, Hash Password, & CORS  
│   │  
│   ├── models/              \# 🗄️ Database Models (SQLAlchemy Tables)  
│   │   ├── user.py          \# Tabel Users  
│   │   ├── wallet.py        \# Tabel Wallets  
│   │   └── transaction.py   \# Tabel Transactions, Categories, Recurring  
│   │  
│   ├── schemas/             \# 🛡️ Pydantic Schemas (Validasi Request/Response)  
│   │   ├── user\_schema.py  
│   │   ├── wallet\_schema.py  
│   │   └── transaction\_schema.py  
│   │  
│   ├── api/                 \# 📡 API Routes / Endpoints  
│   │   ├── v1/  
│   │   │   ├── endpoints/   \# Logic Endpoint per fitur  
│   │   │   │   ├── auth.py  
│   │   │   │   ├── wallets.py  
│   │   │   │   └── transactions.py  
│   │   │   └── api.py       \# Router Aggregator (Menggabungkan semua endpoint)  
│   │  
│   └── services/            \# 🧠 Business Logic (Jantung Aplikasi \- Logic Berat di sini)  
│       ├── auth\_service.py  
│       ├── wallet\_service.py  
│       ├── ocr\_service.py       \# Logic pemrosesan gambar struk  
│       ├── prediction\_service.py \# Logic hitung kebangkrutan  
│       └── scheduler.py         \# Logic cron job recurring transactions  
│  
├── alembic/                 \# 🗃️ Database Migrations  
├── tests/                   \# 🧪 Unit Testing  
├── requirements.txt         \# 📦 Daftar Library Python  
└── .env                     \# 🔑 Environment Variables (API Keys, DB URL) \- JANGAN PUSH KE GIT

## **⚛️ Frontend Structure (Next.js App Router)**

Folder ini berisi tampilan antarmuka (UI) dan interaksi pengguna.

frontend/  
├── public/                  \# 🖼️ Aset Statis (Logo, Icon, Images)  
├── src/  
│   ├── app/                 \# 🚦 App Router (Pages & Routing)  
│   │   ├── (auth)/          \# Group Route (Login/Register) \- Tanpa layout dashboard  
│   │   ├── dashboard/       \# Protected Routes (Halaman Utama)  
│   │   │   ├── wallets/     \# Page Manajemen Dompet  
│   │   │   ├── transactions/\# Page Riwayat Transaksi  
│   │   │   └── page.tsx     \# Dashboard Home (Gauge Meter ada di sini)  
│   │   ├── layout.tsx       \# Root Layout (Html, Body)  
│   │   └── page.tsx         \# Landing Page (Welcome Screen)  
│   │  
│   ├── components/          \# 🧩 Komponen UI  
│   │   ├── ui/              \# Reusable Basic Components (Button, Card, Input)  
│   │   ├── features/        \# Fitur Spesifik (GaugeMeter, TransactionList, CameraView)  
│   │   └── layout/          \# Layout Components (Sidebar, Navbar, Footer)  
│   │  
│   ├── lib/                 \# 🛠️ Utilitas & Konfigurasi  
│   │   ├── api.ts           \# Axios Setup (Interceptor Token)  
│   │   └── utils.ts         \# Helper functions (Format Rupiah, Format Tanggal)  
│   │  
│   ├── hooks/               \# 🎣 Custom React Hooks  
│   │   ├── useAuth.ts       \# Hook Login/Logout  
│   │   └── useWallets.ts    \# Hook Fetch Data Dompet  
│   │  
│   ├── types/               \# 📝 TypeScript Interfaces (Sesuai API Contract)  
│   │   └── index.ts  
│   │  
│   └── store/               \# 📦 State Management (Zustand)  
│       └── useUserStore.ts  \# Simpan data user & token global  
│  
├── package.json             \# 📦 Daftar Library JavaScript/Node  
├── tailwind.config.ts       \# 🎨 Config Tailwind CSS  
└── .env.local               \# 🔑 Environment Variables FE (API URL)  
