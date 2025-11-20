from pydantic import BaseModel
from datetime import date
from typing import Optional


# -----------------------------
# USER SCHEMAS
# -----------------------------

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    company_name: str


class User(BaseModel):
    id: int
    username: str
    email: str
    company_id: int
    company_name: str   # returned from joined company table

    class Config:
        from_attributes = True


# -----------------------------
# TOKEN
# -----------------------------
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# -----------------------------
# DEPARTMENT SCHEMAS
# -----------------------------
class DepartmentCreate(BaseModel):
    name: str


class Department(BaseModel):
    id: int
    name: str
    company_id: int

    class Config:
        from_attributes = True


# -----------------------------
# EMPLOYEE SCHEMAS
# -----------------------------
class EmployeeCreate(BaseModel):
    name: str
    email: str
    job_title: str
    salary: int
    join_date: date
    department_id: int


class Employee(BaseModel):
    id: int
    name: str
    email: str
    job_title: str
    salary: int
    join_date: date
    department_id: int
    company_id: int
    department_name: Optional[str] = None

    class Config:
        from_attributes = True
