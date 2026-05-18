from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/", response_model=schemas.FavoriteResponse)
def add_to_favorites(fav: schemas.FavoriteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    artwork = db.query(models.Artwork).filter(models.Artwork.artwork_id == fav.artwork_id).first()
    if not artwork:
        raise HTTPException(status_code=404, detail="Eser bulunamadı")

    existing_fav = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.user_id,
        models.Favorite.artwork_id == fav.artwork_id
    ).first()
    
    if existing_fav:
        raise HTTPException(status_code=400, detail="Bu eser zaten favorilerinizde!")

    new_fav = models.Favorite(user_id=current_user.user_id, artwork_id=fav.artwork_id)
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav

@router.get("/", response_model=list[schemas.FavoriteResponse])
def get_my_favorites(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    return db.query(models.Favorite).filter(models.Favorite.user_id == current_user.user_id).all()