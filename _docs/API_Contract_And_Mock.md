# **📡 API Contract & JSON Schema Reference (Full Version)**

**Project:** Smart Financial Planner

**Status:** Final Reference for Development

**Compatible with:** SRS & SDD v4.0

## **1\. Auth & Profile Module**

### **Login**

**Endpoint:** POST /api/v1/auth/login

**Body:**

{  
  "email": "user@example.com",  
  "password": "password123"  
}

**Response:**

{  
  "access\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",  
  "token\_type": "bearer"  
}

### **Register (New)**

**Endpoint:** POST /api/v1/auth/register

**Body:**

{  
  "full\_name": "Budi Santoso",  
  "email": "user@example.com",  
  "password": "password123"  
}

### **Get User Profile**

**Endpoint:** GET /api/v1/users/profile

**Response:**

{  
  "id": 1,  
  "email": "user@example.com",  
  "full\_name": "Budi Santoso",  
  "avatar\_url": "\[https://ui-avatars.com/api/?name=Budi+Santoso\](https://ui-avatars.com/api/?name=Budi+Santoso)",  
  "currency": "IDR"  
}

### **Update Profile**

**Endpoint:** PUT /api/v1/users/profile

**Body:**

{  
  "full\_name": "Budi Sultan",  
  "avatar\_url": "\[https://new-avatar.com/image.png\](https://new-avatar.com/image.png)"  
}

## **2\. Wallet Module (CRUD)**

### **Get Wallets List**

**Endpoint:** GET /api/v1/wallets

**Response:**

{  
  "total\_balance": 15500000.00,  
  "wallets": \[  
    {  
      "id": 101,  
      "name": "BCA Utama",  
      "type": "BANK",  
      "balance": 15000000.00  
    },  
    {  
      "id": 102,  
      "name": "Dompet Saku",  
      "type": "CASH",  
      "balance": 500000.00  
    }  
  \]  
}

### **Create Wallet**

**Endpoint:** POST /api/v1/wallets

**Body:**

{  
  "name": "Gopay Jajan",  
  "type": "EWALLET",  
  "initial\_balance": 50000  
}

### **Update Wallet**

**Endpoint:** PUT /api/v1/wallets/{id}

**Body:**

{  
  "name": "Gopay Hemat",  
  "type": "EWALLET"  
}

*Note: Saldo tidak bisa diedit di sini.*

### **Delete Wallet**

**Endpoint:** DELETE /api/v1/wallets/{id}?permanent=false

* permanent=false (Default): Soft delete (Arsip).  
* permanent=true: Hapus total dari database.

## **3\. Categories Module (CRUD)**

### **Get Categories**

**Endpoint:** GET /api/v1/categories

**Response:**

\[  
  { "id": 1, "name": "Makan", "type": "EXPENSE", "icon": "🍔", "is\_fixed\_cost": false },  
  { "id": 2, "name": "Gaji", "type": "INCOME", "icon": "💰", "is\_fixed\_cost": false },  
  { "id": 3, "name": "Sewa Kost", "type": "EXPENSE", "icon": "🏠", "is\_fixed\_cost": true }  
\]

### **Create Category**

**Endpoint:** POST /api/v1/categories

**Body:**

{  
  "name": "Kopi",  
  "type": "EXPENSE",  
  "icon": "☕",  
  "is\_fixed\_cost": false  
}

### **Delete Category**

**Endpoint:** DELETE /api/v1/categories/{id}

## **4\. Transaction Module (Core Logic)**

### **Get History**

**Endpoint:** GET /api/v1/transactions

**Query Params:** ?page=1\&limit=10\&start\_date=2024-05-01\&wallet\_id=101

**Response:**

{  
  "data": \[  
    {  
      "id": 505,  
      "amount": 50000,  
      "type": "EXPENSE",  
      "category": { "name": "Makan", "icon": "🍔" },  
      "wallet": { "name": "Dompet Saku" },  
      "date": "2024-05-24T14:30:00",  
      "note": "Nasi Padang",  
      "status": "COMPLETED"  
    },  
    {  
      "id": 506,  
      "amount": 1000000,  
      "type": "TRANSFER",  
      "wallet": { "name": "BCA Utama" },  
      "target\_wallet": { "name": "Dompet Saku" },  
      "date": "2024-05-24T10:00:00",  
      "note": "Topup Cash",  
      "status": "COMPLETED"  
    }  
  \],  
  "pagination": { "total": 20, "page": 1 }  
}

### **Create Transaction (Expense/Income)**

**Endpoint:** POST /api/v1/transactions

**Body:**

{  
  "amount": 25000,  
  "type": "EXPENSE",  
  "category\_id": 1,  
  "wallet\_id": 102,  
  "date": "2024-05-24T18:00:00Z",  
  "note": "Boba"  
}

### **Create Transaction (Transfer)**

**Endpoint:** POST /api/v1/transactions

**Body:**

{  
  "amount": 500000,  
  "type": "TRANSFER",  
  "category\_id": null,  
  "wallet\_id": 101,            
  "target\_wallet\_id": 102,     
  "date": "2024-05-24T18:00:00Z",  
  "note": "Mindahin uang saku"  
}

* wallet\_id \= Sumber Dana.  
* target\_wallet\_id \= Tujuan Dana (Wajib diisi kalau type TRANSFER).

### **Update Transaction**

**Endpoint:** PUT /api/v1/transactions/{id}

**Body:**

{  
  "amount": 30000,  
  "note": "Boba \+ Topping (Update harga)"  
}

### **Delete Transaction**

**Endpoint:** DELETE /api/v1/transactions/{id}?permanent=false

* permanent=false: Soft delete (Masuk sampah, saldo dikembalikan).  
* permanent=true: Hapus permanen (Saldo dikembalikan).

## **5\. Recurring & Approval Module**

### **Get Schedules (Daftar Langganan)**

**Endpoint:** GET /api/v1/recurring

**Response:**

\[  
  {  
    "id": 1,  
    "name": "Netflix",  
    "amount": 186000,  
    "frequency": "MONTHLY",  
    "next\_run\_date": "2024-06-01"  
  }  
\]

### **Create Schedule**

**Endpoint:** POST /api/v1/recurring

**Body:**

{  
  "name": "Bayar Kost",  
  "amount": 1500000,  
  "category\_id": 3,  
  "frequency": "MONTHLY",  
  "start\_date": "2024-05-25"  
}

### **Get Pending Bills (Menunggu Konfirmasi)**

**Endpoint:** GET /api/v1/transactions/pending

**Response:**

\[  
  {  
    "id": 99,  
    "description": "Bayar Kost (Auto-Generated)",  
    "amount": 1500000,  
    "due\_date": "2024-05-25",  
    "status": "PENDING"  
  }  
\]

### **Confirm / Pay Bill**

**Endpoint:** POST /api/v1/transactions/{id}/confirm

**Body:**

{  
  "wallet\_id": 101,   
  "final\_amount": 1500000   
}

* User memilih bayar pakai dompet mana (wallet\_id).  
* User bisa ubah nominal (final\_amount) kalau tagihannya beda dikit.

## **6\. Smart Features**

### **OCR Scan Receipt**

**Endpoint:** POST /api/v1/scan/receipt

**Header:** Content-Type: multipart/form-data

**Body:** file: (image.jpg)

**Response (Draft JSON):**

{  
  "detected\_amount": 45000,  
  "detected\_date": "2024-05-24",  
  "detected\_merchant": "Indomaret Point",  
  "confidence\_score": 0.88  
}

### **Financial Health Check**

**Endpoint:** GET /api/v1/analysis/health

**Response:**

{  
  "status": "DANGER",  
  "health\_score": 20,  
  "metrics": {  
    "current\_total\_balance": 2000000,  
    "burn\_rate\_variable": 150000,  
    "days\_remaining": 10,  
    "pending\_bills\_total": 1500000,  
    "projected\_balance": \-1000000   
  },  
  "recommendation": "Waduh minus 1 Juta\! Jangan jajan dulu bro.",  
  "ui\_config": {  
    "color": "\#EF4444",  
    "emoji": "🚨"  
  }  
}  
