from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from datetime import datetime
from database import Base

# User Table

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Category Table 

class Category(Base): 
    __tablename__ = "categories" 

    id = Column(Integer, primary_key = True, index = True) 
    name = Column(String, nullable =False)
    type = Column(String, nullable = False) 
    user_id = Column(Integer, ForeignKey("users.id"),   nullable = True)                                

# Transaction Table

class Transaction(Base): 
         __tablename__  = "transactions"       

         id = Column(Integer, primary_key = True, index = True) 
         user_id = Column(Integer, ForeignKey("users.id"), nullable = False) 
         category_id = Column(Integer, ForeignKey("categories.id"), nullable  = False) 
         amount = Column(Numeric, nullable = False) 
         type = Column(String, nullable =  False)  
         date = Column(DateTime, default = datetime.utcnow)  
         description = Column(String, nullable = True)  

# Budget Table 

class Budget(Base): 
      __tablename__ = "budgets"  

      id = Column(Integer, primary_key = True, index = True) 
      user_id = Column(Integer, ForeignKey("users.id"), nullable = False) 
      category_id = Column(Integer, ForeignKey("categories.id"), nullable = False) 
      limit_amount = Column(Numeric, nullable = False) 
      month = Column(Integer, nullable = False) 
      year = Column(Integer, nullable = False) 