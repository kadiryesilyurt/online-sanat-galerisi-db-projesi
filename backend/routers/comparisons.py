from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

router = APIRouter(tags=["Comparisons"])

# 1. Karşılaştırmayı Kaydet
@router.post("/comparisons", response_model=schemas.ComparisonResponse)
def save_comparison(
    comp: schemas.ComparisonCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(security.get_current_user)
):
    # Frontend'den gelen [1, 4] gibi listeyi veritabanı için "1,4" string formatına çeviriyoruz
    item_ids_str = ",".join(map(str, comp.item_ids))
    
    new_comp = models.SavedComparison(
        user_id=current_user.user_id,
        item_type=comp.item_type,
        item_ids=item_ids_str
    )
    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)
    return new_comp

# 2. Kullanıcının Karşılaştırmalarını Getir
@router.get("/comparisons", response_model=list[schemas.ComparisonResponse])
def get_comparisons(
    db: Session = Depends(get_db), 
    current_user = Depends(security.get_current_user)
):
    return db.query(models.SavedComparison).filter(
        models.SavedComparison.user_id == current_user.user_id
    ).order_by(models.SavedComparison.created_at.desc()).all()

# 3. Karşılaştırmayı Sil
@router.delete("/comparisons/{comp_id}")
def delete_comparison(
    comp_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(security.get_current_user)
):
    comp = db.query(models.SavedComparison).filter(
        models.SavedComparison.comparison_id == comp_id, 
        models.SavedComparison.user_id == current_user.user_id
    ).first()
    
    if not comp:
        raise HTTPException(status_code=404, detail="Karşılaştırma bulunamadı.")
    
    db.delete(comp)
    db.commit()
    return {"message": "Karşılaştırma başarıyla silindi."}