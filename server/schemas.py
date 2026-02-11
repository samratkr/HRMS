from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class Department(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class JobTitle(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    fullName: str
    email: EmailStr
    departmentId: int
    jobTitleId: int

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    employeeId: str
    createdAt: Optional[datetime] = None
    department: Optional[Department] = None
    jobTitle: Optional[JobTitle] = None 
    departmentId: Optional[int] = None
    jobTitleId: Optional[int] = None

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    employeeId: int
    date: datetime
    present: bool

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int

    class Config:
        from_attributes = True
