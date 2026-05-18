from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/", response_model=schemas.ReviewResponse)
def add_review(review: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    new_review = models.Review(
        user_id=current_user.user_id,
        item_type=review.item_type,
        item_id=review.item_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/{item_type}/{item_id}", response_model=list[schemas.ReviewResponse])
def get_reviews_for_item(item_type: str, item_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(
        models.Review.item_type == item_type,
        models.Review.item_id == item_id
    ).all()