from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/", response_model=list[schemas.EventResponse])
def get_all_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return event

# 🔥 YENİ: ETKİNLİK İSTATİSTİKLERİ (Doluluk, Puan ve Rezervasyon)
@router.get("/{event_id}/stats")
def get_event_stats(event_id: int, db: Session = Depends(get_db)):
    # 1. Etkinliği ve kontenjanını bul
    event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı kanka")

    # 2. İptal edilmemiş rezervasyonları çek
    reservations = db.query(models.Reservation).filter(
        models.Reservation.event_id == event_id,
        models.Reservation.status != "İptal Edildi"
    ).all()

    total_reservations = len(reservations) # Toplam yapılan rezervasyon işlemi sayısı
    total_participants = sum(res.participant_count for res in reservations if res.participant_count) # Toplam koltuk sayısı

    # 3. Doluluk Oranı Hesaplama
    occupancy_rate = 0.0
    if event.quota and event.quota > 0:
        occupancy_rate = round((total_participants / event.quota) * 100, 1)
        if occupancy_rate > 100: occupancy_rate = 100.0  # Güvenlik sınırı

    # 4. Etkinliğe Yapılan Yorumların Ortalama Puanı
    reviews = db.query(models.Review.rating).filter(
        models.Review.item_type == "event",
        models.Review.item_id == event_id
    ).all()

    avg_rating = 0.0
    if reviews:
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)

    return {
        "total_reservations": total_reservations,
        "total_participants": total_participants,
        "occupancy_rate": occupancy_rate,
        "average_rating": avg_rating
    }