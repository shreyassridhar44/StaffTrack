from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


import models, schemas
from database import get_db

# ----------------------------------------------------------
# JWT CONFIG
# ----------------------------------------------------------
SECRET_KEY = "YOUR_SECRET_KEY_CHANGE_THIS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✔ Correct JWT Authorization header
oauth2_scheme = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ----------------------------------------------------------
# Utility functions
# ----------------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# ----------------------------------------------------------
# REGISTER HR USER
# ----------------------------------------------------------
@router.post("/register", response_model=schemas.User)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):

    # Check existing user
    existing_user = (
        db.query(models.User)
        .filter(
            (models.User.username == user_in.username)
            | (models.User.email == user_in.email)
        )
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists",
        )

    # Find or create company
    company = db.query(models.Company).filter(
        models.Company.name == user_in.company_name
    ).first()

    if not company:
        company = models.Company(name=user_in.company_name)
        db.add(company)
        db.commit()
        db.refresh(company)

    # Create HR user
    hashed_pw = get_password_hash(user_in.password.strip()[:72])
    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw,
        company_id=company.id,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Return complete user data
    return schemas.User(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        company_id=new_user.company_id,
        company_name=company.name,
    )


# ----------------------------------------------------------
# LOGIN (returns JWT token)
# ----------------------------------------------------------
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        {"sub": user.username, "company_id": user.company_id}
    )

    return {"access_token": token, "token_type": "bearer"}


# ----------------------------------------------------------
# CURRENT USER (reads Bearer token correctly)
# ----------------------------------------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    token = credentials.credentials  # ✔ Extract actual token

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username = payload.get("sub")
        if username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Fetch user from database
    user = get_user_by_username(db, username=username)

    if not user:
        raise credentials_exception

    return user
