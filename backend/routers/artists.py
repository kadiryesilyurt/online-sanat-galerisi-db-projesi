# backend/routers/artists.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

router = APIRouter(prefix="/api/artists", tags=["Artists"])
@router.get("/", response_model=list[schemas.ArtistResponse])
def get_all_artists(db: Session = Depends(get_db)):
    # Veritabanındaki tüm sanatçıları getiriyoruz
    return db.query(models.Artist).all()
@router.post("/")
def create_artist(
    artist: schemas.ArtistCreate, 
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.get_admin_user) # Sadece admin ekleyebilir
):
    new_artist = models.Artist(
        name=artist.name,
        biography=artist.biography
    )
    db.add(new_artist)
    db.commit()
    db.refresh(new_artist)
    return new_artist