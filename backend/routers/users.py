from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

router = APIRouter(prefix="/users", tags=["Users"])

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

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_current_user_info(current_user: models.User = Depends(security.get_current_user)):
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "is_admin": getattr(current_user, "is_admin", False) # getattr kullandım ki hata vermesin garanti olsun
    }
@router.put("/me")
def update_profile(
    user_data: schemas.UserUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    print(f"Gelen veri: {user_data}")
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
    if not security.verify_password(pwd_data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mevcut şifreniz hatalı!")
    
    current_user.hashed_password = security.get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Şifreniz başarıyla değiştirildi."}
@router.get("/me")
def get_my_profile(current_user: models.User = Depends(security.get_current_user)):
    # print(f"DEBUG: {current_user.first_name} {current_user.last_name}") 
    # ^ Buradaki print'i aç, terminale bak, isimler geliyorsa sorun yok
    
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "first_name": current_user.first_name, # Backend'den JSON'a manuel ekliyoruz
        "last_name": current_user.last_name,   # Backend'den JSON'a manuel ekliyoruz
        "is_admin": current_user.is_admin
    }