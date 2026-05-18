from pydantic import BaseModel
from typing import Optional
from datetime import date, time

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

# --- Etkinlik (Event) Şemaları ---
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