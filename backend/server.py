from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None

class Memory(BaseModel):
    type: str
    url: str
    caption: str
    order: int

class MemoryPageCreate(BaseModel):
    title: str
    password: str
    welcome_message: str
    memories: List[Memory]
    final_message: str

class MemoryPageUpdate(BaseModel):
    title: Optional[str] = None
    password: Optional[str] = None
    welcome_message: Optional[str] = None
    memories: Optional[List[Memory]] = None
    final_message: Optional[str] = None

class MemoryPage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    welcome_message: str
    memories: List[Memory]
    final_message: str
    created_at: str
    page_url: str

class PasswordVerify(BaseModel):
    password: str

class PasswordVerifyResponse(BaseModel):
    success: bool
    message: str
    data: Optional[MemoryPage] = None

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Initialize admin user
async def init_admin():
    admin = await db.admin.find_one({"username": "OnlyGg"})
    if not admin:
        hashed = hash_password("123456")
        await db.admin.insert_one({
            "username": "OnlyGg",
            "password_hash": hashed
        })
        logging.info("Admin user created")

@app.on_event("startup")
async def startup_event():
    await init_admin()

# Routes
@api_router.post("/auth/admin-login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLogin):
    admin = await db.admin.find_one({"username": credentials.username}, {"_id": 0})
    
    if not admin:
        return AdminLoginResponse(success=False, message="اسم المستخدم أو كلمة المرور غير صحيحة")
    
    if not verify_password(credentials.password, admin["password_hash"]):
        return AdminLoginResponse(success=False, message="اسم المستخدم أو كلمة المرور غير صحيحة")
    
    # Simple token (in production, use JWT)
    token = str(uuid.uuid4())
    return AdminLoginResponse(success=True, message="تم تسجيل الدخول بنجاح", token=token)

@api_router.get("/memory-pages", response_model=List[MemoryPage])
async def get_memory_pages():
    pages = await db.memory_pages.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return pages

@api_router.post("/memory-pages", response_model=MemoryPage)
async def create_memory_page(page: MemoryPageCreate):
    page_id = str(uuid.uuid4())
    hashed_password = hash_password(page.password)
    
    page_doc = {
        "id": page_id,
        "title": page.title,
        "password_hash": hashed_password,
        "welcome_message": page.welcome_message,
        "memories": [m.model_dump() for m in page.memories],
        "final_message": page.final_message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "page_url": f"/view/{page_id}"
    }
    
    await db.memory_pages.insert_one(page_doc)
    
    # Return without password_hash
    page_doc.pop("password_hash")
    return MemoryPage(**page_doc)

@api_router.get("/memory-pages/{page_id}")
async def get_memory_page(page_id: str):
    page = await db.memory_pages.find_one({"id": page_id}, {"_id": 0, "password_hash": 0})
    if not page:
        raise HTTPException(status_code=404, detail="الصفحة غير موجودة")
    return page

@api_router.put("/memory-pages/{page_id}", response_model=MemoryPage)
async def update_memory_page(page_id: str, update: MemoryPageUpdate):
    page = await db.memory_pages.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="الصفحة غير موجودة")
    
    update_data = {}
    if update.title is not None:
        update_data["title"] = update.title
    if update.password is not None:
        update_data["password_hash"] = hash_password(update.password)
    if update.welcome_message is not None:
        update_data["welcome_message"] = update.welcome_message
    if update.memories is not None:
        update_data["memories"] = [m.model_dump() for m in update.memories]
    if update.final_message is not None:
        update_data["final_message"] = update.final_message
    
    await db.memory_pages.update_one({"id": page_id}, {"$set": update_data})
    
    updated_page = await db.memory_pages.find_one({"id": page_id}, {"_id": 0, "password_hash": 0})
    return MemoryPage(**updated_page)

@api_router.delete("/memory-pages/{page_id}")
async def delete_memory_page(page_id: str):
    result = await db.memory_pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="الصفحة غير موجودة")
    return {"success": True, "message": "تم حذف الصفحة بنجاح"}

@api_router.post("/memory-pages/{page_id}/verify-password", response_model=PasswordVerifyResponse)
async def verify_page_password(page_id: str, verify: PasswordVerify):
    page = await db.memory_pages.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="الصفحة غير موجودة")
    
    if not verify_password(verify.password, page["password_hash"]):
        return PasswordVerifyResponse(success=False, message="كلمة المرور غير صحيحة")
    
    # Remove sensitive data
    page.pop("_id", None)
    page.pop("password_hash", None)
    
    return PasswordVerifyResponse(
        success=True, 
        message="تم التحقق بنجاح",
        data=MemoryPage(**page)
    )

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        file_ext = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOADS_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return URL
        file_url = f"/uploads/{unique_filename}"
        return {"success": True, "url": file_url, "filename": unique_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في رفع الملف: {str(e)}")

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()