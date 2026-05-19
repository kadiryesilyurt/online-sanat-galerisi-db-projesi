from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import artworks, events, reservations, users, favorites, reviews, orders, artists, support
import models
from database import engine

# Veritabanı tablolarını otomatik oluştur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Online Sanat Galerisi API")

# CORS Ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(users.router, prefix="/api")
app.include_router(artworks.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(reservations.router, prefix="/api/panel")
app.include_router(favorites.router, prefix="/api/panel")
app.include_router(reviews.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(artists.router)
app.include_router(support.router, prefix="/api")
@app.get("/")
def read_root():
    return {"mesaj": "API Başarıyla Çalışıyor. Dökümantasyon için /docs adresine gidin."}