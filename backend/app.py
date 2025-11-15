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

# Project imports
import models, schemas
from database import SessionLocal, engine, get_db

matplotlib.use("Agg")

# ------------------------------------------------------------------
# APP SETUP
# ------------------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# ------------------------------------------------------------------
# DEPARTMENT ROUTES
# ------------------------------------------------------------------
@app.post("/api/departments", response_model=schemas.Department, status_code=201)
def add_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    try:
        new_department = models.Department(name=department.name)
        db.add(new_department)
        db.commit()
        db.refresh(new_department)
        return new_department
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/departments", response_model=list[schemas.Department])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()

# ------------------------------------------------------------------
# EMPLOYEE ROUTES (FIXED FOR FRONTEND)
# ------------------------------------------------------------------
@app.post("/api/employees", response_model=schemas.Employee, status_code=201)
def add_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    try:
        new_employee = models.Employee(**employee.dict())
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)
        return new_employee
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/employees", response_model=list[schemas.Employee])
def get_employees(db: Session = Depends(get_db)):
    """
    Returns all employees joined with department name.
    Output matches the frontend structure: plain list of objects.
    """
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
        )

        results = db.execute(query).mappings().all()  # <-- FIX: ensures dict-like rows

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
        raise HTTPException(status_code=500, detail=f"Error fetching employees: {str(e)}")


@app.get("/api/employees/{id}", response_model=schemas.Employee)
def get_employee(id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Get department name for frontend consistency
    department = db.query(models.Department).filter(models.Department.id == employee.department_id).first()
    emp_dict = employee.__dict__.copy()
    emp_dict["department_name"] = department.name if department else None
    return emp_dict


@app.put("/api/employees/{id}", response_model=schemas.Employee)
def update_employee(id: int, employee_update: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    for key, value in employee_update.dict().items():
        setattr(employee, key, value)

    try:
        db.commit()
        db.refresh(employee)

        dept = db.query(models.Department).filter(models.Department.id == employee.department_id).first()
        emp_dict = employee.__dict__.copy()
        emp_dict["department_name"] = dept.name if dept else None
        return emp_dict
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/employees/{id}")
def delete_employee(id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()
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
def get_stats_summary(db: Session = Depends(get_db)):
    try:
        query = (
            select(
                models.Employee.salary,
                models.Department.name.label("department_name"),
            )
            .join(models.Department, models.Employee.department_id == models.Department.id)
        )
        df = pd.read_sql(query, con=db.connection())

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
            "total_employees": int(len(df)),
            "average_salary": float(np.mean(df["salary"])),
            "median_salary": float(np.median(df["salary"])),
            "min_salary": float(np.min(df["salary"])),
            "max_salary": float(np.max(df["salary"])),
            "employees_by_dept": df["department_name"].value_counts().to_dict(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------
# CHART ROUTES
# ------------------------------------------------------------------
def create_chart_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close(fig)
    return f"data:image/png;base64,{img_base64}"

def get_dataframe(db: Session):
    query = (
        select(
            models.Employee.salary,
            models.Department.name.label("department_name"),
        )
        .join(models.Department, models.Employee.department_id == models.Department.id)
    )
    df = pd.read_sql(query, con=db.connection())
    if df.empty:
        raise HTTPException(status_code=404, detail="No employee data to generate charts.")
    return df

@app.get("/api/charts/salary_distribution")
def get_salary_distribution(db: Session = Depends(get_db)):
    try:
        df = get_dataframe(db)
        fig, ax = plt.subplots()
        ax.hist(df["salary"], bins=10, edgecolor="black")
        ax.set_title("Salary Distribution")
        ax.set_xlabel("Salary")
        ax.set_ylabel("Number of Employees")
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        return {"image_base64": create_chart_base64(fig)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/charts/department_pie")
def get_department_pie(db: Session = Depends(get_db)):
    try:
        df = get_dataframe(db)
        counts = df["department_name"].value_counts()
        fig, ax = plt.subplots()
        ax.pie(counts, labels=counts.index, autopct="%1.1f%%", startangle=90)
        ax.set_title("Employee Distribution by Department")
        ax.axis("equal")
        return {"image_base64": create_chart_base64(fig)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------
# EXPORT ROUTE
# ------------------------------------------------------------------
@app.get("/api/employees/export")
def export_employees_csv(db: Session = Depends(get_db)):
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
        )
        df = pd.read_sql(query, con=db.connection())
        if df.empty:
            raise HTTPException(status_code=404, detail="No employee data to export.")

        csv_data = df.to_csv(index=False)
        buffer = io.StringIO(csv_data)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=employees.csv"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
