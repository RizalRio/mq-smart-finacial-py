from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME)

# Setup CORS (Agar Frontend Next.js bisa ngobrol sama Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # URL Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Smart Financial Planner API 🚀",
        "status": "Running",
        "docs": "/docs"
    }

# Nanti kita include router di sini
# from app.routers import wallets, transactions
# app.include_router(wallets.router)