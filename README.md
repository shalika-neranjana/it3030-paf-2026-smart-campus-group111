# Smart Campus Operations Hub - IT3030 PAF Assignment 2026

This project is a full-stack Smart Campus Management System built with Spring Boot (REST API) and React (Vite).

## Features

- Facility and asset catalog (rooms, labs, equipment)
- Resource booking with conflict handling and approval flow
- Maintenance and incident ticketing with image uploads
- Real-time notification support
- Secure authentication and role-based authorization

## Group Members

- IT23547360 - Neranjana K.H.P.S
- IT23555976 - Senevirathne S.W.J.N
- IT23569140 - Samarakoon S.M.B.P
- IT23554290 - Rathnayaka M.R.M.K.D

## Tech Stack

- Backend: Spring Boot 4, Maven Wrapper
- Frontend: React 19 + Vite
- Database: MongoDB
- Version Control: GitHub

## Prerequisites

Install these before running the project:

1. Java Development Kit (JDK) 25
2. Node.js (latest LTS recommended, e.g., 20+)
3. npm (comes with Node.js)
4. Git
5. MongoDB access (local MongoDB or MongoDB Atlas connection string)

### Verify Installation

Run these commands in a terminal:

```powershell
java -version
node -v
npm -v
git --version
```

## Project Structure

- backend: Spring Boot REST API
- frontend: React + Vite web app

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd it3030-paf-2026-smart-campus-group111
```

### 2. Backend Setup (Spring Boot)

1. Open the backend config file and set values for your environment:
	 - File: backend/src/main/resources/application.properties
	 - Update at least:
		 - spring.mongodb.uri
		 - app.jwt.secret
		 - app.cors.allowed-origins (keep http://localhost:5173 for local frontend)

2. From the project root, move to backend:

```bash
cd backend
```

3. Run the backend with Maven Wrapper:

Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

Backend runs by default on:

- http://localhost:8080

### 3. Frontend Setup (React + Vite)

Open a new terminal at project root and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs by default on:

- http://localhost:5173

## Running the Full App Locally

1. Start backend first (port 8080)
2. Start frontend second (port 5173)
3. Open http://localhost:5173 in your browser

## Optional Useful Commands

Backend tests:

```bash
cd backend
./mvnw test
```

Windows PowerShell backend tests:

```powershell
cd backend
.\mvnw.cmd test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Notes

- This project is developed as part of the Programming Applications and Frameworks (IT3030) module at SLIIT.
- Team members contribute via separate branches and module-specific REST endpoints.
