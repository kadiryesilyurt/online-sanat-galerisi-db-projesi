from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security
from typing import Any

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/", response_model=Any)
def toggle_favorite(fav: schemas.FavoriteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    # 1. Eserin varlığını kontrol et
    artwork = db.query(models.Artwork).filter(models.Artwork.artwork_id == fav.artwork_id).first()
    if not artwork:
        raise HTTPException(status_code=404, detail="Eser bulunamadı")

    # 2. Daha önce favoriye eklenmiş mi?
    existing_fav = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.user_id,
        models.Favorite.artwork_id == fav.artwork_id
    ).first()
    
    # 3. TOGGLE MANTIĞI: Varsa SİL, yoksa EKLE
    if existing_fav:
        db.delete(existing_fav)
        db.commit()
        return {"message": "Favorilerden kaldırıldı", "status": "removed"}

    new_fav = models.Favorite(user_id=current_user.user_id, artwork_id=fav.artwork_id)
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    
    # DÜZELTME BURADA: Modeli doğrudan döndürmüyoruz, JSON'a uygun sözlük döndürüyoruz
    return {
        "user_id": new_fav.user_id,
        "artwork_id": new_fav.artwork_id,
        "status": "added"
    }

@router.get("/", response_model=list[schemas.FavoriteResponse])
def get_my_favorites(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    # Favorileri çek
    favorites = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.user_id).all()
    
    detailed_favorites = []
    for fav in favorites:
        artwork = db.query(models.Artwork).filter(models.Artwork.artwork_id == fav.artwork_id).first()
        if artwork:
            
            detailed_favorites.append({
                "user_id": current_user.user_id,
                "id": fav.artwork_id, 
                "artwork_id": artwork.artwork_id,
                "title": artwork.title,
                "artist_name": artwork.artist.name if artwork.artist else "Bilinmiyor",
                "price": artwork.price,
                "image_url": artwork.image_url
            })
    return detailed_favorites