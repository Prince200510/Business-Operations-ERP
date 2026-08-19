from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.product import Product
from app.modules.supplier import Supplier
from app.schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/api/v1/products", tags=["Products"])

@router.get("/", response_model = list[ProductResponse])
def get_products(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    products = (db.query(Product).filter(Product.user_id == user_id).all())
    
    product_data = []
    for product in products:
        total_profit = (product.sale_price - product.purchase_price) * product.quantity
        product_data.append({
            "id": product.id,
            "supplier_id": product.supplier_id,
            "name": product.name,
            "purchase_price": product.purchase_price,
            "sale_price": product.sale_price,
            "quantity": product.quantity,
            "total_profit": total_profit
        })
        
    return product_data

@router.post("/", response_model = ProductResponse, status_code = 201)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    supplier = (db.query(Supplier).filter(Supplier.id == product_data.supplier_id, Supplier.user_id == user_id).first())
    
    if not supplier:
        raise HTTPException(status_code = 404, detail = "Supplier not found")
    
    product = Product(
        user_id = user_id,
        supplier_id = product_data.supplier_id,
        name = product_data.name,
        purchase_price = product_data.purchase_price,
        sale_price = product_data.sale_price,
        quantity = product_data.quantity
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    
    total_profit = (product.sale_price - product.purchase_price) * product.quantity
    
    return {
        "id": product.id,
        "supplier_id": product.supplier_id,
        "name": product.name,
        "purchase_price": product.purchase_price,
        "sale_price": product.sale_price,
        "quantity": product.quantity,
        "total_profit": total_profit
    }

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    product = (db.query(Product).filter(Product.id == product_id, Product.user_id == user_id).first())
    
    if not product:
        raise HTTPException(status_code = 404, detail = "Product not found")
    
    db.delete(product)
    db.commit()
    
    return {"message": "Product deleted successfully"}