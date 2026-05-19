from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security
from schemas import ArtworkUpdateSchema

router = APIRouter(prefix="/artworks", tags=["Artworks"])

@router.get("/", response_model=list[schemas.ArtworkResponse])
def get_artworks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Eserleri çekerken Artists tablosunu da birleştirip "artist_name" sütununu alıyoruz
    artworks = db.query(
        models.Artwork.artwork_id,
        models.Artwork.title,
        models.Artwork.description,
        models.Artwork.price,
        models.Artwork.image_url,
        models.Artwork.category,
        models.Artwork.stock_status,
        models.Artist.name.label("artist_name")
    ).outerjoin(
        models.Artist, models.Artwork.artist_id == models.Artist.artist_id
    ).offset(skip).limit(limit).all()
    
    return artworks

@router.get("/{artwork_id}", response_model=schemas.ArtworkResponse)
def get_artwork(artwork_id: int, db: Session = Depends(get_db)):
    # Tekil eser çekerken de sanatçı adını ekliyoruz ki detay sayfasında hata olmasın
    artwork = db.query(
        models.Artwork.artwork_id,
        models.Artwork.title,
        models.Artwork.description,
        models.Artwork.price,
        models.Artwork.image_url,
        models.Artwork.category,
        models.Artwork.stock_status,
        models.Artist.name.label("artist_name"),
        models.Artist.biography.label("artist_biography")
    ).outerjoin(
        models.Artist, models.Artwork.artist_id == models.Artist.artist_id
    ).filter(models.Artwork.artwork_id == artwork_id).first()
    
    if not artwork:
        raise HTTPException(status_code=404, detail="Eser bulunamadı")
        
    return artwork

@router.post("/", response_model=schemas.ArtworkResponse)
def create_artwork(
    artwork: schemas.ArtworkCreate, 
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.get_admin_user) # Sadece admin ekleyebilir
):
    new_artwork = models.Artwork(
        title=artwork.title,
        artist_id=artwork.artist_id, # Frontend'den gelen ilişkisel ID'yi bağlıyoruz
        price=artwork.price,
        image_url=artwork.image_url,
        category=artwork.category,
        description=artwork.description,
        stock_status=artwork.stock_status
    )
    db.add(new_artwork)
    db.commit()
    db.refresh(new_artwork)
    return new_artwork

@router.post("/", response_model=schemas.ArtworkResponse, status_code=status.HTTP_201_CREATED)
def create_artwork(
    artwork: schemas.ArtworkCreate, # schemas.py'de ArtworkCreate olduğundan emin ol
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.get_admin_user)
):
    new_artwork = models.Artwork(**artwork.dict())
    db.add(new_artwork)
    db.commit()
    db.refresh(new_artwork)
    return new_artwork

# 🗑️ ESER SİLME (Sadece Admin)
@router.delete("/{artwork_id}")
def delete_artwork(
    artwork_id: int, 
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.get_admin_user)
):
    artwork = db.query(models.Artwork).filter(models.Artwork.id == artwork_id).first()
    if not artwork:
        raise HTTPException(status_code=404, detail="Eser bulunamadı")
    
    db.delete(artwork)
    db.commit()
    return {"message": "Eser başarıyla silindi!"}

@router.put("/{artwork_id}")
def update_artwork(artwork_id: int, artwork: ArtworkUpdateSchema, db: Session = Depends(get_db)):
    # Eseri veritabanında bul
    db_artwork = db.query(models.Artwork).filter(models.Artwork.artwork_id == artwork_id).first()
    
    if not db_artwork:
        raise HTTPException(status_code=404, detail="Eser bulunamadı")
    
    # Gelen yeni verileri mevcut eserin üzerine yaz
    db_artwork.title = artwork.title
    db_artwork.description = artwork.description
    db_artwork.price = artwork.price
    db_artwork.image_url = artwork.image_url
    db_artwork.artist_id = artwork.artist_id
    
    db.commit()
    db.refresh(db_artwork)
    return db_artwork