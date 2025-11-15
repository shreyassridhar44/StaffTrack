from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Department(Base):
    __tablename__ = "department"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    employees = relationship('Employee', back_populates='department')

class Employee(Base):
    __tablename__ = "employee"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    job_title = Column(String(100), nullable=False)
    salary = Column(Float, nullable=False)
    join_date = Column(String(20), nullable=False)
    department_id = Column(Integer, ForeignKey('department.id'), nullable=False)
    department = relationship('Department', back_populates='employees')