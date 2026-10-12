package models

import (
	"time"
)

// Roles
const (
	RoleSuperAdmin = "SUPER_ADMIN"
	RoleAdmin      = "ADMIN"
	RoleDoctor     = "DOCTOR"
)

// User represents an authenticated staff, admin, or clinician
type User struct {
	ID                 int64     `json:"id"`
	Name               string    `json:"name"`
	Email              string    `json:"email"`
	PasswordHash       string    `json:"-"`
	Role               string    `json:"role"` // SUPER_ADMIN, ADMIN, DOCTOR
	DoctorID           *int64    `json:"doctor_id,omitempty"`
	MustChangePassword bool      `json:"must_change_password"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	Doctor *Doctor `json:"doctor,omitempty"`
}

// Patient represents a registered patient
type Patient struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	DateOfBirth *string   `json:"date_of_birth,omitempty"`
	Gender      string    `json:"gender"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Doctor represents a healthcare provider with clinical details
type Doctor struct {
	ID         int64            `json:"id"`
	Name       string           `json:"name"`
	Specialty  string           `json:"specialty"`
	Email      string           `json:"email"`
	Phone      string           `json:"phone"`
	RoomNumber string           `json:"room_number"`
	SLMCRegNo  string           `json:"slmc_reg_no"`
	Status     string           `json:"status"` // Active, On Leave, Inactive
	Bio        string           `json:"bio"`
	CreatedAt  time.Time        `json:"created_at"`
	UpdatedAt  time.Time        `json:"updated_at"`
	Schedules  []DoctorSchedule `json:"schedules,omitempty"`
}

// DoctorSchedule represents a recurring weekly availability
type DoctorSchedule struct {
	ID                  int64     `json:"id"`
	DoctorID            int64     `json:"doctor_id"`
	DayOfWeek           int       `json:"day_of_week"` // 1=Mon, ..., 7=Sun
	StartTime           string    `json:"start_time"`  // "09:00"
	EndTime             string    `json:"end_time"`    // "17:00"
	IsAvailable         bool      `json:"is_available"`
	SlotDurationMinutes int       `json:"slot_duration_minutes"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// DoctorScheduleChange represents a sudden leave, emergency, or working hour override
type DoctorScheduleChange struct {
	ID            int64     `json:"id"`
	DoctorID      int64     `json:"doctor_id"`
	DoctorName    string    `json:"doctor_name,omitempty"`
	ChangeType    string    `json:"change_type"` // EMERGENCY_LEAVE, HOURS_ADJUSTMENT, TEMPORARY_UNAVAILABLE
	EffectiveDate string    `json:"effective_date"`
	StartTime     string    `json:"start_time"`
	EndTime       string    `json:"end_time"`
	Reason        string    `json:"reason"`
	Status        string    `json:"status"` // ACTIVE, ACKNOWLEDGED
	CreatedAt     time.Time `json:"created_at"`
}

// AppointmentType represents the category of the appointment
type AppointmentType struct {
	ID                     int64     `json:"id"`
	Name                   string    `json:"name"`
	Description            string    `json:"description"`
	DefaultDurationMinutes int       `json:"default_duration_minutes"`
	CreatedAt              time.Time `json:"created_at"`
}

// Appointment represents a scheduled clinical meeting between a patient and a doctor
type Appointment struct {
	ID                  int64            `json:"id"`
	PatientID           int64            `json:"patient_id"`
	DoctorID            int64            `json:"doctor_id"`
	AppointmentTypeID   int64            `json:"appointment_type_id"`
	AppointmentDateTime time.Time        `json:"appointment_date_time"`
	DurationMinutes     int              `json:"duration_minutes"`
	Status              string           `json:"status"` // Scheduled, In-Progress, Completed, Cancelled
	Notes               string           `json:"notes"`
	CreatedAt           time.Time        `json:"created_at"`
	UpdatedAt           time.Time        `json:"updated_at"`

	// Relational details populated via JOINs
	Patient         *Patient         `json:"patient,omitempty"`
	Doctor          *Doctor          `json:"doctor,omitempty"`
	AppointmentType *AppointmentType `json:"appointment_type,omitempty"`
}

// EmailNotification represents a simulated outbound email record
type EmailNotification struct {
	ID             int64     `json:"id"`
	RecipientEmail string    `json:"recipient_email"`
	Subject        string    `json:"subject"`
	Body           string    `json:"body"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
}

// --- Request and Response DTOs ---

// LoginRequest
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// SignupRequest for patient / user registration
type SignupRequest struct {
	Name        string  `json:"name" binding:"required"`
	Email       string  `json:"email" binding:"required"`
	Password    string  `json:"password" binding:"required"`
	Phone       string  `json:"phone" binding:"required"`
	DateOfBirth *string `json:"date_of_birth,omitempty"`
	Gender      string  `json:"gender"`
}

// LoginResponse
type LoginResponse struct {
	Token              string `json:"token"`
	User               User   `json:"user"`
	MustChangePassword bool   `json:"must_change_password"`
}

// ChangePasswordRequest
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required"`
}

// RegisterDoctorAccountRequest used by Super Admin
type RegisterDoctorAccountRequest struct {
	Name        string `json:"name" binding:"required"`
	Specialty   string `json:"specialty" binding:"required"`
	Email       string `json:"email" binding:"required"`
	Phone       string `json:"phone" binding:"required"`
	RoomNumber  string `json:"room_number"`
	SLMCRegNo   string `json:"slmc_reg_no" binding:"required"`
	Bio         string `json:"bio"`
	TempPassword string `json:"temp_password"` // If empty, auto-generated
}

// CreateAppointmentRequest
type CreateAppointmentRequest struct {
	PatientID           *int64 `json:"patient_id"`
	PatientName         string `json:"patient_name"`
	PatientEmail        string `json:"patient_email"`
	PatientPhone        string `json:"patient_phone"`
	DoctorID            int64  `json:"doctor_id" binding:"required"`
	AppointmentTypeID   int64  `json:"appointment_type_id" binding:"required"`
	AppointmentDateTime string `json:"appointment_date_time" binding:"required"`
	DurationMinutes     int    `json:"duration_minutes"`
	Status              string `json:"status"`
	Notes               string `json:"notes"`
}

// UpdateAppointmentRequest
type UpdateAppointmentRequest struct {
	PatientID           *int64 `json:"patient_id"`
	DoctorID            *int64 `json:"doctor_id"`
	AppointmentTypeID   *int64 `json:"appointment_type_id"`
	AppointmentDateTime string `json:"appointment_date_time"`
	DurationMinutes     *int   `json:"duration_minutes"`
	Status              string `json:"status"`
	Notes               string `json:"notes"`
}

// AppointmentFilterParams
type AppointmentFilterParams struct {
	Search    string `form:"search"`
	Status    string `form:"status"`
	DoctorID  int64  `form:"doctor_id"`
	TypeID    int64  `form:"type_id"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	SortBy    string `form:"sort_by"`
	SortOrder string `form:"sort_order"`
}

// DashboardStats
type DashboardStats struct {
	TotalAppointments int64 `json:"total_appointments"`
	TodayAppointments int64 `json:"today_appointments"`
	ScheduledCount    int64 `json:"scheduled_count"`
	InProgressCount   int64 `json:"in_progress_count"`
	CompletedCount    int64 `json:"completed_count"`
	CancelledCount    int64 `json:"cancelled_count"`
	TotalPatients     int64 `json:"total_patients"`
	TotalDoctors      int64 `json:"total_doctors"`
	ActiveAlertsCount int64 `json:"active_alerts_count"`
}
