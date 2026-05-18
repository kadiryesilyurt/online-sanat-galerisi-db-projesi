from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/artworks", tags=["Artworks"])

@router.get("/", response_model=list[schemas.ArtworkResponse])
def get_artworks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    artworks = db.query(models.Artwork).offset(skip).limit(limit).all()
    return artworks

@router.get("/{artwork_id}", response_model=schemas.ArtworkResponse)
def get_artwork(artwork_id: int, db: Session = Depends(get_db)):
    artwork = db.query(models.Artwork).filter(models.Artwork.artwork_id == artwork_id).first()
    if not artwork:
        raise HTTPException(status_code=404, detail="Eser bulunamadı")
    return artwork

@router.post("/", response_model=schemas.ArtworkResponse)
def create_artwork(artwork: schemas.ArtworkCreate, db: Session = Depends(get_db)):
    new_artwork = models.Artwork(**artwork.model_dump())
    db.add(new_artwork)
    db.commit()
    db.refresh(new_artwork)
    return new_artwork