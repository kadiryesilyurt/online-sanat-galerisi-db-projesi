from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import date, time, datetime
from decimal import Decimal

# ==========================================
# --- KULLANICI & YETKİLENDİRME ŞEMALARI ---
# ==========================================
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

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordSchema(BaseModel):
    email: str

class VerifyCodeSchema(BaseModel):
    email: str
    code: str

class ResetPasswordSchema(BaseModel):
    email: str
    code: str
    new_password: str 


# ==========================================
# --- SANATÇI ŞEMALARI ---
# ==========================================
class ArtistCreate(BaseModel):
    name: str  
    biography: str = "Biyografi eklenmedi." 

class ArtistResponse(BaseModel):
    artist_id: int
    name: str  
    biography: str
    class Config:
        from_attributes = True   


# ==========================================
# --- ESER ŞEMALARI ---
# ==========================================
class ArtworkCreate(BaseModel):
    title: str
    artist_id: int  
    price: float
    image_url: str
    category: str
    description: Optional[str] = None
    stock_status: Optional[int] = 1

class ArtworkUpdateSchema(BaseModel):
    title: str
    price: float
    artist_id: int
    image_url: str
    description: Optional[str] = None

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


# ==========================================
# --- ETKİNLİK ŞEMALARI ---
# ==========================================
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


# ==========================================
# --- REZERVASYON ŞEMALARI ---
# ==========================================
class ReservationCreate(BaseModel):
    user_id: int
    event_id: int
    reservation_date: str 
    reservation_time: str 
    participant_count: int

class ReservationUpdate(BaseModel):
    participant_count: int
    reservation_date: Optional[date] = None
    reservation_time: Optional[str] = None
    status: Optional[str] = None

class ReservationResponse(BaseModel):
    reservation_id: int
    user_id: int
    event_id: int
    participant_count: int
    reservation_date: str
    reservation_time: str
    status: str
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# --- FAVORİ ŞEMALARI ---
# ==========================================
class FavoriteCreate(BaseModel):
    artwork_id: int

class FavoriteResponse(BaseModel):
    user_id: int
    id: int 
    artwork_id: int
    title: str
    artist_name: str  
    price: float      
    image_url: str = None 
    class Config:
        from_attributes = True 


# ==========================================
# --- SİPARİŞ ŞEMALARI ---
# ==========================================
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
    model_config = ConfigDict(from_attributes=True)    


# ==========================================
# --- YORUM VE YANIT ŞEMALARI ---
# ==========================================
class ReviewCreate(BaseModel):
    item_type: str 
    item_id: int
    rating: int
    comment: str

class AdminReplyCreate(BaseModel):
    reply: str

class ReviewResponse(BaseModel):
    review_id: int
    user_id: int
    item_type: str
    item_id: int
    rating: int
    comment: str
    user_name: Optional[str] = None
    created_at: datetime
    helpful_votes: int = 0
    admin_reply: Optional[str] = None  
    class Config:
        from_attributes = True

class ReviewStatsResponse(BaseModel):
    average_rating: float
    total_reviews: int
    class Config:
        from_attributes = True


# ==========================================
# --- DESTEK TALEBİ / MESAJ ŞEMALARI ---
# ==========================================
class TicketCreate(BaseModel):
    subject: str
    message: str

class TicketUpdate(BaseModel):
    status: str
    admin_response: Optional[str] = None

class TicketResponse(BaseModel):
    ticket_id: int
    user_id: int
    subject: str
    message: str
    admin_response: Optional[str]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True    

class MessageCreate(BaseModel):
    message: str

class MessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    is_admin: bool
    message: str
    created_at: datetime
    class Config:
        from_attributes = True

class ComparisonCreate(BaseModel):
    item_type: str # 'artwork' veya 'event'
    item_ids: list[int] # [1, 4, 5] şeklinde gelecek

class ComparisonResponse(BaseModel):
    comparison_id: int
    user_id: int
    item_type: str
    item_ids: str 
    created_at: datetime
    class Config:
        from_attributes = True