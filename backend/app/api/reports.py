from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.sale_order import SaleOrder
from app.modules.sale_order_item import SaleOrderItem
from app.modules.customer import Customer
from app.modules.product import Product
from app.modules.supplier import Supplier

router = APIRouter(prefix = "/api/v1/reports", tags = ["Reports"])

@router.get("/dashboard")
def get_dashbaord_report(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year
    
    total_sales = (db.query(func.count(SaleOrder.id)).filter(SaleOrder.user_id == user_id).scalar()) or 0
    sales_this_month = (db.query(func.count(SaleOrder.id)).filter(SaleOrder.user_id == user_id, extract("month", SaleOrder.created_at) == current_month, extract("year", SaleOrder.created_at) == current_year).scalar()) or 0
    total_pruchases = 0
    active_suppliers = (db.query(func.count(Supplier.id)).filter(Supplier.user_id == user_id).scalar()) or 0
    products = (db.query(Product).filter(Product.user_id == user_id).order_by(Product.id.desc()).all())
    
    monthly_sales = []
    for month in range(1, 13):
        count = (db.query(func.count(SaleOrder.id)).filter(SaleOrder.user_id == user_id, extract("month", SaleOrder.created_at) == month, extract("year", SaleOrder.created_at) == current_year).scalar()) or 0
        monthly_sales.append({"month": month, "count": count})

    products_data = []
    for product in products:
        products_data.append({"id": product.id, "name": product.name, "supplier_id": product.supplier_id, "sale_price": float(product.sale_price), "quantity": float(product.quantity)})
        
    return {
        "summary": {
            "total_sales": total_sales,
            "sales_this_month": sales_this_month,
            "total_pruchases": total_pruchases,
            "active_suppliers": active_suppliers
        },
        "monthly_sales": monthly_sales,
        "products": products_data
    }