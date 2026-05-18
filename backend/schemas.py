from pydantic import BaseModel
from typing import Optional
from datetime import date, time

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
    participant_count: int

class ReservationResponse(BaseModel):
    reservation_id: int
    user_id: int
    event_id: int
    participant_count: int
    reservation_status: str
    class Config:
        from_attributes = True

# --- Favori Şemaları ---
class FavoriteCreate(BaseModel):
    artwork_id: int

class FavoriteResponse(BaseModel):
    user_id: int
    artwork_id: int
    class Config:
        from_attributes = True

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