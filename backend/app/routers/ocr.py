from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr import extract_receipt_data

router = APIRouter()

@router.post("/scan")
async def scan_receipt(file: UploadFile = File(...)):
    """
    Upload gambar struk, return JSON data hasil scan.
    """
    # Validasi Tipe File
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="File harus gambar (JPG/PNG)")

    # Baca file
    content = await file.read()
    
    # Proses OCR
    result = await extract_receipt_data(content)
    
    if result.get("error"):
        raise HTTPException(status_code=500, detail="Gagal memproses gambar")

    return {
        "status": "success",
        "data": {
            "merchant": result["merchant"],
            "amount": result["amount"],
            # Kita belum detect tanggal canggih, sementara return hari ini di frontend nanti
        }
    }