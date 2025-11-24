from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models, schemas
from database import get_db


# ----------------------------------------------------------
# JWT CONFIG
# ----------------------------------------------------------
SECRET_KEY = "CHANGE_THIS_TO_A_REAL_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Auto error ON → ensures FastAPI doesn't try to parse body on GET requests
oauth2_scheme = HTTPBearer(auto_error=True)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ----------------------------------------------------------
# UTILITY FUNCTIONS
# ----------------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    if password is None:
        password = ""
    password = password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


# ----------------------------------------------------------
# CURRENT USER (FULLY FIXED)
# ----------------------------------------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    request: Request = None,
):
    """Reads Authorization header properly without causing 422 on GET routes."""

    token = credentials.credentials

    # Decode token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Fetch the user
    user = get_user_by_username(db, username)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ----------------------------------------------------------
# REGISTER
# ----------------------------------------------------------
@router.post("/register", response_model=schemas.User)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):

    existing = (
        db.query(models.User)
        .filter(
            (models.User.username == user_in.username) |
            (models.User.email == user_in.email)
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    company = db.query(models.Company).filter(
        models.Company.name == user_in.company_name
    ).first()

    if not company:
        company = models.Company(name=user_in.company_name)
        db.add(company)
        db.commit()
        db.refresh(company)

    hashed_pw = get_password_hash(user_in.password)

    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw,
        company_id=company.id,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return schemas.User(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        company_id=new_user.company_id,
        company_name=company.name,
    )


# ----------------------------------------------------------
# LOGIN
# ----------------------------------------------------------
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = create_access_token({"sub": user.username, "company_id": user.company_id})

    return {"access_token": token, "token_type": "bearer"}


# ----------------------------------------------------------
# GET CURRENT USER PROFILE
# ----------------------------------------------------------
@router.get("/me", response_model=schemas.User)
def get_profile(current_user: models.User = Depends(get_current_user)):

    return schemas.User(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        company_id=current_user.company_id,
        company_name=current_user.company.company_name if hasattr(current_user, "company") else ""
    )
