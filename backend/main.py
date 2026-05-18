from fastapi import FastAPI
from routers import artworks, events, reservations

app = FastAPI(title="Online Sanat Galerisi API")
app.include_router(artworks.router)
app.include_router(events.router)
app.include_router(reservations.router)

@app.get("/")
def read_root():
    return {"mesaj": "Backend tıkır tıkır çalışıyor!"}

