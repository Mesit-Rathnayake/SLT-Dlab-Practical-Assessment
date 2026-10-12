# 🏥 Medical Wizard — Essential Credentials & Evaluation Guide

This document contains all test credentials, role permissions, and evaluation procedures for the **AI Engineering Intern Practical Assessment**.

---

## ⚡ 1-Click Instant Reviewer Access

Both the **Landing Page** (`http://localhost:5173`) and the **Sign In Dialog** feature **1-Click Reviewer Demo Buttons** that authenticate you instantly into any portal without manual input.

| Portal | Account / Profile | 1-Click Button | Target Capabilities |
| :--- | :--- | :---: | :--- |
| **Super Admin** | `superadmin@medwizard.health` | 👑 **Super Admin** | Doctor onboarding with SLMC Reg No, temp password generation & email outbox, duty roster management |
| **General Admin** | `admin@medwizard.health` | 🏢 **General Admin** | Baseline appointment CRUD, advanced filtering, sudden leave alerts |
| **Doctor (Active)** | `eleanor.vance@medwizard.health` | 🩺 **Dr. Vance** | Consultation queue, clinical status progression, emergency leave broadcast |
| **Doctor (Temp Pass)** | `marcus.chen@medwizard.health` | 🛡️ **Dr. Chen** | Tests enforced first-time password reset security workflow |

---

## 🔑 Manual Credentials Directory

### 1. Super Admin Account
- **Email:** `superadmin@medwizard.health`
- **Password:** `SuperAdmin123!`
- **Role:** `SUPER_ADMIN`
- **Permissions:**
  - Onboard new doctors with **SLMC Registration Numbers** (Sri Lanka Medical Council).
  - Automatically generate 10-character cryptographically secure temporary passwords.
  - Review simulated practitioner invitation emails in the **Email Dispatch Outbox**.
  - Configure doctor weekly duty hours and consultation slot durations.

### 2. General Administration Account (Assessment Baseline)
- **Email:** `admin@medwizard.health`
- **Password:** `Admin123!`
- **Role:** `ADMIN`
- **Permissions:**
  - Full Appointment CRUD: **Create**, **View**, **Edit**, **Delete**.
  - Search by patient name, phone, or appointment reference.
  - Multi-criteria filters: Doctor, Appointment Type, Status (`Scheduled`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`).
  - Receive real-time doctor leave broadcast alerts with one-click acknowledgment.

### 3. Active Doctor Account
- **Practitioner:** Dr. Eleanor Vance (Consultant Cardiologist)
- **Email:** `eleanor.vance@medwizard.health`
- **Password:** `DoctorPass123!`
- **Role:** `DOCTOR`
- **Permissions:**
  - View personalized consultation roster with patient history and clinical notes.
  - Advance appointment status (`Confirmed` ➔ `In Progress` ➔ `Completed`).
  - Edit weekly working hours.
  - Broadcast emergency unavailability alerts to hospital administration.

### 4. New Doctor Account (Enforced Temporary Password Reset)
- **Practitioner:** Dr. Marcus Chen (Orthopedic Surgeon, SLMC #65432)
- **Email:** `marcus.chen@medwizard.health`
- **Temporary Password:** `TempDr2026!`
- **Role:** `DOCTOR` (`must_change_password = true`)
- **Workflow:**
  - Demonstrates secure first-time credential validation.
  - Upon sign-in, normal access is blocked by an enforced modal requiring the doctor to set a permanent password of 8+ characters before proceeding.

### 5. Patient Account & Self-Registration
- **Registration Form:** Click **"Register as Patient"** on the Landing Page or navigation bar.
- **Pre-registered Test Patient:**
  - **Name:** Nuwan Perera
  - **Email:** `nuwan.perera@test.com`
  - **Password:** `TestPassword123!`

---

## ☁️ Neon Cloud PostgreSQL Database

- **Host:** `ep-jolly-boat-b3cdn7et-pooler.c-4.ap-southeast-1.aws.neon.tech`
- **Database:** `neondb`
- **Region:** AWS `ap-southeast-1` (Singapore)
- **Encryption:** TLS 1.3 (`sslmode=require`)
- **Key Tables:**
  - `patients` — Demographics, contact information, date of birth, gender
  - `doctors` — SLMC registration number, specialization, consultation room
  - `appointment_types` — Durations (mins), fees (LKR), descriptions
  - `appointments` — Relational foreign keys with status constraints
  - `doctor_schedules` — Day of week, start time, end time, slot intervals
  - `users` — RBAC credentials, bcrypt password hashes, `must_change_password` flag
  - `schedule_change_logs` — Sudden leave broadcasts and emergency reasons
  - `email_notifications` — Simulated outbound clinician onboarding emails

---

## 🚀 Quick Local Setup Guide

```bash
# 1. Backend (Go 1.22+)
cd backend
go run cmd/server/main.go
# Server listens on http://localhost:8080 (connects directly to Neon Cloud DB)

# 2. Frontend (Node.js 18+)
cd frontend
npm install
npm run dev
# Vite runs at http://localhost:5173
```
