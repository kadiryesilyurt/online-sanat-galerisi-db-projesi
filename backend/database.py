import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# .env dosyasından veritabanı linkini çekiyoruz
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Hata aldığın ve eksik olan kısım burası:
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()