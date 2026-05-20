from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, TIMESTAMP, Date, Time, DateTime,Float, Boolean, func, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
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
    view_count = Column(Integer, default=0)
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
    item_type = Column(String) 
    item_id = Column(Integer)
    rating = Column(Integer)
    comment = Column(Text)
    helpful_votes = Column(Integer, default=0)
    admin_reply = Column(Text, nullable=True)           # DBeaver'da var, ekledik!
    is_verified_purchase = Column(Boolean, default=False) # DBeaver'da var, ekledik!
    created_at = Column(DateTime, default=func.now())
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


class ReviewVote(Base):
    __tablename__ = "review_votes"
    
    vote_id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.review_id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    
    # Bir kullanıcı bir yoruma sadece bir kez oy verebilir (Unique constraint)
    __table_args__ = (UniqueConstraint('review_id', 'user_id', name='_user_review_vote_uc'),)
class SupportTicket(Base):
    __tablename__ = "support_tickets"

    ticket_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    subject = Column(String(150), nullable=False)  # Konu (Örn: Siparişim Nerede?)
    message = Column(Text, nullable=False)         # Kullanıcının mesajı
    admin_response = Column(Text, nullable=True)   # Adminin (bizim) yazdığımız cevap
    status = Column(String(50), default="Açık")    # Durum: Açık, İşlemde, Çözüldü
    created_at = Column(DateTime, default=datetime.utcnow)

    # User tablosuyla bağlantı kuralım
    owner = relationship("User")    
class SupportMessage(Base):
    __tablename__ = "support_messages"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.ticket_id"))
    sender_id = Column(Integer) # Mesajı atan kişinin ID'si
    is_admin = Column(Boolean, default=False) # Admin mi attı?
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SavedComparison(Base):
    __tablename__ = "saved_comparisons"
    
    comparison_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    item_type = Column(String(50))  # 'artwork' veya 'event' olacak
    item_ids = Column(String(255))  # Karşılaştırılan ID'leri virgülle tutacağız (Örn: "1,4,5")
    created_at = Column(DateTime, default=func.now())
