from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, security
from database import get_db

router = APIRouter(prefix="/support", tags=["Support"])

# 1. KULLANICI: Yeni Destek Talebi Oluşturma
@router.post("/", response_model=schemas.TicketResponse)
def create_ticket(
    ticket: schemas.TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    new_ticket = models.SupportTicket(
        user_id=current_user.user_id,
        subject=ticket.subject,
        message=ticket.message,
        status="Açık"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

# 2. KULLANICI: Sadece Kendi Taleplerini Görme
@router.get("/my-tickets", response_model=list[schemas.TicketResponse])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    tickets = db.query(models.SupportTicket)\
        .filter(models.SupportTicket.user_id == current_user.user_id)\
        .order_by(models.SupportTicket.created_at.desc()).all()
    return tickets

# 3. ADMİN: Tüm Talepleri Görme
@router.get("/all", response_model=list[schemas.TicketResponse])
def get_all_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Bu işlem için admin yetkisi gerekiyor.")
    
    tickets = db.query(models.SupportTicket)\
        .order_by(models.SupportTicket.created_at.desc()).all()
    return tickets

# 4. ADMİN: Talebe Cevap Yazma ve Durum Güncelleme
@router.put("/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_update: schemas.TicketUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Bu işlem için admin yetkisi gerekiyor.")
        
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Talep bulunamadı.")
        
    ticket.status = ticket_update.status
    if ticket_update.admin_response is not None:
        ticket.admin_response = ticket_update.admin_response
        
    db.commit()
    db.refresh(ticket)
    return ticket
@router.post("/{ticket_id}/messages")
def send_message(ticket_id: int, msg: schemas.MessageCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    new_msg = models.SupportMessage(
        ticket_id=ticket_id,
        sender_id=current_user.user_id,
        is_admin=getattr(current_user, "is_admin", False),
        message=msg.message
    )
    db.add(new_msg)
    db.commit()
    return {"message": "Mesaj iletildi"}

@router.get("/{ticket_id}/messages")
def get_messages(ticket_id: int, db: Session = Depends(get_db)):
    return db.query(models.SupportMessage).filter(models.SupportMessage.ticket_id == ticket_id).order_by(models.SupportMessage.created_at.asc()).all()

@router.post("/{ticket_id}/messages")
def send_message(ticket_id: int, msg: schemas.MessageCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    new_msg = models.SupportMessage(
        ticket_id=ticket_id,
        sender_id=current_user.user_id,
        is_admin=getattr(current_user, "is_admin", False),
        message=msg.message
    )
    db.add(new_msg)
    db.commit()
    return {"message": "Mesaj iletildi"}

@router.get("/{ticket_id}/messages")
def get_messages(ticket_id: int, db: Session = Depends(get_db)):
    return db.query(models.SupportMessage).filter(models.SupportMessage.ticket_id == ticket_id).order_by(models.SupportMessage.created_at.asc()).all()