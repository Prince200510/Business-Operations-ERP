from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse

router = APIRouter(prefix = "/api/v1/customers", tags = ["Customers"])

@router.post("/", response_model = CustomerResponse, status_code = 201)
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    customer = Customer(user_id = user_id, name = customer_data.name, address = customer_data.address)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/", response_model = list[CustomerResponse])
def get_customers(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    customers = db.query(Customer).filter(Customer.user_id == user_id).order_by(Customer.id.desc()).all()
    return customers

@router.get("/{customer_id}", response_model = CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    customer = (db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == user_id).first())
    
    if not customer:
        raise HTTPException(status_code = 404, detail = "Customer not found")
    
    return customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    customer = (db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == user_id).first())
    
    if not customer:
        raise HTTPException(status_code = 404, detail = "Customer not found")
    
    db.delete(customer)
    db.commit()
    
    return {"message": "Customer deleted successfully"}