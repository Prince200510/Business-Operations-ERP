import random
from app.core.database import Sessionlocal
from app.modules.user import User
from app.modules.product import Product
from app.modules.supplier import Supplier
from app.core.security import hash_password

def seed_data():
    db = Sessionlocal()
    try:
        user = db.query(User).filter(User.email == "prince@gmail.com").first()
        if not user:
            print("email create kar rahe hai")
            user = User(name="Prince", username="prince", email="prince@gmail.com", mobile="9987742369", password_hash=hash_password("Prince@10"))
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print("User prince@gmail.com already exists.")

        supplier = db.query(Supplier).filter(Supplier.email == "supplier@example.com").first()
        if not supplier:
            print("Creating supplier")
            supplier = Supplier(
                user_id = user.id,
                name="Prince",
                email="prince@gmail.com",
                phone_number="9987742369",
                address="Mumbai, India"
            )
            db.add(supplier)
            db.commit()
            db.refresh(supplier)
        else:
            print("Dummy supplier already exists.")

        product_names = [
            "Amul Butter 500g",
            "Tata Salt 1kg",
            "Maggi Masala Noodles",
            "Parle-G Biscuits",
            "MDH Garam Masala 100g",
            "Aashirvaad Atta 5kg",
            "Lipton Green Tea 100g",
            "Haldiram Bhujia 400g",
            "Patanjali Honey 500g",
            "Everest Turmeric Powder 100g"
        ]

        print("Adding random products...")
        for name in product_names:
            existing_product = db.query(Product).filter(Product.name == name).first()
            if not existing_product:
                purchase_price = round(random.uniform(10.0, 500.0), 2)
                sale_price = round(purchase_price * random.uniform(1.1, 1.5), 2)
                quantity = random.randint(1, 20)
                
                product = Product(
                    user_id=user.id,
                    supplier_id=supplier.id,
                    name=name,
                    purchase_price=purchase_price,
                    sale_price=sale_price,
                    quantity=quantity
                )
                db.add(product)
        
        db.commit()
        print("Seed data inserted successfully!")

    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
