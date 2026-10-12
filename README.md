# Medical Wizard — Clinical Appointment Management System

[![Go](https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat&logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://docker.com)

A modern, high-performance, and resilient full-stack web application developed for the **AI Engineering Intern Practical Assessment**. The system enables clinical staff to schedule, track, filter, and manage medical appointments seamlessly with full relational integrity.

---

## Table of Contents
1. [Executive Summary & Features](#executive-summary--features)
2. [Technology Stack & Rationale](#technology-stack--rationale)
3. [Relational Database Architecture](#relational-database-architecture)
4. [Backend Architecture (Go)](#backend-architecture-go)
5. [Frontend Architecture (React + Vite)](#frontend-architecture-react--vite)
6. [AI Usage & Engineering Review Log](#ai-usage--engineering-review-log)
7. [Getting Started (Local Execution)](#getting-started-local-execution)
8. [Automated Testing](#automated-testing)
9. [Cloud Deployment Strategy](#cloud-deployment-strategy)
10. [API Documentation](#api-documentation)

---

## 1. Executive Summary & Features

### Core Practical Assessment Requirements:
- **Create an Appointment**: Schedule new appointments with patient, doctor, date/time, appointment type, duration, and clinical notes. Includes inline new-patient registration or selection from existing patients.
- **View Appointments**: Responsive, high-density data table displaying complete relational details (patient contact, clinician specialty, room number, formatted timestamp, and status badges).
- **Edit an Appointment**: Modify appointment timing, provider, appointment type, or clinical status (Scheduled $\to$ In-Progress $\to$ Completed $\to$ Cancelled).
- **Delete an Appointment**: Remove cancelled or invalid appointments with interactive confirmation dialogs.
- **Search & Filter Appointments**:
  - Live full-text search across patient name, clinician name, and clinical notes.
  - Multi-criteria filtering by Clinician, Appointment Type, and Status pill tabs with live counters.
  - Multi-column sorting (Date Ascending/Descending, Patient Name, Doctor Name).
  - Conflict detection ensuring doctors cannot be double-booked for overlapping slots.

---

## 2. Technology Stack & Rationale

| Layer | Technology | Key Strengths & Justification |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** + **Vanilla CSS** | Ultra-fast HMR, lightweight bundle (<80 KB gzip), maximum design fidelity without bulky CSS framework overhead. |
| **Backend** | **Go (Golang)** + **Gin Engine** | Idiomatic layered architecture, static typing, low memory footprint, sub-millisecond route latency. |
| **Database** | **PostgreSQL 16** | Robust ACID transactions, relational integrity with strict Foreign Keys, native index support for timestamp and status queries. |
| **Containerization**| **Docker Compose** | One-command local reproducibility for reviewer evaluation. |

---

## 3. Relational Database Architecture

The data model goes beyond flat records to establish a normalized relational schema with 4 primary tables:

```
┌──────────────────┐               ┌──────────────────────────┐
│     PATIENTS     │               │         DOCTORS          │
├──────────────────┤               ├──────────────────────────┤
│ id (PK)          │1             1│ id (PK)                  │
│ name             ├───────┐ ┌─────┤ name                     │
│ email (UNIQUE)   │       │ │     │ specialty                │
│ phone            │       │ │     │ email (UNIQUE)           │
│ date_of_birth    │       │ │     │ phone                    │
│ gender           │       │ │     │ room_number              │
└──────────────────┘       │ │     └──────────────────────────┘
                           │ │
                     ┌─────┴─┴────────────────┐
                     │      APPOINTMENTS      │
                     ├────────────────────────┤
                     │ id (PK)                │
                     │ patient_id (FK)        │
                     │ doctor_id (FK)         │
                     │ appointment_type_id(FK)│
                     │ appointment_date_time  │
                     │ duration_minutes       │
                     │ status                 │
                     │ notes                  │
                     └─────────┬──────────────┘
                               │
                     ┌─────────┴──────────────┐
                     │   APPOINTMENT_TYPES    │
                     ├────────────────────────┤
                     │ id (PK)                │
                     │ name (UNIQUE)          │
                     │ description            │
                     │ default_duration_min   │
                     └────────────────────────┘
```

### Table Specifications:
1. `patients`: Stores patient biographical and demographic info. `ON DELETE CASCADE` ensures clean removal if a patient record is purged.
2. `doctors`: Maintains healthcare provider details, specialty, and clinical room allocation. `ON DELETE RESTRICT` protects against accidental deletion of physicians with scheduled patients.
3. `appointment_types`: Categorizes visits (e.g., General Consultation, Follow-up Review, Routine Checkup, Urgent Care) and prescribes default visit durations.
4. `appointments`: The central transactional table joining patients, physicians, and visit categories with timestamps and status enumerations.

### Indexing Strategy:
- `idx_appointments_patient_id` & `idx_appointments_doctor_id` for join performance.
- `idx_appointments_date_time` for fast range filters and calendar sorting.
- `idx_appointments_status` for quick state-based tab counts.

---

## 4. Backend Architecture (Go)

The backend follows an idiomatic **layered clean architecture**:

```
backend/
├── cmd/
│   └── server/
│       └── main.go               # Server initialization, CORS, routing
├── internal/
│   ├── database/
│   │   └── db.go                 # PostgreSQL connection pool, auto-migration & seed runner
│   ├── models/
│   │   └── models.go             # Data structs, DTOs, and query parameters
│   ├── repository/
│   │   ├── appointment_repository.go # SQL queries, multi-criteria filtering, joins
│   │   ├── patient_repository.go     # Patient persistence
│   │   └── doctor_repository.go      # Doctor & metadata queries
│   ├── service/
│   │   ├── appointment_service.go    # Business rules, date parsing, conflict checking
│   │   └── appointment_service_test.go # Unit tests
│   └── handler/
│       ├── appointment_handler.go    # HTTP handlers for appointments CRUD
│       └── meta_handler.go           # Metadata & patient HTTP handlers
├── migrations/
│   └── init.sql                  # Initial DDL script
└── go.mod / go.sum
```

---

## 5. Frontend Architecture (React + Vite)

The UI was crafted with a **minimal modern clinical dashboard** aesthetic:
- **Design System Tokens (`index.css`)**: Tailored HSL colors, medical emerald/teal primary gradient, crisp slate borders, soft shadows, and subtle micro-animations.
- **Components**:
  - `Navbar.jsx`: Live PostgreSQL health pulse, brand header, and quick-action button.
  - `StatsCards.jsx`: Interactive KPI metric counters that filter appointments on click.
  - `FiltersBar.jsx`: Debounced search box, doctor dropdown, appointment type dropdown, sort selector, and status tab pills.
  - `AppointmentsTable.jsx`: Relational data table with patient avatars, doctor specialty tags, formatted timestamps, status badges, inline status updater, and pagination.
  - `AppointmentModal.jsx`: Unified dialog supporting both new appointment creation (with inline patient registration toggle) and appointment editing.
  - `DeleteConfirmModal.jsx`: Safe deletion prompt.
  - `Toast.jsx`: Non-intrusive floating feedback notifications.

---

## 6. AI Usage & Engineering Review Log

In accordance with the assessment instructions (*"How you reviewed and corrected AI-generated work"*), below is a record of key technical challenges encountered during AI-assisted development and how they were evaluated and resolved:

| Scenario / Issue | Initial AI Proposal | Engineering Review & Root Cause | Corrective Action Implemented |
| :--- | :--- | :--- | :--- |
| **Port Conflict on PostgreSQL** | Connect to `localhost:5432`. | Host machine already had an unrelated PostgreSQL service on port `5432`, resulting in `failed SASL auth for meduser`. | Re-mapped Docker port to `5433:5432`, decoupled environment configuration with `.env`, and updated connection string fallback logic. |
| **Date Time Normalization** | Simple RFC3339 string parsing. | Browsers HTML5 `<input type="datetime-local">` emits `YYYY-MM-DDTHH:MM`, causing standard Go RFC3339 parser to fail. | Built a multi-format resilient parser (`parseDateTime`) supporting RFC3339, ISO 8601, and HTML5 datetime inputs. Added unit tests for edge cases. |
| **Doctor Double-Booking Conflict** | AI suggested allowing any appointment time without check. | Real-world clinics cannot double-book a physician for the same time window. | Implemented `CheckDoctorConflict` repository query using SQL interval overlapping arithmetic `[start, start + duration)` excluding the current appointment on updates. |
| **Flat vs. Relational Schema** | Storing `patient_name` and `doctor_name` as plain strings in `appointments`. | Violates 3NF, duplicates data, and prevents provider roster management. | Normalized into `patients`, `doctors`, `appointment_types`, and `appointments` with foreign keys and automatic DB seeding. |

---

## 7. Getting Started (Local Execution)

### Prerequisites:
- **Docker & Docker Compose** (for PostgreSQL)
- **Go 1.20+**
- **Node.js 18+ & npm**

### Step 1: Start PostgreSQL via Docker Compose
From the project root:
```bash
docker compose up -d
```
*This starts the PostgreSQL 16 container on port `5433`.*

### Step 2: Start the Go Backend Server
```bash
cd backend
go run cmd/server/main.go
```
*The backend connects to PostgreSQL, automatically applies migrations, seeds sample fictional data, and begins listening at `http://localhost:8080`.*

### Step 3: Start the React Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your web browser to access the Medical Wizard dashboard.*

---

## 8. Automated Testing

To run the backend unit tests and verification suite:
```bash
cd backend
go test -v ./...
```

Expected output:
```
=== RUN   TestParseDateTime
--- PASS: TestParseDateTime (0.00s)
=== RUN   TestStatusValidation
--- PASS: TestStatusValidation (0.00s)
=== RUN   TestConflictIntervalLogic
--- PASS: TestConflictIntervalLogic (0.00s)
PASS
ok  	medwizard-backend/internal/service	0.459s
```

---

## 9. Cloud Deployment Strategy

The application is structured for instant containerized deployment to major cloud platforms:

### Option A: Fly.io / Render / Railway (Recommended for rapid production)
1. **Database**: Provision a managed PostgreSQL instance (e.g., Supabase or Neon).
2. **Backend**: Deploy `backend/Dockerfile` with environment variables:
   ```env
   PORT=8080
   DB_HOST=<cloud-postgres-host>
   DB_PORT=5432
   DB_USER=<cloud-user>
   DB_PASSWORD=<cloud-password>
   DB_NAME=<cloud-db>
   DB_SSLMODE=require
   ```
3. **Frontend**: Deploy `frontend` to Vercel, Netlify, or Cloudflare Pages with `VITE_API_URL=https://<your-backend-domain>/api/v1`.

### Option B: AWS (ECS Fargate + RDS Aurora PostgreSQL)
- Build backend Docker image $\to$ Push to Amazon ECR.
- Deploy task definition on Amazon ECS (Fargate).
- Provision AWS RDS PostgreSQL inside the VPC.
- Frontend hosted on AWS S3 + CloudFront CDN.

---

## 10. API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Healthcheck and service timestamp |
| `GET` | `/api/v1/appointments` | List appointments with pagination, search, status, and doctor filters |
| `GET` | `/api/v1/appointments/:id` | Fetch single appointment by ID with full relational joins |
| `POST` | `/api/v1/appointments` | Create appointment (with conflict check & optional inline patient creation) |
| `PUT` | `/api/v1/appointments/:id` | Update existing appointment details or status |
| `DELETE`| `/api/v1/appointments/:id` | Permanently delete an appointment |
| `GET` | `/api/v1/patients` | Search and list registered patients |
| `POST` | `/api/v1/patients` | Register new patient |
| `GET` | `/api/v1/doctors` | List doctors with specialties and room numbers |
| `GET` | `/api/v1/appointment-types`| List appointment categories and standard durations |
| `GET` | `/api/v1/analytics/stats` | KPI aggregate statistics for dashboard |

---
*Developed with care for the Medical Wizard AI Engineering Assessment.*
