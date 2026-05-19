from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security
from sqlalchemy import func

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Sanat eserini veritabanından çekip görselini alıyoruz
    artwork = db.query(models.Artwork).filter(models.Artwork.artwork_id == order.item_id).first()
    if not artwork:
        raise HTTPException(status_code=404, detail="Sanat eseri bulunamadı.")

    # Siparişi oluştururken image_url'i de ekliyoruz
    new_order = models.Order(
        user_id=current_user.user_id,
        title=artwork.title, 
        amount=order.total_price,
        image_url=artwork.image_url,
        payment_method=order.payment_method,
        status="Ödendi"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.user_id).all()
    return orders

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id, models.Order.user_id == current_user.user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    db.delete(order)
    db.commit()
    return {"message": "Sipariş başarıyla iptal edildi."}
# 📦 routers/orders.py içindeki /all endpointi:
@router.get("/all")
def get_all_orders(db: Session = Depends(get_db), admin_user: models.User = Depends(security.get_admin_user)):
    # Bak! Yukarıda get_admin_user kullandık. Sadece is_admin=True olanlar burayı çalıştırabilir.
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return orders

# 📅 routers/reservations.py (varsa) içine şunu ekle:
@router.get("/all")
def get_all_reservations(db: Session = Depends(get_db), admin_user: models.User = Depends(security.get_admin_user)):
    # Tüm kullanıcıların rezervasyonlarını getirir
    reservations = db.query(models.Reservation).all()
    return reservations
# 🚀 ADMİN İÇİN: Sipariş durumunu günceller (Örn: Ödendi -> Kargoya Verildi)
@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int, 
    new_status: str, # Frontend'den gelecek yeni durum
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    
    order.status = new_status
    db.commit()
    return {"message": "Sipariş durumu başarıyla güncellendi!"}
@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):

    total_sales = db.query(models.Order).filter(models.Order.status == "Teslim Edildi").with_entities(func.sum(models.Order.amount)).scalar() or 0
    
   
    pending_orders = db.query(models.Order).filter(models.Order.status == "Hazırlanıyor").count()
    
    
    active_artworks = db.query(models.Artwork).count()
    
    return {
        "total_sales": total_sales,
        "pending_orders": pending_orders,
        "active_artworks": active_artworks
    }
@router.get("/recent-activities")
def get_recent_activities(db: Session = Depends(get_db)):
    # Veritabanındaki en son 5 işlemi çekiyoruz
    activities = db.query(models.Order).order_by(models.Order.created_at.desc()).limit(5).all()
    
    return [
        {
            "id": act.order_id,
            "description": f"Sipariş #{act.order_id} - {act.status}",
            "amount": act.amount,
            "date": act.created_at.strftime("%d.%m.%Y")
        } for act in activities
    ]