from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from server.database import get_db, engine, Base, SessionLocal
from server import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://hrms-drab-alpha.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_reference_data(db: Session):
    for name in ["Engineering", "HR", "Sales", "Marketing"]:
        if not db.query(models.Department).filter_by(name=name).first():
            db.add(models.Department(name=name))
    
    for name in ["Senior Developer", "HR Manager", "Sales Representative", "Marketing Specialist"]:
        if not db.query(models.JobTitle).filter_by(name=name).first():
            db.add(models.JobTitle(name=name))
    
    db.commit()

def seed_database(db: Session):
    if db.query(models.Employee).count() > 0:
        return

    print("Seeding employees...")

    engineering = db.query(models.Department).filter_by(name="Engineering").first()
    hr = db.query(models.Department).filter_by(name="HR").first()
    sales = db.query(models.Department).filter_by(name="Sales").first()

    senior_dev = db.query(models.JobTitle).filter_by(name="Senior Developer").first()
    hr_manager = db.query(models.JobTitle).filter_by(name="HR Manager").first()
    sales_rep = db.query(models.JobTitle).filter_by(name="Sales Representative").first()

    employees = [
        models.Employee(
            employee_id="EMP001",
            full_name="John Doe",
            email="john.doe@example.com",
            department=engineering,
            job_title=senior_dev
        ),
        models.Employee(
            employee_id="EMP002",
            full_name="Jane Smith",
            email="jane.smith@example.com",
            department=hr,
            job_title=hr_manager
        ),
        models.Employee(
            employee_id="EMP003",
            full_name="Mike Johnson",
            email="mike.j@example.com",
            department=sales,
            job_title=sales_rep
        )
    ]


    db.add_all(employees)
    db.commit()

    today = datetime.now()
    attendance_records = [
        models.Attendance(employee_id=emp.id, date=today, present=True)
        for emp in employees
    ]
    db.add_all(attendance_records)
    db.commit()

    print("Database seeded successfully!")

db = SessionLocal()
seed_reference_data(db)
seed_database(db)
db.close()


@app.get("/api/employees", response_model=List[schemas.Employee])
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).order_by(models.Employee.created_at.desc()).all()
    return [
        schemas.Employee(
            id=e.id,
            employeeId=e.employee_id,
            fullName=e.full_name,
            email=e.email,
            departmentId=e.department_id,
            jobTitleId=e.job_title_id,
            createdAt=e.created_at,
            department=schemas.Department.from_orm(e.department) if e.department else None,
            jobTitle=schemas.JobTitle.from_orm(e.job_title) if e.job_title else None,
        )
        for e in employees
    ]

@app.get("/api/employees/{id}", response_model=schemas.Employee)
def get_employee(id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return schemas.Employee(
        id=employee.id,
        employeeId=employee.employee_id,
        fullName=employee.full_name,
        email=employee.email,
        departmentId=employee.department_id,
        jobTitleId=employee.job_title_id,
        createdAt=employee.created_at,
        department=schemas.Department.from_orm(employee.department) if employee.department else None,
        jobTitle=schemas.JobTitle.from_orm(employee.job_title) if employee.job_title else None,
    )

@app.post("/api/employees", response_model=schemas.Employee, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    last_emp = db.query(models.Employee).order_by(models.Employee.id.desc()).first()
    next_id_number = (last_emp.id + 1) if last_emp else 1
    new_emp_id = f"EMP{next_id_number:03}"

    department = db.query(models.Department).filter_by(id=employee.departmentId).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    job_title = db.query(models.JobTitle).filter_by(id=employee.jobTitleId).first()
    if not job_title:
        raise HTTPException(status_code=404, detail="Job title not found")

    new_employee = models.Employee(
        employee_id=new_emp_id,
        full_name=employee.fullName,
        email=employee.email,
        department=department,
        job_title=job_title
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return schemas.Employee(
        id=new_employee.id,
        employeeId=new_employee.employee_id,
        fullName=new_employee.full_name,
        email=new_employee.email,
        departmentId=new_employee.department_id,
        jobTitleId=new_employee.job_title_id,
        createdAt=new_employee.created_at,
        department=schemas.Department.from_orm(new_employee.department) if new_employee.department else None,
        jobTitle=schemas.JobTitle.from_orm(new_employee.job_title) if new_employee.job_title else None,
    )

@app.put("/api/employees/{id}", response_model=schemas.Employee)
def update_employee(id: int, employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing.full_name = employee.fullName
    existing.email = employee.email

    department = db.query(models.Department).filter_by(id=employee.departmentId).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    job_title = db.query(models.JobTitle).filter_by(id=employee.jobTitleId).first()
    if not job_title:
        raise HTTPException(status_code=404, detail="Job title not found")

    existing.department = department
    existing.job_title = job_title

    db.commit()
    db.refresh(existing)

    return schemas.Employee(
        id=existing.id,
        employeeId=existing.employee_id,
        fullName=existing.full_name,
        email=existing.email,
        departmentId=existing.department_id,
        jobTitleId=existing.job_title_id,
        createdAt=existing.created_at,
        department=schemas.Department.from_orm(existing.department) if existing.department else None,
        jobTitle=schemas.JobTitle.from_orm(existing.job_title) if existing.job_title else None,
    )



@app.delete("/api/employees/{id}", status_code=204)
def delete_employee(id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(employee)
    db.commit()
    return None

@app.get("/api/attendance", response_model=List[schemas.Attendance])
def get_attendance(
    employeeId: Optional[int] = None, 
    date: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Attendance)
    
    if employeeId:
        query = query.filter(models.Attendance.employee_id == employeeId)
    
    if date:
        try:
            filter_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            start_of_day = filter_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = filter_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            query = query.filter(models.Attendance.date >= start_of_day, models.Attendance.date <= end_of_day)
        except ValueError:
            pass
            
    records = query.order_by(models.Attendance.date.desc()).all()
    
    return [
        schemas.Attendance(
            id=r.id,
            employeeId=r.employee_id,
            date=r.date,
            present=r.present
        ) for r in records
    ]

@app.post("/api/attendance", response_model=schemas.Attendance)
def mark_attendance(record: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    record_date = record.date
    start_of_day = record_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = record_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == record.employeeId,
        models.Attendance.date >= start_of_day,
        models.Attendance.date <= end_of_day
    ).first()
    
    if existing:
        existing.present = record.present
        existing.date = record.date
        db.commit()
        db.refresh(existing)
        return schemas.Attendance(
            id=existing.id,
            employeeId=existing.employee_id,
            date=existing.date,
            present=existing.present
        )
    else:
        new_record = models.Attendance(
            employee_id=record.employeeId,
            date=record.date,
            present=record.present
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return schemas.Attendance(
            id=new_record.id,
            employeeId=new_record.employee_id,
            date=new_record.date,
            present=new_record.present
        )

@app.get("/api/departments", response_model=List[schemas.Department])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()

@app.get("/api/job-titles", response_model=List[schemas.JobTitle])
def get_job_titles(db: Session = Depends(get_db)):
    return db.query(models.JobTitle).all()

if not os.path.exists("dist/public"):
    os.makedirs("dist/public", exist_ok=True)

if os.path.exists("dist/public/assets"):
    app.mount("/assets", StaticFiles(directory="dist/public/assets"), name="assets")

@app.get("/")
async def root():
    index_path = "dist/public/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not built. Please run npm run build."}

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = os.path.join("dist/public", full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = "dist/public/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not built. Please run npm run build."}

if __name__ == "__main__":
    uvicorn.run("server.main:app", host="0.0.0.0", port=5000, reload=True)
