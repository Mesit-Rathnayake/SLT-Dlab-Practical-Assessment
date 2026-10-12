# 🏥 Medical Wizard — Role-Based Access Control & Reviewer Credentials

Comprehensive credentials directory, role permissions, navigation guards, and National Identity Card (NIC) patient tracking documentation.

---

## 🔑 Reviewer Credentials Directory

All portal access requires explicit authentication. Reviewers can sign in using the credentials below:

| Role / Account | Name & Non-Doctor Title | Email Address | Password | Authorized Portals | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Arthur Kingsley *(Hospital Executive Director)* | `superadmin@medwizard.health` | `SuperAdmin123!` | Super Admin, General Admin | Doctor onboarding with SLMC Reg No, temp password generation & outbox, weekly duty roster management, full patient medical history access |
| **General Admin** | Sarah Miller *(Front Desk & Admissions Officer)* | `admin@medwizard.health` | `Admin123!` | General Admin only | Patient admissions & registration, appointments directory, NIC-based booking, emergency leave alerts, consultation logs |
| **Doctor (Active)** | Dr. Eleanor Vance *(Consultant Cardiologist)* | `eleanor.vance@medwizard.health` | `DoctorPass123!` | Doctor Portal only | Consultation queue, clinical status progression, doctor weekly schedule, emergency leave broadcast |
| **Doctor (Temp Pass)** | Dr. Marcus Chen *(Orthopedic Surgeon)* | `marcus.chen@medwizard.health` | `TempDr2026!` | Doctor Portal (after password change) | Enforced first-time password rotation security workflow |

> **💡 Quick-Fill Helper:**  
> On both the Sign In page and modal, a "Reviewer Quick-Fill" helper is available to instantly populate the email and password fields. Submitting the form executes real backend authentication via `/api/v1/auth/login` with bcrypt verification and JWT issuance.

---

## 🛡️ Role-Based Access Control (RBAC) & Navigation Guards

The application enforces strict authorization guards across the entire interface:

1. **Unauthenticated Visitors:**
   - Cannot view or access internal hospital portals.
   - Portal switcher tabs in the navigation bar display `Authorization Required`.
   - Any attempt to access internal views redirects to the sign-in screen.

2. **Super Administrator (`SUPER_ADMIN`):**
   - Navigation bar provides tabs for both **Super Admin** and **General Admin**.
   - Personal doctor clinical queues are hidden to preserve clinical separation of concerns.

3. **General Hospital Administrator (`ADMIN`):**
   - Navigation bar displays only the **General Admin** portal (Appointments Directory & Patient Records).
   - Super Admin and Doctor portals are completely restricted and hidden.

4. **Consultant Doctor (`DOCTOR`):**
   - Navigation bar displays only the **Doctor Portal**.
   - Administrative tabs are completely restricted and hidden.
   - Initial sign-in with temporary credentials enforces an immediate password reset dialog before access is granted.

---

## 🪪 Patient Records & NIC (National Identity Card) System

Patient registration and verification is managed within the clinical administration:
- **Primary Identifier:** National Identity Card (NIC) number.
- **Appointment Booking Workflow:**
  1. Click **+ Schedule Appointment**.
  2. Enter Patient NIC (e.g., `198810502341`).
  3. The system checks whether this NIC exists in the hospital database:
     - **Existing Patient:** Automatically populates demographics and reveals previous consultation history.
     - **New Patient:** Registers a permanent patient record attached to that NIC.
  4. The newly booked consultation is permanently attached to that patient's chronological history.

### Pre-Seeded Test Patients:
- **James Wilson** — NIC: `198810502341` (2 previous consultations)
- **Sophia Martinez** — NIC: `199578201945`
- **Liam Johnson** — NIC: `201231005829`
- **Olivia Davis** — NIC: `197451904321`
- **Alexander Wright** — NIC: `198221203456`
- **Emma Watson** — NIC: `199084601289`
- **Nuwan Perera** — NIC: `199214502834`

---

## 🚀 Running Locally

```bash
# Backend (Port 8080)
cd backend
go run cmd/server/main.go

# Frontend (Port 5173)
cd frontend
npm install
npm run dev
```
