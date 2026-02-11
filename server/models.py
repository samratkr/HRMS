from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from server.database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    employees = relationship("Employee", back_populates="department")

class JobTitle(Base):
    __tablename__ = "job_titles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    employees = relationship("Employee", back_populates="job_title")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    job_title_id = Column(Integer, ForeignKey("job_titles.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="employees")
    job_title = relationship("JobTitle", back_populates="employees")
    
    attendance_records = relationship(
        "Attendance", back_populates="employee", cascade="all, delete-orphan"
    )

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    present = Column(Boolean, nullable=False)

    employee = relationship("Employee", back_populates="attendance_records")
