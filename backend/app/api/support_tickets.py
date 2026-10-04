from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.support_ticket import SupportTicket
from app.schemas.support_ticket import SupportTicketCreate, SupportTicketResponse

router = APIRouter(prefix="/api/v1/support_tickets", tags=["Support Tickets"])

@router.post("/", response_model=SupportTicketResponse, status_code=201)
def create_ticket(ticket_data: SupportTicketCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    ticket = SupportTicket(user_id=user_id, **ticket_data.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/", response_model=list[SupportTicketResponse])
def get_tickets(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == user_id).order_by(SupportTicket.id.desc()).all()
    return tickets

@router.get("/{ticket_id}", response_model=SupportTicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id, SupportTicket.user_id == user_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/{ticket_id}", response_model=SupportTicketResponse)
def update_ticket(ticket_id: int, ticket_data: SupportTicketCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id, SupportTicket.user_id == user_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    for key, value in ticket_data.model_dump().items():
        setattr(ticket, key, value)
        
    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/{ticket_id}")
def delete_ticket(ticket_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id, SupportTicket.user_id == user_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    return {"message": "Ticket deleted successfully"}
