from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.lead import Lead
from app.schemas.lead import LeadCreate, LeadResponse

router = APIRouter(prefix="/api/v1/leads", tags=["Leads"])

@router.post("/", response_model=LeadResponse, status_code=201)
def create_lead(lead_data: LeadCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    lead = Lead(user_id=user_id, **lead_data.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.get("/", response_model=list[LeadResponse])
def get_leads(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    leads = db.query(Lead).filter(Lead.user_id == user_id).order_by(Lead.id.desc()).all()
    return leads

@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.user_id == user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, lead_data: LeadCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.user_id == user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    for key, value in lead_data.model_dump().items():
        setattr(lead, key, value)
        
    db.commit()
    db.refresh(lead)
    return lead

@router.delete("/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.user_id == user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}
