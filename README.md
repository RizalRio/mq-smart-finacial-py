# **💰 Smart Financial Planner**

Aplikasi manajemen keuangan cerdas dengan fitur Prediksi Kebangkrutan & OCR Scanner.

## **🚀 Tech Stack**

- **Frontend:** Next.js 14, Tailwind CSS, Zustand.
- **Backend:** Python FastAPI, SQLAlchemy, Pydantic.
- **Database:** PostgreSQL.
- **Tools:** Docker (Optional), Tesseract OCR.

## **🛠️ Installation Guide**

### **Prerequisites (Wajib Install)**

1. Python 3.10+
2. Node.js 18+
3. PostgreSQL (Pastikan service berjalan di port 5432\)

### **A. Backend Setup (Folder /backend)**

1. Masuk folder backend:  
   cd backend

2. Buat Virtual Environment:  
   python \-m venv venv  
   source venv/bin/activate \# Mac/Linux  
   venv\\Scripts\\activate \# Windows

3. Install Dependencies:  
   pip install \-r requirements.txt

4. Setup Environment Variables:
   - Copy file .env.example jadi .env
   - Isi DATABASE_URL sesuai settingan Postgre lokal kalian.
5. Jalankan Server:  
   uvicorn app.main:app \--reload

   _Swagger API Documentation bisa diakses di: http://localhost:8000/docs_

### **B. Frontend Setup (Folder /frontend)**

1. Masuk folder frontend:  
   cd frontend

2. Install Dependencies:  
   npm install

3. Jalankan Development Server:  
   npm run dev

   _Akses web di: http://localhost:3000_

## **🤝 Git Convention (Aturan Main)**

- **Main Branch:** main (Hanya untuk kode yang SIAP DEPLOY / Stabil).
- **Development Branch:** dev (Tempat kita merge fitur mingguan).
- **Feature Branch:** Penamaan wajib: feature/nama-fitur.
  - Contoh: feature/login-page, feature/ocr-logic.

### **Cara Kerja:**

1. git checkout \-b feature/nama-fitur dari branch dev.
2. Coding...
3. Push & Pull Request ke dev.

Happy Coding, Team\! 🚀
