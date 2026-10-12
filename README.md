# Medical Wizard — Clinical Appointment Management System

[![Go](https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat&logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://docker.com)
[![RBAC](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-059669?style=flat)](https://jwt.io)

An enterprise full-stack clinical appointment management system designed for high-reliability hospital and outpatient clinic operations.

The system incorporates **Role-Based Access Control (RBAC)** across specialized operational workspaces (**General Administration & Admissions**, **Super Admin Governance**, and **Doctor Clinical Suite**), National Identity Card (NIC) patient tracking, SLMC registration verification, temporary credential dispatch with forced password rotation, and real-time sudden schedule change alert broadcasting.

---

## Table of Contents
1. [Core Platform Capabilities](#core-platform-capabilities)
2. [Multi-Portal System & RBAC Architecture](#multi-portal-system--rbac-architecture)
3. [Credentials & Access Directory](#credentials--access-directory)
4. [Relational Database Architecture](#relational-database-architecture)
5. [Backend & Security Architecture (Go)](#backend--security-architecture-go)
6. [Frontend Architecture (React + Vite)](#frontend-architecture-react--vite)
7. [Getting Started (Local Execution)](#getting-started-local-execution)
8. [Connecting to Neon Serverless Cloud PostgreSQL](#connecting-to-neon-serverless-cloud-postgresql)
9. [Automated Testing](#automated-testing)
10. [Cloud Deployment Strategy](#cloud-deployment-strategy)
11. [API Specification](#api-specification)

---

## 1. Core Platform Capabilities

| Module | Operational Capability | Implementation Details |
| :--- | :--- | :--- |
| **Outpatient Scheduling** | Appointment Lifecycle | Relational form linking patient, provider, visit type, duration, and clinical notes. Includes **clinician conflict prevention** and inline new-patient registration. |
| **Directory & Queue** | Centralized Directory | High-density data table with patient avatars, clinician specialties, clinic room numbers, formatted timestamps, visit categories, and status badges. |
| **Patient Care History** | Longitudinal Records | Instant retrieval of all previous consultations linked to patient **National Identity Card (NIC)** number. |
| **Encounter Modification**| Appointment Editor | Full encounter editor dialog and instant inline status changer directly from each table row. |
| **Cancellation & Deletion**| Safe Cancellation | Safe deletion workflow with interactive confirmation modal and immediate table & KPI update. |
| **Search & Discovery** | Multi-Criteria Filtering | Real-time debounced full-text search across patients, doctors, and notes; status pill tabs with live counters; provider & type dropdowns; multi-column sorting. |
| **Executive Governance** | Clinician Credentialing | Onboards medical practitioners with **SLMC Registration Numbers**, issues auto-generated temporary passwords, sets recurring weekly working hours, and audits welcome emails. |
| **Doctor Workspace** | Consultation Encounter Suite | Dedicated workspace for clinicians to review their consultations, advance visit states (Start $\to$ Completed), manage duty hours, and broadcast sudden emergency leaves. |
| **Clinical Alerts** | Emergency Leave Broadcasting | When a doctor submits emergency leave or adjusted clinic hours, a prominent alert banner broadcasts immediately to General Administration. |
| **Security & Auth** | RBAC & Cryptographic Tokens | JWT authentication, bcrypt password hashing, and enforced first-time password rotation (`must_change_password`). |

---

## 2. Multi-Portal System & RBAC Architecture

The application provides three specialized role-based workspaces accessible via the top navigation bar or the **"Switch Profile"** dialog:

### 1. 🏥 General Administration Portal (Hospital Staff / Front Desk)
- Centralized appointment scheduling and management.
- Real-time search, multi-criteria filtering, and live KPI summary metrics.
- Prominent **Sudden Schedule Change Alerts Banner** notifying front-desk staff whenever a clinician reports emergency leave or modified hours, with an "Acknowledge" button.

### 2. 👑 Super Admin Portal
- **Doctor Registry & Onboarding**: Register new physicians with Name, Specialty, SLMC Registration No, Email, Phone, Room Number, and Bio. Automatically generates a secure temporary password and dispatches an activation notification.
- **Available Days & Time Slots Manager**: Configure each doctor's active days of the week (Monday through Sunday), on-duty shift hours (e.g., `09:00 - 17:00`), and consultation slot duration.
- **Email Notification Outbox**: Transactional mailer audit trail displaying all sent welcome letters and temporary passwords.

### 3. 🩺 Doctor Portal (Personalized Clinician Workspace)
- **Consultation Directory**: Shows only the logged-in physician's scheduled patients, formatted timestamps, and clinical notes.
- **Consultation Progression**: Clinicians can advance appointments directly from `Scheduled` $\to$ `In-Progress` $\to$ `Completed`.
- **Working Hours Customizer**: Allows doctors to adjust their recurring duty days and working hours.
- **Report Sudden Leave / Notice**: Modal allowing doctors to broadcast emergency leaves, surgery duties, or delayed clinic starts directly to hospital administration.

---

## 3. Credentials & Access Directory

> 📄 **Evaluation Reference**: Detailed credentials and NIC mapping are documented in [CREDENTIALS.txt](file:///d:/Education/INternship/SLT/Task%2001/CREDENTIALS.txt) and [CREDENTIALS.md](file:///d:/Education/INternship/SLT/Task%2001/CREDENTIALS.md).

The system features an enterprise **Landing Page** and **Staff Sign In** dialog with **1-Click Workspace Switcher Buttons** for instant access without manual typing:

| Role | Name | Email | Password | Features / Flow |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Arthur Kingsley | `superadmin@medwizard.health` | `SuperAdmin123!` | Doctor onboarding, SLMC verification, Working hours editor, Email outbox, Patient Records & History. |
| **General Admin**| Sarah Miller | `admin@medwizard.health` | `Admin123!` | Appointments directory, NIC-based booking, emergency leave alert banner, Patient Registry & Medical History tab. |
| **Doctor (Active)**| Dr. Eleanor Vance | `eleanor.vance@medwizard.health` | `DoctorPass123!` | Active Consultant Cardiologist workspace, consultation actions. |
| **Doctor (Temp)** | Dr. Marcus Chen | `marcus.chen@medwizard.health` | `TempDr2026!` | **Enforced Password Security Workflow**: Prompts doctor to set a permanent password upon login! |

> **Patient Record Management**: Patient registration is maintained internally by administrative staff using **National Identity Card (NIC)** numbers as the unique identifier. When booking an appointment, entering a patient's NIC automatically retrieves their consultation history and links the new visit.

---

## 4. Relational Database Architecture

The normalized schema enforces **Third Normal Form (3NF)** with foreign keys and cascade/restrict rules across 6 relational tables:

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
└──────────────────┘       │ │     │ slmc_reg_no              │
                           │ │     │ status ('Active', etc)   │
                           │ │     │ bio                      │
                           │ │     └────────────┬─────────────┘
                     ┌─────┴─┴────────────────┐ │
                     │      APPOINTMENTS      │ │1
                     ├────────────────────────┤ │
                     │ id (PK)                │ │
                     │ patient_id (FK)        │ │
                     │ doctor_id (FK)         │ │
                     │ appointment_type_id(FK)│ │
                     │ appointment_date_time  │ │
                     │ duration_minutes       │ │
                     │ status                 │ │
                     │ notes                  │ │
                     └─────────┬──────────────┘ │
                               │                │
                     ┌─────────┴──────────────┐ │
                     │   APPOINTMENT_TYPES    │ │
                     ├────────────────────────┤ │
                     │ id (PK)                │ │
                     │ name (UNIQUE)          │ │
                     │ default_duration_min   │ │
                     └────────────────────────┘ │
                                                │
       ┌────────────────────────────────────────┼──────────────────────────────┐
       │                                        │                              │
       ▼ *                                      ▼ *                            ▼ *
┌──────────────────────────┐      ┌───────────────────────────┐  ┌──────────────────────────┐
│          USERS           │      │     DOCTOR_SCHEDULES      │  │ DOCTOR_SCHEDULE_CHANGES  │
├──────────────────────────┤      ├───────────────────────────┤  ├──────────────────────────┤
│ id (PK)                  │      │ id (PK)                   │  │ id (PK)                  │
│ name                     │      │ doctor_id (FK)            │  │ doctor_id (FK)           │
│ email (UNIQUE)           │      │ day_of_week (1-7)         │  │ change_type              │
│ password_hash (bcrypt)   │      │ start_time ("09:00")      │  │ effective_date           │
│ role (SUPER_ADMIN, etc)  │      │ end_time ("17:00")        │  │ start_time / end_time    │
│ doctor_id (FK)           │      │ is_available (boolean)    │  │ reason                   │
│ must_change_password     │      │ slot_duration_minutes     │  │ status ('ACTIVE', etc)   │
└──────────────────────────┘      └───────────────────────────┘  └──────────────────────────┘
```

---

## 5. Backend & Security Architecture (Go)

- **Authentication**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 containing user ID, role, and doctor association.
- **Password Security**: Bcrypt adaptive hashing (cost factor 10).
- **RBAC Middleware**:
  - `auth.AuthMiddleware()`: Validates incoming Bearer token and injects claims into the Gin context.
  - `auth.RequireRole(...)`: Enforces access privileges (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`).
- **Conflict Prevention**: SQL interval arithmetic prevents overlapping bookings for the same doctor.
- **Auto-Migration & Seeding**: The backend applies all DDL tables, indexes, and test credentials automatically on startup.

---

## 6. Frontend Architecture (React + Vite)

- **State & Auth Context (`AuthContext.jsx`)**: Manages session state, active portal mode, and demo credentials.
- **Portals**:
  - `SuperAdminPortal.jsx`: Doctor registry with SLMC numbers, modal onboarding with credential generation, working hours manager, and email outbox audit.
  - `DoctorPortal.jsx`: Consultation directory, appointment state advancement, working hours adjustment, and emergency leave reporting.
  - `AppointmentsTable.jsx` & `FiltersBar.jsx`: General administration appointment grid, search, and status tabs.
  - `AdminScheduleAlertsBanner.jsx`: Emergency schedule change banner.
  - `ForceChangePasswordModal.jsx`: Mandatory temporary password rotation dialog.

---

## 7. AI Usage & Engineering Review Log

| Scenario / Challenge | Initial AI Output | Review & Root Cause Analysis | Corrective Action Applied |
| :--- | :--- | :--- | :--- |
| **Database Port Collision** | Bound PostgreSQL to port `5432`. | Host machine already had an unrelated PostgreSQL service on `5432`, resulting in `failed SASL auth for user meduser`. | Re-mapped Docker container port to `5433:5432`, isolated configuration in `.env`, and updated fallback logic in `db.go`. |
| **HTML5 Datetime Format Mismatch** | Assumed standard RFC3339 timestamps. | Browser `<input type="datetime-local">` emits `YYYY-MM-DDTHH:MM`, causing standard Go RFC3339 parser to fail. | Built a resilient multi-format parser (`parseDateTime`) with fallback formats and wrote automated unit tests. |
| **Doctor Double-Booking Conflict** | Allowed any appointment time without check. | Clinicians cannot be scheduled for overlapping slots at the same time. | Implemented `CheckDoctorConflict` utilizing SQL interval overlap math `[start, start + duration)` excluding the current appointment on updates. |
| **Doctor Temporary Credential Workflow** | Plain text password in API response without rotation constraint. | Security violation; temporary passwords must require mandatory rotation upon first login. | Implemented `must_change_password` flag, bcrypt hashing, and frontend `ForceChangePasswordModal` blocking portal access until rotated. |

---

## 8. Getting Started (Local Execution)

### 1. Start PostgreSQL Container
```powershell
docker compose up -d
```
*Runs PostgreSQL 16 on port `5433`.*

### 2. Start Go Backend Server
```powershell
cd backend
go run cmd/server/main.go
```
*Listens on port `8080`, automatically executes schema migrations, and seeds test accounts.*

### 3. Start React Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Access the system at `http://localhost:5173`.*

---

---

## 9. Connecting to Neon Serverless Cloud PostgreSQL

The backend has built-in support for **Neon** (Serverless PostgreSQL). Whenever `DATABASE_URL` is provided, the backend connects securely over TLS, auto-creates all relational tables, and provisions the initial seed data.

### Step-by-Step Neon Cloud Setup:

#### Step 1: Create a Free Neon Account & Project
1. Go to [https://neon.tech](https://neon.tech) and sign up (or log in with GitHub/Google).
2. Click **"Create Project"**.
3. Name your project (e.g., `medwizard-db`) and select a region closest to you.
4. Click **"Create Project"**.

#### Step 2: Retrieve the Connection String
1. On your Neon Dashboard, look at the **Connection Details** widget.
2. Select **"Postgres"** / **"Go"** or standard **Connection string**.
3. It will look like this:
   ```
   postgresql://alex:AbC123XyZ@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Click the **Copy** button.

#### Step 3: Configure `backend/.env`
Open `backend/.env` (or copy from `backend/.env.example`) and add your Neon connection string:
```env
PORT=8080

# Neon Serverless PostgreSQL Connection String
DATABASE_URL=postgresql://<user>:<password>@<ep-your-endpoint>.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Secret
JWT_SECRET=medwizard-secret-jwt-signing-key-2026
```

#### Step 4: Run the Go Backend
Start the server:
```powershell
cd backend
go run cmd/server/main.go
```
The server will output:
```
2026/10/12 Starting Medical Wizard Clinical Operations & RBAC API...
Successfully connected to Cloud PostgreSQL database (Neon)
Seeding fictional doctors with SLMC registration numbers...
Seeding appointment types...
Seeding fictional patients...
Seeding RBAC users (Super Admin, General Admin, Doctors)...
Seeding default weekly doctor schedules...
Database migration, seeding, and RBAC provisioning completed successfully.
Server listening on port :8080
```

#### Step 5: Verify in Neon Console & Frontend
- In the [Neon Console](https://console.neon.tech), open the **SQL Editor** or **Tables** view: you will see `patients`, `doctors`, `appointments`, `appointment_types`, `users`, `doctor_schedules`, and `doctor_schedule_changes` fully populated!
- Run the frontend (`npm run dev` in `frontend/`) and test your live cloud-backed appointment management system!

---

## 10. Automated Testing

Run the Go backend test suite:
```powershell
cd backend
go test -v ./...
```
Output:
```
=== RUN   TestParseDateTime
--- PASS: TestParseDateTime (0.00s)
=== RUN   TestStatusValidation
--- PASS: TestStatusValidation (0.00s)
=== RUN   TestConflictIntervalLogic
--- PASS: TestConflictIntervalLogic (0.00s)
PASS
ok  	medwizard-backend/internal/service	(cached)
```

---

## 11. Cloud Deployment Strategy

Production Dockerfiles and configurations are ready:
- **Backend Dockerfile**: Multi-stage Alpine container ([backend/Dockerfile](file:///d:/Education/INternship/SLT/Task%2001/backend/Dockerfile)). Deployable to Fly.io, Render, or AWS ECS Fargate with `DATABASE_URL` pointing to Neon.
- **Frontend Dockerfile**: Multi-stage Nginx container ([frontend/Dockerfile](file:///d:/Education/INternship/SLT/Task%2001/frontend/Dockerfile)). Deployable to Vercel, Cloudflare Pages, or Render with `VITE_API_URL` pointing to the backend.
- **Database**: Serverless PostgreSQL managed on [Neon](https://neon.tech).

---

## 12. API Specification

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and issue JWT |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Update user password (clears `must_change_password`) |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch active user session profile |
| `GET` | `/api/v1/appointments` | General Access | Search and filter appointments |
| `POST` | `/api/v1/appointments` | General Access | Book appointment with conflict detection |
| `PUT` | `/api/v1/appointments/:id` | General Access | Edit appointment or advance status |
| `DELETE`| `/api/v1/appointments/:id` | General Access | Delete appointment |
| `POST` | `/api/v1/admin/doctors` | Super Admin | Register doctor with SLMC Reg No & temp password |
| `GET` | `/api/v1/admin/doctors/:id/schedules`| Super Admin | Fetch doctor recurring weekly availability |
| `PUT` | `/api/v1/admin/doctors/:id/schedules`| Super Admin | Update doctor working hours and slot lengths |
| `GET` | `/api/v1/admin/emails` | Super Admin | Audit outbound welcome letters & credentials |
| `GET` | `/api/v1/admin/schedule-changes` | Admin / Super Admin | Fetch sudden doctor schedule changes |
| `POST` | `/api/v1/admin/schedule-changes/:id/ack`| Admin / Super Admin | Acknowledge emergency notice |
| `GET` | `/api/v1/doctor/my-appointments`| Doctor Only | Fetch consultations for logged-in physician |
| `GET` | `/api/v1/doctor/my-schedule`| Doctor Only | Fetch doctor's own working hours |
| `PUT` | `/api/v1/doctor/my-schedule`| Doctor Only | Adjust doctor's own working hours |
| `POST` | `/api/v1/doctor/schedule-changes`| Doctor Only | Broadcast emergency leave or altered clinic hours |

---
*Developed for the Medical Wizard AI Engineering Practical Assessment.*
