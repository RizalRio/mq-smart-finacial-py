from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, wallets  # <--- 1. Import Wallets

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
# 2. Pasang Router Wallets
app.include_router(wallets.router, prefix="/api/v1/wallets", tags=["Wallets"])

@app.get("/")
async def root():
    return {"message": "Smart Financial Planner API is Ready! 🚀"}