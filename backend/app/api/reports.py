from datetime import datetime
from decimal import Decimal
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
from app.modules.purchase import Purchase
from redis import Redis
from app.core.redis import get_redis
import json


router = APIRouter(prefix = "/api/v1/reports", tags = ["Reports"])

@router.post("/dashboard/refresh")
def invalidate_dashboard(user_id: int = Depends(get_current_user_id), redis_client: Redis = Depends(get_redis)):
    cache_key = f"dashboard_report_{user_id}"
    redis_client.delete(cache_key)
    return {"message": "Dashboard cache cleared successfully"}

@router.get("/dashboard")
def get_dashbaord_report(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id), redis_client: Redis = Depends(get_redis)):
    cache_key = f"dashboard_report_{user_id}"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data) 
    
    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year
    
    total_revenue = (db.query(func.coalesce(func.sum(SaleOrder.final_total), 0)).filter(SaleOrder.user_id == user_id).scalar())
    total_revenue = Decimal(str(total_revenue))
    total_sales_orders = (db.query(func.count(SaleOrder.id)).filter(SaleOrder.user_id == user_id).scalar() or 0)
    new_customers_this_month = (db.query(func.count(Customer.id)).filter(Customer.user_id == user_id, extract("month", Customer.created_at) == current_month, extract("year", Customer.created_at) == current_year).scalar()) or 0
    total_purchase_orders = (db.query(func.count(Purchase.id)).filter(Purchase.user_id == user_id).scalar()) or 0
    active_suppliers = (db.query(func.count(Supplier.id)).filter(Supplier.user_id == user_id).scalar()) or 0
    total_inventory_units = (db.query(func.coalesce(func.sum(Product.quantity), 0)).filter(Product.user_id == user_id).scalar()) or 0
    inventory_value = (db.query(func.coalesce(func.sum(Product.quantity * Product.purchase_price), 0)).filter(Product.user_id == user_id).scalar())
    inventory_value = Decimal(str(inventory_value))
    
    monthy_sales_revenue = []
    for month in range(1, 13):
        revenue = (db.query(func.coalesce(func.sum(SaleOrder.final_total), 0)).filter(SaleOrder.user_id == user_id, extract("month", SaleOrder.created_at) == month, extract("year", SaleOrder.created_at) == current_year).scalar())
        monthy_sales_revenue.append({"month": month, "revenue": revenue or 0})
    
    monthly_purchase_orders = []
    for month in range(1, 13):
        purchase_total = (db.query(func.coalesce(func.sum(Purchase.final_total), 0)).filter(Purchase.user_id == user_id, extract("month", Purchase.created_at) == month, extract("year", Purchase.created_at) == current_year).scalar())
        monthly_purchase_orders.append({"month": month, "revenue": float(purchase_total or 0)})

    top_products = (db.query(Product.id, Product.name, func.sum(SaleOrderItem.quantity).label("total_quantity"), func.sum(SaleOrderItem.item_total).label("total_revenue")).join(SaleOrderItem, SaleOrderItem.product_id == Product.id).join(SaleOrder, SaleOrder.id == SaleOrderItem.sale_order_id).filter(Product.user_id == user_id).group_by(Product.id, Product.name).order_by(func.sum(SaleOrderItem.quantity).desc()).limit(5).all())
    
    top_products_data = []
    for product in top_products:
        top_products_data.append({
            "product_id": product.id,
            "product_name": product.name,
            "quantity_sold": int(product.total_quantity or 0),
            "revenue": float(product.total_revenue or 0)
        })

    LOW_STOCK_LIMIT = 10
    low_stock_products = (db.query(Product).filter(Product.user_id == user_id, Product.quantity <= LOW_STOCK_LIMIT).order_by(Product.quantity.asc()).limit(10).all())
    
    low_stock_data = []
    for product in low_stock_products:
        low_stock_data.append({
            "id": product.id,
            "name": product.name,
            "quantity": product.quantity or 0,
            "status": ("Out of Stock" if product.quantity == 0 else "Low Stock")
        })
    recent_sales = (db.query(SaleOrder).filter(SaleOrder.user_id == user_id).order_by(SaleOrder.created_at.desc()).limit(10).all())
    
    recent_sales_data = []
    for sale in recent_sales:
        customer = (db.query(Customer).filter(Customer.id == sale.customer_id).first())
        recent_sales_data.append({
            "id": sale.id,
            "customer_name": customer.name if customer else "Unknown",
            "final_total": float(sale.final_total or 0),
            "payment_method": sale.payment_method,
            "date": sale.created_at
        })
    
    sales_this_month = (db.query(func.count(SaleOrder.id)).filter(SaleOrder.user_id == user_id, extract("month", SaleOrder.created_at) == current_month, extract("year", SaleOrder.created_at) == current_year).scalar()) or 0
    active_suppliers = (db.query(func.count(Supplier.id)).filter(Supplier.user_id == user_id).scalar()) or 0
    products = (db.query(Product).filter(Product.user_id == user_id).order_by(Product.id.desc()).all())
    
    monthly_sales = []
    for month in range(1, 13):
        count = (db.query(func.count(SaleOrder.id)).filter(SaleOrder.user_id == user_id, extract("month", SaleOrder.created_at) == month, extract("year", SaleOrder.created_at) == current_year).scalar()) or 0
        monthly_sales.append({"month": month, "count": count})

    products_data = []
    for product in products:
        products_data.append({"id": product.id, "name": product.name, "supplier_id": product.supplier_id, "sale_price": float(product.sale_price), "quantity": float(product.quantity)})
    
    
    response_data = {
        "summary": {
            "total_revenue": float(total_revenue),
            "total_sales_orders": total_sales_orders,
            "sales_this_month": sales_this_month,
            "new_customers_this_month": new_customers_this_month,
            "total_purchase_orders": total_purchase_orders,
            "active_suppliers": active_suppliers,
            "total_inventory_units": total_inventory_units,
            "inventory_value": float(inventory_value),
            "monthly_sales_revenue": monthy_sales_revenue,
            "monthly_purchase_orders": monthly_purchase_orders,
            "top_products": top_products_data,
            "low_stock_products": low_stock_data,
            "recent_sales": recent_sales_data,
        },
        "monthly_sales": monthly_sales,
        "products": products_data
    }
    
    redis_client.setex(cache_key, 300, json.dumps(response_data, default = str))
    
    return response_data
    