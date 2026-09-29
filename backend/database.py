from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv() # .env file ko load karta hai

DATABASE_URL = os.getenv("DATABASE_URL") #.env se wo connection string uthata hai

engine = create_engine(DATABASE_URL) # actual connection banata hai PostgreSQL se

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #ye ek "factory" hai jo database sessions banayegi (queries chalane ke liye)

Base = declarative_base() #ye ek base class hai jisse hum saare models (User, Transaction, etc.) inherit karenge

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

'''SessionLocal() ye function database kholti hai use api ko dete hai(yield db) and 
aur jab kam khatam ho jata hai tab session band kar deta hai.'''