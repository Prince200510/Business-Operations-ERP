from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.modules.customer import Customer
from app.modules.product import Product
from app.modules.sale_order import SaleOrder
from app.modules.sale_order_item import SaleOrderItem
from app.modules.Business import Business
from app.schemas.sale_order import SaleOrderCreate, SaleOrderResponse

router = APIRouter(prefix = "/api/v1/sales", tags = ["Sales"])

@router.post("/", response_model = SaleOrderResponse, status_code = 201)
def create_sale_order(sale_data: SaleOrderCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    if not sale_data.items:
        raise HTTPException(status_code = 400, detail = "Sale order must contain at least one product.")
    
    customer = (db.query(Customer).filter(Customer.user_id == user_id, Customer.name == sale_data.customer_name, Customer.address == sale_data.customer_address).first())
    
    if not customer:
        customer = Customer(user_id = user_id, name = sale_data.customer_name, address = sale_data.customer_address)
        db.add(customer)
        db.flush()
        
    order_total = Decimal("0")
    sale_items = []
    
    for item in sale_data.items:
        product = (db.query(Product).filter(Product.id == item.product_id, Product.user_id == user_id).with_for_update().first())
        
        if not product:
            raise HTTPException(status_code = 404, detail = f"Product with ID {item.product_id} not found.")
        if product.quantity < item.quantity:
            raise HTTPException(status_code = 400, detail = f"Insufficient stock for {product.name}, Available: {product.quantity}")
        item_total = product.sale_price * item.quantity
        order_total += item_total
        
        sale_items.append((product, item, item_total))
    
    discount = sale_data.discount
    
    if discount > order_total:
        raise HTTPException(status_code = 400, detail = "Discount cannot exceed the order total.")
    
    csgt = order_total * Decimal("0.08")
    sgst = order_total * Decimal("0.08")
    
    final_total = order_total - discount + csgt + sgst
    sale_order = SaleOrder(
        user_id = user_id, 
        customer_id = customer.id, 
        order_total = order_total, 
        discount = discount, 
        cgst = csgt, 
        sgst = sgst, 
        final_total = final_total, 
        payment_method = sale_data.payment_method
    )
    
    db.add(sale_order)
    db.flush()
    
    for product, item, item_total in sale_items:
        sale_item = SaleOrderItem(
            sale_order_id = sale_order.id, 
            product_id = product.id, 
            quantity = item.quantity, 
            sale_price = product.sale_price, 
            item_total = item_total
        )
        
        db.add(sale_item)
        product.quantity -= item.quantity
    
    db.commit()
    db.refresh(sale_order)
    
    return sale_order

@router.get("/", response_model = list[SaleOrderResponse])
def get_sales(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    sales = (db.query(SaleOrder).filter(SaleOrder.user_id == user_id).order_by(SaleOrder.id.desc()).all())
    return sales

@router.get("/{sale_id}", response_model = SaleOrderResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    sale = (db.query(SaleOrder).filter(SaleOrder.id == sale_id, SaleOrder.user_id == user_id).first())
    
    if not sale:
        raise HTTPException(status_code = 404, detail = "Sale order not found")
    
    return sale

@router.get("/{sale_id}/invoice")
def get_sale_invoice(sale_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    sale = (db.query(SaleOrder).filter(SaleOrder.id == sale_id, SaleOrder.user_id == user_id).first())
    if not sale:
        raise HTTPException(status_code = 404, detail = "Sale order not found")
        
    customer = (db.query(Customer).filter(Customer.id == sale.customer_id).first())
    business = (db.query(Business).filter(Business.user_id == user_id).first())
    
    items_data = []
    for item in sale.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        items_data.append({
            "product_name": product.name if product else "Unknown Product",
            "quantity": float(item.quantity),
            "unit_price": float(item.sale_price),
            "item_total": float(item.item_total)
        })
        
    return {
        "invoice_number": f"INV-{sale.id:06d}",
        "date": sale.created_at.isoformat(),
        "payment_method": sale.payment_method,
        "totals": {
            "subtotal": float(sale.order_total),
            "discount": float(sale.discount),
            "cgst": float(sale.cgst),
            "sgst": float(sale.sgst),
            "final_total": float(sale.final_total)
        },
        "customer": {
            "name": customer.name if customer else "Cash Customer",
            "address": customer.address if customer else ""
        },
        "business": {
            "name": business.name if business else "Your Company Name",
            "business_name": business.business_name if business else "Your Business",
            "address": business.address if business else "",
            "phone_no1": business.phone_no1 if business else "",
            "email_id": business.email_id if business else "",
            "website": business.website_link if business else ""
        },
        "items": items_data
    }