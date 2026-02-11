# HRMS (Human Resource Management System)

This is a **React + TypeScript** web application for managing employees, departments, and job titles. It includes features for adding, editing, and viewing employees, with a modern UI using Tailwind CSS and Radix UI components. The application uses **React Query** for data fetching and mutations.

---

## Features

- Add, edit, and view employees
- Assign employees to departments and job titles
- Form validation using **Zod** and **React Hook Form**
- Responsive design with **Tailwind CSS**
- Interactive UI components using **Radix UI**
- API integration with create and update employee endpoints
- Toast notifications for feedback
- Fully typed with **TypeScript**

---

## Project Setup

### Prerequisites

- Node.js >= 18.x
- Yarn or npm
- Git (optional, for cloning)
- Python >= 3.10
- Node.js >= 18.x
- Yarn or npm
- PostgreSQL (or any preferred database)
- Git

### Clone the repository

git clone <https://github.com/samratkr/HRMS.git>
cd <HRMS>

## Setup and Run

### Backend

- Navigate to the backend folder, create a `.env` file, install dependencies, initialize the database, and run:

cd server

# Create .env file with your environment variables

# Example .env:

# DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/hrms

- pip install -r requirements.txt
- uvicorn server.main:app --reload --port 5000

- The backend API will be available at http://localhost:5000
- Swagger docs at http://localhost:5000/docs.

# Frontend

cd .. or root dir

yarn install

# or

npm install

yarn run dev

# or

npm run dev
The frontend will be available at http://localhost:5173.
