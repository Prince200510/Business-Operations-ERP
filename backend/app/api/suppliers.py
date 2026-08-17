from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.supplier import Supplier
from app.schemas.supplier import (SupplierCreate, SupplierResponse)

router = APIRouter(
    prefix="/api/v1/suppliers",
    tags=["Suppliers"]
)

@router.get("/", response_model = list[SupplierResponse])
def get_supplier(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    suppliers = (db.query(Supplier).filter(Supplier.user_id == user_id).all())
    return suppliers

@router.post("/", response_model = SupplierResponse, status_code = 201)
def create_supplier(supplier_data: SupplierCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    supplier = Supplier(
        user_id = user_id,
        name = supplier_data.name,
        email = supplier_data.email,
        phone_number = supplier_data.phone_number,
        address = supplier_data.address
    )
    
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    
    return supplier

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    supplier = (db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.user_id == user_id).first())
    
    if not supplier:
        raise HTTPException(status_code = 404, detail = "Supplier not found")
    
    db.delete(supplier)
    db.commit()
    
    return {
        "message": "Supplier deleted successfully"
    }