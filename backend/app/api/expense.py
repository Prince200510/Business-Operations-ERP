from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.user import User
from app.modules.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseResponse

router = APIRouter(prefix="/api/v1/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense_data: ExpenseCreate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    new_expense = Expense(
        user_id=current_user_id,
        category=expense_data.category,
        description=expense_data.description,
        amount=expense_data.amount,
        expense_date=expense_data.expense_date or datetime.utcnow()
    )
    
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    
    return new_expense

@router.get("/", response_model=List[ExpenseResponse])
def get_all_expenses(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    expenses = db.query(Expense).filter(Expense.user_id == current_user_id).order_by(Expense.expense_date.desc()).all()
    return expenses

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    expense = db.query(Expense).filter(Expense.id == expense_id,  Expense.user_id == current_user_id).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    
    return {"message": "Expense deleted successfully"}
