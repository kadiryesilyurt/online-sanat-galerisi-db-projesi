from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, TIMESTAMP, Date, Time, DateTime,Float, Boolean, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="customer")
    created_at = Column(TIMESTAMP, server_default=func.now())
    is_admin = Column(Boolean, default=False)

class Artist(Base):
    __tablename__ = "artists"
    artist_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    biography = Column(Text)
    artworks = relationship("Artwork", back_populates="artist")

class Artwork(Base):
    __tablename__ = "artworks"
    artwork_id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artists.artist_id"))
    title = Column(String(150), nullable=False)
    description = Column(Text)
    price = Column(DECIMAL(10, 2), nullable=False)
    image_url = Column(String(255))
    category = Column(String(50))
    stock_status = Column(Integer, default=1)
    artist = relationship("Artist", back_populates="artworks")

class Event(Base):
    __tablename__ = "events"
    event_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    event_date = Column(Date, nullable=False)
    event_time = Column(Time, nullable=False)
    quota = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    organizer_id = Column(Integer, ForeignKey("users.user_id"))

# backend/models.py

class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    event_id = Column(Integer, ForeignKey("events.event_id"))
    participant_count = Column(Integer)
    reservation_status = Column(String(20), default="active") 
    created_at = Column(DateTime, default=func.now())
    reservation_date = Column(String(50)) 
    reservation_time = Column(String(50))
    status = Column(String(50), default="Onaylandı")

class Favorite(Base):
    __tablename__ = "favorites"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    artwork_id = Column(Integer, ForeignKey("artworks.artwork_id"), primary_key=True)
    added_at = Column(TIMESTAMP, server_default=func.now())

class Review(Base):
    __tablename__ = "reviews"
    review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    item_type = Column(String(20), nullable=False)
    item_id = Column(Integer, nullable=False)
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
# models.py
class Order(Base):
    __tablename__ = "orders"
    
    order_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id")) # user_id'nin Users tablonla eşleştiğinden emin ol
    title = Column(String)
    amount = Column(Float)
    status = Column(String, default="Ödendi")
    created_at = Column(DateTime, default=func.now())
    image_url = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
