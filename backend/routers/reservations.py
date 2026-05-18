from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("/", response_model=schemas.ReservationResponse)
def create_reservation(res: schemas.ReservationCreate, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.event_id == res.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
        
    if event.quota < res.participant_count:
        raise HTTPException(status_code=400, detail="Yeterli kontenjan yok!")

    new_reservation = models.Reservation(**res.model_dump())
    db.add(new_reservation)
    event.quota -= res.participant_count
    
    db.commit()
    db.refresh(new_reservation)
    return new_reservation