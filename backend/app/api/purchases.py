from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.purchase import Purchase
from app.modules.product import Product
from app.modules.supplier import Supplier
from app.schemas.purchase import PurchaseCreate, PurchaseResponse

router = APIRouter(prefix = "/api/v1/purchases", tags = ["Purchases"])

@router.post("/", response_model = PurchaseResponse, status_code = 201)
def create_purchase(purchase_data: PurchaseCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    supplier = (db.query(Supplier).filter(Supplier.id == purchase_data.supplier_id, Supplier.user_id == user_id).first())
    
    if not supplier:
        raise HTTPException(status_code = 404, detail = "Supplier not found")

    product = (db.query(Product).filter(Product.name == purchase_data.product_name, Product.user_id == user_id).first())
    
    if not product:
        product = Product(
            user_id = user_id,
            supplier_id = purchase_data.supplier_id,
            name = purchase_data.product_name,
            purchase_price = purchase_data.purchase_price,
            sale_price = 0,
            quantity = 0
        )
        db.add(product)
        db.flush()
    
    item_total = purchase_data.purchase_price * purchase_data.quantity
    final_total = item_total - purchase_data.discount
    
    if final_total < 0:
        raise HTTPException(status_code = 400, detail = "Discount cannot be greater than item total")
    
    purchase = Purchase(
        user_id = user_id,
        supplier_id = purchase_data.supplier_id,
        product_id = product.id,
        quantity = purchase_data.quantity,
        purchase_price = purchase_data.purchase_price,
        item_total = item_total,
        discount = purchase_data.discount,
        final_total = final_total,
        payment_method = purchase_data.payment_method
    )
    
    db.add(purchase)
    product.quantity += purchase_data.quantity
    db.commit()
    db.refresh(purchase)
    
    return purchase

@router.get("/", response_model = list[PurchaseResponse])
def get_purchases(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    purchases = (db.query(Purchase).filter(Purchase.user_id == user_id).order_by(Purchase.id.desc()).all())
    return purchases