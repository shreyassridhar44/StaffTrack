from pydantic import BaseModel

class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    class Config:
        orm_mode = True

class EmployeeBase(BaseModel):
    name: str
    email: str
    job_title: str
    salary: float
    join_date: str
    department_id: int

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    department_name: str | None = None
    class Config:
        orm_mode = True