from fastapi import FastAPI, Depends, HTTPException 
from sqlalchemy.orm import Session
from database import engine, Base, get_db, SessionLocal
from auth import hash_password, get_current_user

# engine (connection) aur Base (jisse saare models inherit karte hain) dono import kiye
import models
# ye import krega jo hamne table banaya hai modles.py mai. 
import schemas
from auth import verify_password, create_access_token 
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func 
from fastapi.middleware.cors import CORSMiddleware 
from datetime import datetime
from nlp_parser import parse_expense_text

Base.metadata.create_all(bind=engine) 
# ye actual command hai ye bolti hai database ko databse mai vo charo table bana do. 
app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smart-expense-tracker-app-1.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 


## user ne register kiya 

@app.post("/register", response_model = schemas.UserResponse)
def register_user(user:schemas.UserCreate, db: Session = Depends(get_db)): 
# check karta hai ki email pahele se exist karta hai ya nahi. 
    existing_user = db.query(models.User).filter(models.User.email == user.email).first() 
    if existing_user: 
        raise HTTPException(status_code = 400, detail="Email already registered") 
    hashed_pw = hash_password(user.password)
    new_user = models.User(name=user.name, email=user.email, password=hashed_pw) 
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# user login

@app.post("/login")
def login_user(credentials:schemas.LoginRequest, db: Session = Depends(get_db)): 
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password): 
        raise HTTPException(status_code = 401, detail="Invalid email or password")
    access_token = create_access_token(data = {"user_id" : user.id})
    return {"access_token": access_token, "token_type":"bearer"}


# create category 

@app.post("/categories", response_model = schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)): 
    new_category = models.Category(
        name=category.name,
        type=category.type, 
        user_id=current_user.id 
        )  
    db.add(new_category)
    db.commit() 
    db.refresh(new_category)
    return new_category

# and then find category. 

@app.get("/categories", response_model=list[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    categories = db.query(models.Category).filter(
        or_(models.Category.user_id == None, models.Category.user_id == current_user.id)
    ).all()
    return categories

# create api transaction add and get

@app.post("/transactions", response_model = schemas.TransactionResponse)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db), current_user: models.User =Depends(get_current_user)): 
    category = db.query(models.Category).filter(models.Category.id == transaction.category_id).first()
    if not category: 
        raise HTTPException(status_code = 404, detail="Category not found")

    new_transaction = models.Transaction(
        user_id = current_user.id, 
        category_id = transaction.category_id, 
        amount = transaction.amount, 
        type = transaction.type, 
        description = transaction.description
        )
    db.add(new_transaction)
    db.commit() 
    db.refresh(new_transaction)
    return new_transaction

# then we consider it get

@app.get("/transactions", response_model = list[schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    return transactions 

# similar as transaction but code data table is differnt 

@app.post("/budgets", response_model = schemas.BudgetResponse)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    category = db.query(models.Category).filter(models.Category.id == budget.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    new_buget = models.Budget(
        user_id = current_user.id, 
        category_id = budget.category_id, 
        limit_amount = budget.limit_amount, 
        month = budget.month, 
        year = budget.year 
        )
    db.add(new_buget)
    db.commit()
    db.refresh(new_buget)
    return new_buget 


# get the budgest. 

@app.get("/budgets", response_model = list[schemas.BudgetResponse])
def get_budgets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    budgets = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all() 
    return budgets

## ye security ke liye koi aur user kisi aur ka transaction change na kar sake.
@app.get("/transactions/{transaction_id}", response_model = schemas.TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id, models.Transaction.user_id == current_user.id).first()
    if not transaction: 
        raise HTTPException(status_code = 404, detail="Transaction not found")
    return transaction

# ham yaha update kar rahe agar koi user galti se galat filed  fill kar diya aur uske bad  agar mujhe phir se change krana sahi data 
# likhna hai to ham udate ka features es code ke through de rahe hai. 

@app.put("/transactions/{transaction_id}", response_model = schemas.TransactionResponse) 
def update_transaction(transaction_id: int, update_data: schemas.TransactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    transaction = db.query(models.Transaction).filter(
         models.Transaction.id == transaction_id, 
         models.Transaction.user_id == current_user.id 
        ).first()
    if  not transaction: 
        raise HTTPException(status_code = 404, detail = "Transaction not found")
    transaction.category_id = update_data.category_id
    transaction.amount = update_data.amount 
    transaction.type = update_data.type 
    transaction.description = update_data.description

    db.commit()
    db.refresh(transaction)
    return transaction

##ye transaction delte ka code hai jo alwasy ke liye transaction delte kar deta hai.               
@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,                 
        models.Transaction.user_id == current_user.id 
        ).first()
    if not transaction: 
        raise HTTPException(status_code = 404, detail="Transaction not found")
    db.delete(transaction)
    db.commit() 
    return {"messsage": "Transaction deleted successfully!"} 

## ye category ko update kar sakte hai isme. 

@app.put("/categories/{category_id}", response_model = schemas.CategoryResponse)
def update_category(category_id: int, updated_data: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
        ).first()
    if not category: 
        raise HTTPException(status_code = 404, detail="Category not found") 
    
    category.name = updated_data.name 
    category.type  = updated_data.type 

    db.commit()
    db.refresh(category) 
    return category 


## delete category section code 
@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id  
        ).first()
    if not category: 
        raise HTTPException(status_code = 404, detail="Category not found") 
    try:
        db.delete(category)
        db.commit()
    except IntegrityError:   # here try and except islye maine diya hai becuase it can be possible that koi user categories delete karna chata ho but transaction se link hone ke karan 
        db.rollback()        # use pahle transaction ko delete karna prega us link se tab categories delete hoga. otherwise not. because they still exist in the transaction database.              
        raise HTTPException(status_code = 400, detail="Can not delete this category bec ause it has existing transactions. Please delete or reassign those transactions first.")
    return {"message": "Category deleted Successfully!"}


## budget update section code 
@app.put("/budgets/{budget_id}", response_model = schemas.BudgetResponse)
def update_budget(budget_id: int, updated_data: schemas.BudgetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id, 
        models.Budget.user_id == current_user.id
        ).first()
    if not budget: 
        raise HTTPException(status_code = 404, detail="Budget not found") 
    budget.category_id = updated_data.category_id 
    budget.limit_amount = updated_data.limit_amount
    budget.month = updated_data.month 
    budget.year = updated_data.year 

    db.commit()
    db.refresh(budget)
    return budget 


# delete section code 

@app.delete("/budgets/{budget_id}") 
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)): 
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id, 
        models.Budget.user_id == current_user.id 
        ).first()
    if not budget: 
        raise HTTPException(status_code = 404, detail="Budget not found")
    db.delete(budget)
    db.commit() 
    return {"message": "Budget deleted Successfully!"}

# summary dashborad. 

@app.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_income = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id, 
        models.Transaction.type == "income"
        ).scalar() or 0 
    total_expense = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id, 
        models.Transaction.type == "expense"
        ).scalar() or 0 
    total_savings =  total_income - total_expense 

    return{
        "total_income": total_income,
        "total_expense": total_expense, 
        "total_savings": total_savings
        }

# ye buget-status hai jo agar budget 80% se jayda spend huaa to  ek alert sent karega user ko. 

@app.get("/budget-status")
def get_budget_status(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == current_month,
        models.Budget.year == current_year
    ).all()
    
    result = []
    for budget in budgets:
        spent = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.category_id == budget.category_id,
            models.Transaction.type == "expense"
        ).scalar() or 0
        
        percentage = (spent / budget.limit_amount) * 100 if budget.limit_amount > 0 else 0
        
        if percentage >= 100:
            status = "exceeded"
        elif percentage >= 80:
            status = "warning"
        else:
            status = "safe"
        
        category = db.query(models.Category).filter(models.Category.id == budget.category_id).first()
        
        result.append({
            "budget_id": budget.id,
            "category_name": category.name if category else "Unknown",
            "limit_amount": budget.limit_amount,
            "spent": spent,
            "percentage": round(percentage, 2),
            "status": status,
            "month": budget.month,
            "year": budget.year
        })
    
    return result

# ye user ke specific other category ke hisab se add karega. 

@app.post("/parse-expense")
def parse_and_create_expense(text: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    parsed = parse_expense_text(text)
    
    if parsed["amount"] is None:
        raise HTTPException(status_code=400, detail="Could not detect amount in the text")
    
    if parsed["category"] is None:
        raise HTTPException(status_code=400, detail="Could not detect category. Please add manually.")
    
    category = db.query(models.Category).filter(models.Category.name == parsed["category"]).first()
    
    if not category:
        raise HTTPException(status_code=404, detail=f"Category '{parsed['category']}' not found in database")
    
    new_transaction = models.Transaction(
        user_id=current_user.id,
        category_id=category.id,
        amount=parsed["amount"],
        type="expense",
        description=text
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    return {
        "message": "Transaction created successfully from text!",
        "parsed_data": parsed,
        "transaction": new_transaction
    } 

# ye manually jo sab kush extra add karege jo user add karna chata hai. 

def seed_default_categories():
    db = SessionLocal()
    default_categories = [
        ("Food", "expense"),
        ("Travel", "expense"),
        ("Rent", "expense"),
        ("Shopping", "expense"),
        ("Entertainment", "expense"),
    ]
    
    for name, type_ in default_categories:
        existing = db.query(models.Category).filter(
            models.Category.name == name,
            models.Category.user_id == None
        ).first()
        
        if not existing:
            new_category = models.Category(name=name, type=type_, user_id=None)
            db.add(new_category)
    
    db.commit()
    db.close()

seed_default_categories()

# with the help of token checks we find the data of users. 

@app.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


## get message our server  it's wokring or not. 

@app.get("/")
def read_root(): 
    return {"message" : "Hello, Smart Expense Tracker app !"}

 