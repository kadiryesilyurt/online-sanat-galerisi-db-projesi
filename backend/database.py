import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 🚀 ÇÖZÜM BURADA: engine oluşturulurken parametreler eklendi
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Her sorgudan önce bağlantı koptu mu diye kontrol et, koptuysa yenile
    pool_recycle=300     # Bağlantıları 5 dakikada (300 saniye) bir sıfırlayarak taze tut
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()