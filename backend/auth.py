from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta 
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer 
from sqlalchemy.orm import Session 
from database import get_db
import models 

## password hassing function. 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

## jwt tokens for authentication 

SECRET_KEY = "Your-secret-key-change-this-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 45500
def create_access_token(data: dict): 
    to_encode = data.copy() 
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire}) 
    encoded_jwt  = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt 

# we could fill out the authroized value section to help that token and find the real data. 

oauth2_scheme = HTTPBearer()
def get_current_user(credentials = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="could not validate credentials"
    )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user 



