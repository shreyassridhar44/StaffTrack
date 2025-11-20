from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select
from starlette.responses import StreamingResponse

import pandas as pd
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
import io
import base64
import logging

# Project imports
import models, schemas
from database import SessionLocal, engine, get_db

# Auth imports
from auth import router as auth_router, get_current_user

matplotlib.use("Agg")

# ------------------------------------------------------------------
# APP SETUP
# ------------------------------------------------------------------
app = FastAPI()
logging.basicConfig(level=logging.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # TEMP FIX
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

# ------------------------------------------------------------------
# DATABASE CREATION ROUTE
# ------------------------------------------------------------------
@app.get("/api/create_db")
def create_db():
    try:
        models.Base.metadata.create_all(bind=engine)
        return {"message": "Database tables created successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/create_tables")
def create_tables():
    try:
        models.Base.metadata.create_all(bind=engine)
        return {"message": "tables created successfully"}
    except Exception as e:
        return {"error": str(e)}


# ------------------------------------------------------------------
# DEPARTMENT ROUTES (SCOPED BY COMPANY)
# ------------------------------------------------------------------
@app.post("/api/departments", response_model=schemas.Department, status_code=201)
def add_department(
    department: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        new_department = models.Department(
            name=department.name,
            company_id=current_user.company_id,
        )
        db.add(new_department)
        db.commit()
        db.refresh(new_department)
        return new_department
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/departments", response_model=list[schemas.Department])
def get_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Department)
        .filter(models.Department.company_id == current_user.company_id)
        .all()
    )


# ------------------------------------------------------------------
# EMPLOYEE ROUTES (SCOPED BY COMPANY)
# ------------------------------------------------------------------
@app.post("/api/employees", response_model=schemas.Employee, status_code=201)
def add_employee(
    employee: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    dept = (
        db.query(models.Department)
        .filter(
            models.Department.id == employee.department_id,
            models.Department.company_id == current_user.company_id,
        )
        .first()
    )

    if not dept:
        raise HTTPException(
            status_code=400, detail="Invalid department for this company"
        )

    try:
        new_employee = models.Employee(
            name=employee.name,
            email=employee.email,
            job_title=employee.job_title,
            salary=employee.salary,
            join_date=employee.join_date,
            department_id=dept.id,
            company_id=current_user.company_id,
        )
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)
        return new_employee

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/employees", response_model=list[schemas.Employee])
def get_employees(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        query = (
            select(
                models.Employee.id,
                models.Employee.name,
                models.Employee.email,
                models.Employee.job_title,
                models.Employee.salary,
                models.Employee.join_date,
                models.Employee.department_id,
                models.Department.name.label("department_name"),
            )
            .join(models.Department, models.Employee.department_id == models.Department.id)
            .where(models.Employee.company_id == current_user.company_id)
        )

        results = db.execute(query).mappings().all()

        employees = [
            {
                "id": row["id"],
                "name": row["name"],
                "email": row["email"],
                "job_title": row["job_title"],
                "salary": row["salary"],
                "join_date": row["join_date"],
                "department_id": row["department_id"],
                "department_name": row["department_name"],
            }
            for row in results
        ]

        return employees

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/employees/{id}", response_model=schemas.Employee)
def get_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    employee = (
        db.query(models.Employee)
        .filter(
            models.Employee.id == id,
            models.Employee.company_id == current_user.company_id,
        )
        .first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    dept = (
        db.query(models.Department)
        .filter(models.Department.id == employee.department_id)
        .first()
    )

    data = employee.__dict__.copy()
    data["department_name"] = dept.name if dept else None
    return data


@app.put("/api/employees/{id}", response_model=schemas.Employee)
def update_employee(
    id: int,
    employee_update: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    employee = (
        db.query(models.Employee)
        .filter(
            models.Employee.id == id,
            models.Employee.company_id == current_user.company_id,
        )
        .first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    dept = (
        db.query(models.Department)
        .filter(
            models.Department.id == employee_update.department_id,
            models.Department.company_id == current_user.company_id,
        )
        .first()
    )

    if not dept:
        raise HTTPException(status_code=400, detail="Invalid department for this company")

    for key, value in employee_update.dict().items():
        setattr(employee, key, value)

    try:
        db.commit()
        db.refresh(employee)

        dept = db.query(models.Department).filter(
            models.Department.id == employee.department_id
        ).first()

        data = employee.__dict__.copy()
        data["department_name"] = dept.name if dept else None
        return data

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/employees/{id}")
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    employee = (
        db.query(models.Employee)
        .filter(
            models.Employee.id == id,
            models.Employee.company_id == current_user.company_id,
        )
        .first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    try:
        db.delete(employee)
        db.commit()
        return {"message": "Employee deleted"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# ANALYTICS ROUTES
# ------------------------------------------------------------------
@app.get("/api/stats/summary")
def get_stats_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    try:
        query = (
            select(
                models.Employee.salary,
                models.Department.name.label("department_name"),
            )
            .join(models.Department, models.Employee.department_id == models.Department.id)
            .where(models.Employee.company_id == current_user.company_id)
        )

        with db.bind.connect() as conn:
            df = pd.read_sql(query, conn)

        if df.empty:
            return {
                "total_employees": 0,
                "average_salary": 0,
                "median_salary": 0,
                "min_salary": 0,
                "max_salary": 0,
                "employees_by_dept": {},
            }

        return {
            "total_employees": len(df),
            "average_salary": float(df["salary"].mean()),
            "median_salary": float(df["salary"].median()),
            "min_salary": int(df["salary"].min()),
            "max_salary": int(df["salary"].max()),
            "employees_by_dept": df["department_name"].value_counts().to_dict(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# CHART ROUTES
# ------------------------------------------------------------------
@app.get("/api/charts/salary_distribution")
def get_salary_chart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    try:
        employees = (
            db.query(models.Employee)
            .filter(models.Employee.company_id == current_user.company_id)
            .all()
        )

        if not employees:
            raise HTTPException(status_code=400, detail="No employee data available")

        salaries = [e.salary for e in employees]

        plt.figure(figsize=(6, 4))
        plt.hist(salaries, edgecolor="black")
        plt.title("Salary Distribution")
        plt.xlabel("Salary")
        plt.ylabel("Employees")

        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        image = base64.b64encode(buf.read()).decode("utf-8")
        plt.close()

        return {"image_base64": f"data:image/png;base64,{image}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/department_pie")
def get_department_chart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    try:
        departments = (
            db.query(models.Department)
            .filter(models.Department.company_id == current_user.company_id)
            .all()
        )

        employees = (
            db.query(models.Employee)
            .filter(models.Employee.company_id == current_user.company_id)
            .all()
        )

        if not departments or not employees:
            raise HTTPException(
                status_code=400,
                detail="No department or employee data available",
            )

        counts = {
            dept.name: db.query(models.Employee)
            .filter(
                models.Employee.department_id == dept.id,
                models.Employee.company_id == current_user.company_id,
            )
            .count()
            for dept in departments
        }

        labels = list(counts.keys())
        values = list(counts.values())

        plt.figure(figsize=(6, 6))
        plt.pie(values, labels=labels, autopct="%1.1f%%")
        plt.title("Employees by Department")

        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        image = base64.b64encode(buf.read()).decode("utf-8")
        plt.close()

        return {"image_base64": f"data:image/png;base64,{image}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# EXPORT ROUTE
# ------------------------------------------------------------------
@app.get("/api/employees/export")
def export_employees_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    try:
        query = (
            select(
                models.Employee.id,
                models.Employee.name,
                models.Employee.email,
                models.Employee.job_title,
                models.Employee.salary,
                models.Employee.join_date,
                models.Department.name.label("department_name"),
            )
            .join(models.Department, models.Employee.department_id == models.Department.id)
            .where(models.Employee.company_id == current_user.company_id)
        )

        df = pd.read_sql(query, con=db.connection())

        if df.empty:
            raise HTTPException(status_code=404, detail="No employee data to export.")

        csv_data = df.to_csv(index=False)
        buf = io.StringIO(csv_data)

        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=employees.csv"},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
