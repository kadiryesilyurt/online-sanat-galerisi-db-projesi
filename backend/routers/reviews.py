from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from database import get_db
import models, schemas, security

# Prefix'i main.py'de vereceğimiz için burada boş bırakıyoruz
router = APIRouter(tags=["Reviews"])

# 🚀 ÇÖZÜM: 422 rotası çakışmasını önlemek için özel rotamızı EN ÜSTE aldık!
@router.get("/user/my-votes")
def get_user_votes(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    # Kullanıcının oy verdiği tüm satırları bul
    votes = db.query(models.ReviewVote).filter(models.ReviewVote.user_id == current_user.user_id).all()
    
    # Sadece review_id'leri liste olarak dön
    return [vote.review_id for vote in votes]


@router.post("/", response_model=schemas.ReviewResponse)
def add_review(
    review: schemas.ReviewCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    # Modelde tanımladığımız alanlara uygun şekilde oluşturuyoruz
    new_review = models.Review(
        user_id=current_user.user_id,
        item_type=review.item_type,
        item_id=review.item_id,
        rating=review.rating,
        comment=review.comment,
        helpful_votes=0,
        is_verified_purchase=False # Yeni alan olduğu için varsayılan atadık
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    new_review.user_name = f"{current_user.first_name} {current_user.last_name}"
    return new_review


@router.get("/{item_type}/{item_id}", response_model=list[schemas.ReviewResponse])
def get_reviews_for_item(
    item_type: str, 
    item_id: int, 
    sort_by: str = Query("newest"), # 📊 Filtreleme parametresini ekledik
    db: Session = Depends(get_db)
):
    # Temel sorgu
    query = db.query(models.Review).filter(
        models.Review.item_type == item_type,
        models.Review.item_id == item_id
    )

    # 🛠 Sıralama mantığı
    if sort_by == "highest_rated":
        query = query.order_by(models.Review.rating.desc())
    elif sort_by == "most_helpful":
        query = query.order_by(models.Review.helpful_votes.desc())
    else: # "newest" veya varsayılan
        query = query.order_by(models.Review.created_at.desc())

    reviews = query.all()

    # Kullanıcı ismini ekleyelim
    for r in reviews:
        user = db.query(models.User).filter(models.User.user_id == r.user_id).first()
        r.user_name = f"{user.first_name} {user.last_name}" if user else "Kullanıcı"
    
    return reviews


@router.get("/{item_type}/{item_id}/stats", response_model=schemas.ReviewStatsResponse)
def get_stats(item_type: str, item_id: int, db: Session = Depends(get_db)):
    stats = db.query(func.avg(models.Review.rating).label("avg"), func.count(models.Review.review_id).label("cnt")).filter(models.Review.item_type == item_type, models.Review.item_id == item_id).first()
    return {"average_rating": round(stats.avg or 0, 1), "total_reviews": stats.cnt or 0}


@router.post("/{review_id}/helpful")
def vote_helpful(review_id: int, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    existing_vote = db.query(models.ReviewVote).filter(
        models.ReviewVote.review_id == review_id, 
        models.ReviewVote.user_id == current_user.user_id
    ).first()
    
    if existing_vote:
        return {"message": "Zaten oy verdin kanka"}
        
    new_vote = models.ReviewVote(review_id=review_id, user_id=current_user.user_id)
    db.add(new_vote)
    
    # 🚀 YORUMUN KENDİ OY SAYISINI ARTIRIYORUZ
    review = db.query(models.Review).filter(models.Review.review_id == review_id).first()
    if review:
        review.helpful_votes += 1
        
    db.commit()
    return {"message": "Oyun başarıyla kaydedildi"}


@router.post("/{review_id}/remove-helpful")
def remove_vote(
    review_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(security.get_current_user)
):
    vote = db.query(models.ReviewVote).filter(
        models.ReviewVote.review_id == review_id, 
        models.ReviewVote.user_id == current_user.user_id 
    ).first()
    
    if vote:
        db.delete(vote)
        
        # 🚀 YORUMUN KENDİ OY SAYISINI AZALTIYORUZ
        review = db.query(models.Review).filter(models.Review.review_id == review_id).first()
        if review and review.helpful_votes > 0:
            review.helpful_votes -= 1
            
        db.commit()
        return {"message": "Kendi oyun başarıyla silindi."}
    else:
        return {"message": "Bu yorumda sana ait bir oy bulunamadı."}


@router.get("/{review_id}/has-voted")
def has_voted(
    review_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    # Veritabanında bir "UserReviewVotes" tablon yoksa, 
    # en azından o yoruma dair "vote_status" bilgisini dönebiliriz.
    # Şimdilik en hızlı çözüm:
    return {"has_voted": False} # Gerçek takip için ReviewVote tablosu şart kanka!

@router.post("/{review_id}/reply")
def reply_to_review(
    review_id: int, 
    reply_data: schemas.AdminReplyCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    # 🛡️ Sadece admin yetkisi olanlar yanıt verebilsin
    if not current_user.is_admin and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Buna yetkin yok kral!")
        
    review = db.query(models.Review).filter(models.Review.review_id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
        
    # Yanıtı veritabanına kaydet
    review.admin_reply = reply_data.reply
    db.commit()
    
    return {"message": "Yönetici yanıtı başarıyla eklendi!"}