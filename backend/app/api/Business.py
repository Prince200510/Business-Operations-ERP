from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.Business import Business
from app.schemas.Business import BusinessCreate, BusinessResponse

router = APIRouter(prefix = "/api/v1/business", tags = ["Business"])

@router.post("/", response_model = BusinessResponse, status_code = 200)
def create_or_update_business(business_data: BusinessCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    business = db.query(Business).filter(Business.user_id == user_id).first()
    
    if business:
        business.name = business_data.name
        business.business_name = business_data.business_name
        business.address = business_data.address
        business.phone_no1 = business_data.phone_no1
        business.phone_no2 = business_data.phone_no2
        business.email_id = business_data.email_id
        business.website_link = business_data.website_link
    else:
        business = Business(
            user_id = user_id,
            name = business_data.name,
            business_name = business_data.business_name,
            address = business_data.address,
            phone_no1 = business_data.phone_no1,
            phone_no2 = business_data.phone_no2,
            email_id = business_data.email_id,
            website_link = business_data.website_link
        )
        db.add(business)
        
    db.commit()
    db.refresh(business)
    return business

@router.get("/", response_model = BusinessResponse)
def get_business(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    business = db.query(Business).filter(Business.user_id == user_id).first()
    
    if not business:
        raise HTTPException(status_code = 404, detail = "Business not found")
    
    return business