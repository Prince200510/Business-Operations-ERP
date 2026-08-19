# Nexora - Business Operations ERP

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-Vite-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis)

**Nexora Business Operations ERP** is a modern, high-performance Enterprise Resource Planning (ERP) and Point of Sale (POS) system designed specifically for small-to-medium businesses. It streamlines daily operations by integrating real-time inventory management, sales tracking, dynamic invoicing, and powerful business analytics into one seamless platform.

🔗 **Repository:** [https://github.com/Prince200510/Business-Operations-ERP](https://github.com/Prince200510/Business-Operations-ERP)

---

## 🌟 Key Features

- **Real-Time Dashboard:** A blazing-fast, Redis-cached analytics dashboard displaying revenue, profit, and top-selling products.
- **Inventory Management:** Complete CRUD operations for products, automated stock deduction upon sales, and low-stock alerts.
- **Point of Sale (POS):** A smooth checkout flow with dynamic tax calculations (CGST/SGST) and discount applications.
- **Dynamic Invoicing:** Generate professional, print-ready PDF invoices for customers with a single click.
- **Supplier & Purchase Tracking:** Manage procurement and restock inventory efficiently from registered suppliers.
- **Multi-Tenant Architecture:** Secure user authentication allowing individual business owners to manage their isolated workspaces.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React.js (migrated to **Vite** for blazing-fast HMR and startup)
- **Styling:** Tailwind CSS
- **Data Visualization:** Chart.js & React-ChartJS-2
- **Routing:** React Router v6

### Backend
- **Framework:** FastAPI (Python)
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL
- **Caching & Rate Limiting:** Redis
- **Authentication:** JWT (JSON Web Tokens) with Pydantic configuration validation

### Infrastructure & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render (using Automated Blueprints)
- **Database Hosting:** Render Managed PostgreSQL & Render Managed KeyValue (Redis)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL (Running locally)
- Redis (Running locally)

### 1. Backend Setup
```bash
cd backend
# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (Runs on port 8000)
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend

# Install Vite dependencies
npm install

# Start the Vite development server (Runs on port 3000)
npm run dev
```

---

## ☁️ Deployment

This project includes configuration for automated cloud deployments:
- **Frontend:** Pushes to the `main` branch trigger automatic Vite builds on **Vercel**.
- **Backend:** Pushes to the `main` branch are detected by **Render** via the included `render.yaml` Blueprint, automatically provisioning the PostgreSQL database, Redis cache, and Python web service.

---

## 📞 Contact & Author

**Developed by:** Prince Maurya  
- **Email:** [princemaurya8879@gmail.com](mailto:princemaurya8879@gmail.com)  
- **Phone:** +91 99877 42369  
- **GitHub:** [@Prince200510](https://github.com/Prince200510)  

*If you have any questions, feature requests, or would like to contribute, feel free to reach out or open an issue in the repository!*
