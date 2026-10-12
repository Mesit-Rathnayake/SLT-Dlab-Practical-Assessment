# 🏥 Medical Wizard — Enterprise Operations & Access Credentials

Comprehensive credentials directory, role permissions, and National Identity Card (NIC) patient tracking documentation.

---

## ⚡ 1-Click Instant Workspace Access

Both the **Landing Page** (`http://localhost:5173`) and the **Staff Sign In** dialog feature **1-Click Profile Buttons** that authenticate you into any role immediately:

| Portal | Account / Profile | 1-Click Button | Target Capabilities |
| :--- | :--- | :---: | :--- |
| **Super Admin** | `superadmin@medwizard.health` | 👑 **Super Admin** | Doctor onboarding with SLMC Reg No, temp password generation & outbox, weekly duty roster management, full patient medical history access |
| **General Admin** | `admin@medwizard.health` | 🏢 **General Admin** | Appointments directory, NIC-based booking, emergency leave alert banners, patient registry & previous consultation logs |
| **Doctor (Active)** | `eleanor.vance@medwizard.health` | 🩺 **Dr. Vance** | Consultation queue, clinical status progression, emergency leave broadcast |
| **Doctor (Temp Pass)** | `marcus.chen@medwizard.health` | 🛡️ **Dr. Chen** | Enforced first-time password reset security workflow |

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
  - Access **Patient Records & Medical Consultation History**.

### 2. General Hospital Administration (Appointments & Patients)
- **Email:** `admin@medwizard.health`
- **Password:** `Admin123!`
- **Role:** `ADMIN`
- **Permissions:**
  - Full Appointment CRUD: **Create**, **View**, **Edit**, **Delete**.
  - Search by patient name, NIC number, phone, or appointment notes.
  - Multi-criteria filters: Doctor, Appointment Type, Status (`Scheduled`, `In-Progress`, `Completed`, `Cancelled`).
  - **NIC Patient Verification**: Automatically verifies patient identity and displays previous visits when booking.
  - Dedicated **Patient Registry & Medical History** tab with full historical consultation logs.
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
- **Practitioner:** Dr. Marcus Chen (Orthopedic Surgeon, SLMC #51204)
- **Email:** `marcus.chen@medwizard.health`
- **Temporary Password:** `TempDr2026!`
- **Role:** `DOCTOR` (`must_change_password = true`)
- **Workflow:**
  - Demonstrates secure first-time credential validation.
  - Upon sign-in, normal access is blocked by an enforced modal requiring the doctor to set a permanent password of 8+ characters before proceeding.

---

## 🪪 National Identity Card (NIC) Patient Architecture

Patient records are managed securely within General Administration and Super Admin rather than via public registration:

1. **Unique Primary Key:** National Identity Card (**NIC**) number.
2. **Booking Workflow:**
   - When creating an appointment, enter the patient's NIC (e.g. `198810502341`).
   - The system queries the database:
     - **Existing Patient:** Auto-populates demographic details and displays an expandable list of their previous consultations.
     - **New Patient:** Allows staff to enter name and contact details, automatically creating a permanent record under that NIC.
   - The appointment is attached to the patient's record, permanently available in their medical history.
3. **Pre-Seeded Patients with NICs:**

| Patient Name | NIC Number | Contact Phone | Records on File |
| :--- | :--- | :--- | :---: |
| **James Wilson** | `198810502341` | +1 (555) 890-1234 | 2 Consultations |
| **Sophia Martinez** | `199578201945` | +1 (555) 901-2345 | 1 Consultation |
| **Liam Johnson** | `201231005829` | +1 (555) 012-3456 | 1 Consultation |
| **Olivia Davis** | `197451904321` | +1 (555) 123-4567 | 1 Consultation |
| **Alexander Wright** | `198221203456` | +1 (555) 234-8765 | 1 Consultation |
| **Emma Watson** | `199084601289` | +1 (555) 345-9876 | 1 Consultation |
| **Nuwan Perera** | `199214502834` | +94 77 999 8888 | 1 Consultation |

---

## 🚀 Local Setup Guide

```bash
# 1. Backend (Go 1.22+)
cd backend
go run cmd/server/main.go
# Server listens on http://localhost:8080

# 2. Frontend (Node.js 18+)
cd frontend
npm install
npm run dev
# Application runs at http://localhost:5173
```
