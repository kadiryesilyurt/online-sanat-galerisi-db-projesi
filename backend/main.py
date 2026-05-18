from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import artworks, events, reservations, users, favorites, reviews
import models
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Online Sanat Galerisi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(artworks.router)
app.include_router(events.router)
app.include_router(reservations.router)
app.include_router(favorites.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"mesaj": "API Başarıyla Çalışıyor. Dökümantasyon için /docs adresine gidin."}