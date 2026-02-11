import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import re
import io
import platform

# --- KONFIGURASI TESSERACT ---
if platform.system() == "Windows":
    # Pastikan path ini benar sesuai installan kamu
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Membersihkan gambar agar lebih mudah dibaca Tesseract.
    Update: Menambahkan UPSCALING biar angka '0' pada printer dot-matrix terbaca.
    """
    # 1. Upscale (Perbesar 2x) - KUNCI perbaikan angka hilang!
    # Menggunakan LANCZOS supaya hasil resize tetap tajam
    img = image.resize((image.width * 2, image.height * 2), Image.Resampling.LANCZOS)
    
    # 2. Grayscale
    img = img.convert('L') 
    
    # 3. Contrast (Turunkan dikit jadi 1.5 biar gak washout)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.5) 
    
    # 4. Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    
    return img

def clean_currency(text: str) -> int:
    """
    Mengubah text angka (Rp 50.000, 50,000, 50000) menjadi integer.
    """
    # Hapus semua yg bukan angka
    clean = re.sub(r'[^\d]', '', text)
    if not clean:
        return 0
    return int(clean)

def parse_merchant(text_full: str, lines: list[str]) -> str:
    """
    Mencari nama merchant dengan Database Brand + Nama PT.
    """
    text_lower = text_full.lower()
    
    # 1. DATABASE BRAND (Mapping Pintar)
    # Kiri: Kata kunci yg mungkin muncul di struk (misal nama PT)
    # Kanan: Nama Brand yang kita mau tampilkan
    brand_map = {
        "indomaret": "INDOMARET",
        "indomarco": "INDOMARET", # Kalau yg kebaca PT Indomarco
        "alfamart": "ALFAMART",
        "sumber alfaria": "ALFAMART", # Nama PT Alfamart
        "alfamidi": "ALFAMIDI",
        "midi utama": "ALFAMIDI",
        "pertamina": "PERTAMINA",
        "shell": "SHELL",
        "starbucks": "STARBUCKS",
        "mcdonald": "MCDONALD'S",
        "kfc": "KFC",
        "burger king": "BURGER KING",
        "gofood": "GOFOOD",
        "grabfood": "GRABFOOD",
        "shopeefood": "SHOPEEFOOD",
        "solaria": "SOLARIA",
        "chatime": "CHATIME",
        "janji jiwa": "JANJI JIWA",
        "kopi kenangan": "KOPI KENANGAN",
        "lawson": "LAWSON",
        "superindo": "SUPERINDO",
        "hypermart": "HYPERMART",
        "familymart": "FAMILYMART"
    }

    # Cek apakah ada keyword PT atau Brand di seluruh teks
    for keyword, brand_name in brand_map.items():
        if keyword in text_lower:
            return brand_name

    # 2. FALLBACK: Cari di 5 baris teratas
    blacklist = [
        "selamat", "welcome", "datang", "copy", "reprint", 
        "jl.", "jalan", "raya", "telp", "phone", "fax", "npwp", 
        "jakarta", "indonesia", "cabang", "outlet", "receipt",
        "pt.", "ltd", "tbk", "invoice", "struk"
    ]
    
    for line in lines[:5]:
        clean = line.strip()
        lower_line = clean.lower()
        
        # Filter sampah
        if len(clean) > 3 and not re.match(r'^[\d\s\W]+$', clean):
            is_blacklisted = False
            for bad in blacklist:
                if bad in lower_line:
                    is_blacklisted = True
                    break
            
            if not is_blacklisted:
                return clean.upper()
                
    return "UNKNOWN MERCHANT"

def parse_total(lines: list[str]) -> int:
    """
    Logika Pintar V2:
    1. PRIORITAS UTAMA: Cari kata spesifik 'Total Belanja' (Alfamart) atau 'Jumlah Bayar'.
       Jika ketemu, langsung return (karena ini pasti nilai Net setelah diskon).
    2. FALLBACK: Cari kata 'Total' biasa, lalu filter jebakan, dan ambil nilai MAX.
    """
    
    # 1. KEYWORDS
    # Priority: Kalau ketemu ini, kemungkinan 99% ini angka yang benar (Net Price)
    priority_keywords = ["total belanja", "total bayar", "jumlah bayar", "tagihan", "harus dibayar"]
    
    # Target Umum: Kalau priority gak nemu, cari ini
    target_keywords = ["total", "jumlah", "grand total", "amount", "harga jual", "netto", "bayar"]
    
    # Jebakan: Jangan ambil angka di baris ini
    # Update: Tambah 'disc' (Alfamart pakai titik 'Disc.'), 'hemat', 'kembalian'
    trap_keywords = [
        "tunai", "cash", "kembali", "change", "hemat", 
        "diskon", "discount", "disc", "potongan", 
        "tax", "ppn", "pajak", "item", "qty", "dpp"
    ]

    # 2. STRATEGI 1: CEK PRIORITAS (Alfamart/Indomaret Net Price)
    for line in lines:
        lower_line = line.lower()
        
        # Cek apakah baris mengandung keyword prioritas "Total Belanja"
        if any(prio in lower_line for prio in priority_keywords):
            
            # Tetap waspada, jangan sampai ambil baris "Kembalian" walau ada kata "Bayar"
            if any(trap in lower_line for trap in trap_keywords):
                if "kembali" in lower_line: # Double check khusus kata 'kembali' yang fatal
                    continue

            matches = re.findall(r'\d+[.,\d]*', line)
            if matches:
                # Ambil angka terakhir di baris itu (biasanya posisi nominal ada di kanan)
                for match in reversed(matches):
                    val = clean_currency(match)
                    if 100 < val < 50000000:
                        return val # <--- LANGSUNG RETURN, GAK USAH CARI MAX LAGI

    # 3. STRATEGI 2: FALLBACK (Logika Lama - Cari Max)
    # Dipakai kalau struknya gak standar atau keyword "Total Belanja" gak kebaca
    candidates = []
    for line in lines:
        lower_line = line.lower()
        
        if any(target in lower_line for target in target_keywords):
            # Cek Jebakan
            if any(trap in lower_line for trap in trap_keywords):
                continue
            
            matches = re.findall(r'\d+[.,\d]*', line)
            for match in matches:
                val = clean_currency(match)
                if 100 < val < 50000000:
                    candidates.append(val)

    # Ambil nilai MAX dari kandidat yang lolos
    if candidates:
        return max(candidates)
        
    return 0

async def extract_receipt_data(image_bytes: bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        # STEP 1: Preprocess (Resize & Contrast)
        processed_image = preprocess_image(image)
        
        # STEP 2: OCR
        # psm 6 = Assume single uniform block of text
        custom_config = r'--oem 3 --psm 6' 
        text_full = pytesseract.image_to_string(processed_image, config=custom_config, lang='ind')
        
        lines = [line for line in text_full.split('\n') if line.strip()]
        
        # STEP 3: Parsing Data
        merchant = parse_merchant(text_full, lines)
        amount = parse_total(lines)

        return {
            "merchant": merchant,
            "amount": amount,
            # Kita return raw_text juga kalau mau debug
            # "raw_text": lines 
        }

    except Exception as e:
        print(f"OCR Error: {e}")
        return {"merchant": "", "amount": 0, "error": str(e)}