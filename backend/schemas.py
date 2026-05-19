from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import date, time,datetime
from decimal import Decimal

# --- Kullanıcı Şemaları ---
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    email: str
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Eser Şemaları ---
class ArtworkResponse(BaseModel):
    artwork_id: int
    title: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock_status: int
    artist_name: Optional[str] = None
    artist_biography: Optional[str] = None
    class Config:
        from_attributes = True

class ArtworkCreate(BaseModel):
    artist_id: int
    title: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None

# --- Etkinlik Şemaları ---
class EventResponse(BaseModel):
    event_id: int
    title: str
    description: Optional[str] = None
    event_date: date
    event_time: time
    quota: int
    price: float
    class Config:
        from_attributes = True

# --- Rezervasyon Şemaları ---
class ReservationCreate(BaseModel):
    user_id: int
    event_id: int
    reservation_date: str # "2026-05-25" formatında
    reservation_time: str # "14:00" formatında
    participant_count: int

class ReservationResponse(BaseModel):
    reservation_id: int
    user_id: int
    event_id: int
    participant_count: int
    reservation_date: str
    reservation_time: str
    status: str
    model_config = ConfigDict(from_attributes=True)
class ReservationUpdate(BaseModel):
    participant_count: int
    reservation_date: Optional[date] = None
    reservation_time: Optional[str] = None
    status: Optional[str] = None
class FavoriteCreate(BaseModel):
    artwork_id: int

class FavoriteResponse(BaseModel):
    user_id: int
    id: int # veya artwork_id
    artwork_id: int
    title: str
    artist_name: str  # <--- Bunu ekle
    price: float      # <--- Bunu ekle
    image_url: str = None # <--- Varsa ekle

    class Config:
        from_attributes = True # Pydantic v2 için (Eskisi orm_mode=True)

# --- Yorum Şemaları ---
class ReviewCreate(BaseModel):
    item_type: str 
    item_id: int
    rating: int
    comment: str

class ReviewResponse(BaseModel):
    review_id: int
    user_id: int
    item_type: str
    item_id: int
    rating: int
    comment: str
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    item_type: str
    item_id: int
    payment_method: str
    total_price: float        
class OrderResponse(BaseModel):
    order_id: int
    user_id: int
    title: str
    amount: float
    status: str
    created_at: datetime
    image_url: str | None = None

    # ORM objelerini (SQLAlchemy) Pydantic'e çevirmek için şart!
    model_config = ConfigDict(from_attributes=True)    
class ArtworkCreate(BaseModel):
    title: str
    artist_id: int  # İlişkisel ID
    price: float
    image_url: str
    category: str
    description: Optional[str] = None
    stock_status: Optional[int] = 1
class ArtistResponse(BaseModel):
    artist_id: int
    name: str  
    biography: str

    class Config:
        from_attributes = True   
class ArtistCreate(BaseModel):
    name: str  
    biography: str = "Biyografi eklenmedi." 
class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class PasswordChange(BaseModel):
    old_password: str
    new_password: str
