from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import get_db
import models
from jose import jwt
from security import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/panel/tickets", tags=["Tickets"])

@router.get("")
@router.get("/")
def get_my_tickets(request: Request, db: Session = Depends(get_db)):
    user_id = 1  # Demo Fallback
    auth_header = request.headers.get("Authorization")
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            user = db.query(models.User).filter(models.User.email == email).first()
            if user:
                user_id = user.user_id
        except:
            pass
            
    return db.query(models.SupportTicket).filter(models.SupportTicket.user_id == user_id).all()