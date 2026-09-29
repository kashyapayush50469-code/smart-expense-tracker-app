# Smart Expense & Budget Tracker

A full-stack expense tracking application with AI-flavored features — built to go beyond basic CRUD by including natural language expense entry and real-time budget alerts.

## 🚀 Features

- **Authentication** — Secure JWT-based login/register with password hashing (bcrypt)
- **Transaction Management** — Full CRUD for income/expense tracking
- **Category Management** — Default + custom user-defined categories
- **Budget Management** — Set monthly limits per category
- **Budget Alerts** — Real-time warnings when spending crosses 80%/100% of budget
- **NLP Expense Entry** — Add transactions using natural language (e.g. "spent 200 on chai")
- **Dashboard Summary** — Total income, expense, and savings at a glance

## 🛠️ Tech Stack

**Backend:** FastAPI, PostgreSQL, SQLAlchemy, JWT (python-jose), bcrypt (passlib)
**Frontend:** React (Vite), React Router, Axios

## 📸 Screenshots
(Add screenshots here after deployment)

## ⚙️ Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Create .env file with DATABASE_URL
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔮 Planned Features (Phase 2)
- OCR-based receipt scanning
- AI chatbot for spending queries
- Bank statement CSV import
- Google/GitHub OAuth login

## 👤 Author
Ayush Kumar jha. 