from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

# 🚀 MAİL GÖNDERMEK İÇİN GEREKLİ KÜTÜPHANELER
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/users", tags=["Users"])

# --- 1. KAYIT OLMA VE GİRİŞ YAPMA (LOGIN/REGISTER) ---

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı!")
    
    hashed_pw = security.get_password_hash(user.password)
    new_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Arama yaparken 'email' alanını 'form_data.username' içinden okuyoruz
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Hatalı e-posta veya şifre")

    # Şifreyi kontrol ediyoruz
    if not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Hatalı e-posta veya şifre")

    # Token üretiliyor
    token = security.create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


# --- 2. PROFİL İŞLEMLERİ (ME) ---

@router.get("/me")
def get_my_profile(current_user: models.User = Depends(security.get_current_user)):
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_admin": getattr(current_user, "is_admin", False)
    }

@router.put("/me")
def update_profile(
    user_data: schemas.UserUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    current_user.first_name = user_data.first_name
    current_user.last_name = user_data.last_name
    current_user.email = user_data.email
    db.commit()
    db.refresh(current_user)
    return {"message": "Profil başarıyla güncellendi."}

@router.post("/change-password")
def change_password(
    pwd_data: schemas.PasswordChange, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if not security.verify_password(pwd_data.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Mevcut şifreniz hatalı!")
    
    current_user.password_hash = security.get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Şifreniz başarıyla değiştirildi."}


# --- 3. ŞİFREMİ UNUTTUM AKIŞI ---

reset_codes_db = {}

def send_reset_email(to_email: str, code: str):
    # KANKA: Güvenlik uyarısını unutmadın umarım :) Yeni uygulama şifreni buraya gir!
    sender_email = "atakanakyz6181@gmail.com" 
    sender_password = "rhosirdkavgyzrgk"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Artebase - Şifre Sıfırlama Kodu"
    message["From"] = sender_email
    message["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>Şifre Sıfırlama Talebi</h2>
        <p>Merhaba,</p>
        <p>Hesabınızın şifresini sıfırlamak için aşağıdaki 6 haneli doğrulama kodunu kullanabilirsiniz:</p>
        <div style="margin: 20px auto; padding: 15px; background-color: #f3f4f6; border-radius: 10px; display: inline-block;">
            <h1 style="color: #4f46e5; letter-spacing: 8px; margin: 0;">{code}</h1>
        </div>
        <p>Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">© 2026 Artebase</p>
      </body>
    </html>
    """
    part = MIMEText(html, "html")
    message.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())
    except Exception as e:
        print(f"Mail gönderme hatası: {e}")

@router.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Bu e-posta adresi sistemde kayıtlı değil.")
    
    generated_code = str(random.randint(100000, 999999))
    reset_codes_db[request.email] = generated_code
    send_reset_email(request.email, generated_code)
    
    return {"message": "Doğrulama kodu e-postanıza gönderildi."}

@router.post("/verify-code")
def verify_code(request: schemas.VerifyCodeSchema, db: Session = Depends(get_db)):
    saved_code = reset_codes_db.get(request.email)
    
    if not saved_code or saved_code != request.code:
        raise HTTPException(status_code=400, detail="Girdiğiniz kod hatalı veya süresi dolmuş.")
        
    return {"message": "Kod başarıyla doğrulandı."}

@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
        
    saved_code = reset_codes_db.get(request.email)
    if not saved_code or saved_code != request.code:
        raise HTTPException(status_code=400, detail="Güvenlik doğrulaması başarısız oldu.")
        
    user.password_hash = security.get_password_hash(request.new_password)
    db.commit()
    
    if request.email in reset_codes_db:
        del reset_codes_db[request.email]
    
    return {"message": "Şifreniz başarıyla güncellendi."}