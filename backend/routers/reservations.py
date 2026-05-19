from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date 
from database import get_db
import models, schemas, security
from typing import Any
from pydantic import BaseModel

class ReservationStatusUpdate(BaseModel):
    status: str

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("/all")
def get_all_reservations(db: Session = Depends(get_db)):
    reservations = db.query(models.Reservation).order_by(models.Reservation.reservation_date.desc()).all()
    
    result = []
    for res in reservations:
        event = db.query(models.Event).filter(models.Event.event_id == res.event_id).first()
        ticket_price = getattr(event, "price", 100.0) if event else 100.0
        
        result.append({
            "reservation_id": res.reservation_id,
            "event_id": res.event_id,
            "reservation_date": res.reservation_date,
            "reservation_time": res.reservation_time,
            "participant_count": res.participant_count,
            "status": res.status,
            "total_amount": res.participant_count * ticket_price,
            "event_title": event.title if event else "Bilinmeyen Etkinlik"
        })
    return result

@router.post("/", response_model=Any)
def create_reservation(
    res: schemas.ReservationCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    event = db.query(models.Event).filter(models.Event.event_id == res.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
        
    if event.quota < res.participant_count:
        raise HTTPException(status_code=400, detail="Yeterli kontenjan yok!")

    ticket_price = getattr(event, "price", 100.0)
    total = res.participant_count * ticket_price

    new_reservation = models.Reservation(
        user_id=current_user.user_id,
        event_id=res.event_id,
        reservation_date=res.reservation_date,
        reservation_time=res.reservation_time,
        participant_count=res.participant_count,
        reservation_status="active",
        status="Beklemede"
    )
    
    db.add(new_reservation)
    event.quota -= res.participant_count
    
    db.commit()
    db.refresh(new_reservation)
    return schemas.ReservationResponse.model_validate(new_reservation)

@router.get("/")
def get_user_reservations(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    reservations = db.query(models.Reservation).filter(models.Reservation.user_id == current_user.user_id).all()
    
    result = []
    for res in reservations:
        event = db.query(models.Event).filter(models.Event.event_id == res.event_id).first()
        result.append({
            "id": res.reservation_id,
            "title": event.title if event else "Sanat Atölyesi",
            "date": res.reservation_date,
            "time": res.reservation_time,
            "participant_count": res.participant_count,
            "status": res.status,
            "total_amount": getattr(res, "total_amount", res.participant_count * getattr(event, "price", 100.0) if event else 0)
        })
    return result

@router.put("/{reservation_id}")
def update_reservation(
    reservation_id: int, 
    res_data: schemas.ReservationUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_res = db.query(models.Reservation).filter(
        models.Reservation.reservation_id == reservation_id,
        models.Reservation.user_id == current_user.user_id
    ).first()
    
    if not db_res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    
    if db_res.reservation_date == date.today():
        raise HTTPException(
            status_code=400, 
            detail="Etkinlik günü geldiği için bu rezervasyon üzerinde artık düzenleme yapılamaz!"
        )

    event = db.query(models.Event).filter(models.Event.event_id == db_res.event_id).first()
    
    if event:
        diff = db_res.participant_count - res_data.participant_count
        
        if event.quota + diff < 0:
            raise HTTPException(status_code=400, detail="Yetersiz kontenjan!")
        
        event.quota += diff
        db.add(event)

        if res_data.participant_count != db_res.participant_count:
            ticket_price = getattr(event, "price", 100.0)
            
            if hasattr(db_res, "total_amount"):
                db_res.total_amount = res_data.participant_count * ticket_price

    if hasattr(res_data, "reservation_date") and res_data.reservation_date:
        db_res.reservation_date = res_data.reservation_date
        
    db_res.participant_count = res_data.participant_count
    db_res.status = "Beklemede"
    
    db.commit()
    return {"message": "Rezervasyon başarıyla güncellendi!"}

@router.delete("/{reservation_id}")
def delete_reservation(
    reservation_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    res = db.query(models.Reservation).filter(
        models.Reservation.reservation_id == reservation_id,
        models.Reservation.user_id == current_user.user_id
    ).first()
    
    if not res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı")

    event = db.query(models.Event).filter(models.Event.event_id == res.event_id).first()
    if event:
        event.quota += res.participant_count
        db.add(event)

    db.delete(res)
    db.commit()
    
    return {"message": "Rezervasyon iptal edildi, kontenjan güncellendi."}

@router.patch("/{reservation_id}/status")
def update_reservation_status(
    reservation_id: int,
    status_data: ReservationStatusUpdate,
    db: Session = Depends(get_db)
):
    res = db.query(models.Reservation).filter(models.Reservation.reservation_id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")

    if status_data.status == "Reddedildi" and res.status != "Reddedildi":
        event = db.query(models.Event).filter(models.Event.event_id == res.event_id).first()
        if event:
            event.quota += res.participant_count
            db.add(event)

    res.status = status_data.status
    db.commit()
    return {"message": f"Rezervasyon başarıyla {status_data.status}!"}