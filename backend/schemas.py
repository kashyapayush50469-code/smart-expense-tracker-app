from pydantic import BaseModel, EmailStr
from datetime import datetime 
from typing import Optional


# login request. 
class LoginRequest(BaseModel):
     email: EmailStr
     password: str 

# user schemas.

# Jab user register karega, ye data expect karenge
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# Jab response bhejenge, ye data denge (password nahi)
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

# category schemas. 

class CategoryCreate(BaseModel):
    name: str 
    type: str 
    user_id: Optional[int] = None    

class CategoryResponse(BaseModel): 
    id: int 
    name : str 
    type: str 
    user_id: Optional[int] = None  

    class Config: 
        from_attributes = True                    

# Transactions schemas. 
class TransactionCreate(BaseModel):
      user_id: Optional[int] = None 
      category_id: int 
      amount: float 
      type: str 
      description: Optional[str] = None

class TransactionResponse(BaseModel):
      id: int 
      user_id: int 
      category_id: int 
      amount: float 
      type: str 
      date: datetime
      description: Optional[str] = None 

      class Config: 
           from_attributes = True 

# Buget schemas. 
class BudgetCreate(BaseModel): 
      user_id: Optional[int] = None 
      category_id: int 
      limit_amount: float 
      month: int 
      year: int 
class BudgetResponse(BaseModel):  
      id: int 
      user_id: int 
      category_id: int 
      limit_amount: float 
      month: int 
      year: int                            

      class Config: 
           from_attributes  = True 


