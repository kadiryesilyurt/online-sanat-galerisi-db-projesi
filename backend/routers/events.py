from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/", response_model=list[schemas.EventResponse])
def get_all_events(db: Session = Depends(get_db)):
    """Tüm etkinlikleri listeler"""
    return db.query(models.Event).all()

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    """Tek bir etkinliğin detaylarını getirir"""
    event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return event