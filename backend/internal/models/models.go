package models

import (
	"time"
)

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

// Doctor represents a healthcare provider
type Doctor struct {
	ID         int64     `json:"id"`
	Name       string    `json:"name"`
	Specialty  string    `json:"specialty"`
	Email      string    `json:"email"`
	Phone      string    `json:"phone"`
	RoomNumber string    `json:"room_number"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
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

// CreateAppointmentRequest represents payload to create a new appointment
type CreateAppointmentRequest struct {
	PatientID           *int64  `json:"patient_id"`
	// Alternatively allow inline creation of patient if patient_id is not provided
	PatientName         string  `json:"patient_name"`
	PatientEmail        string  `json:"patient_email"`
	PatientPhone        string  `json:"patient_phone"`
	DoctorID            int64   `json:"doctor_id" binding:"required"`
	AppointmentTypeID   int64   `json:"appointment_type_id" binding:"required"`
	AppointmentDateTime string  `json:"appointment_date_time" binding:"required"`
	DurationMinutes     int     `json:"duration_minutes"`
	Status              string  `json:"status"`
	Notes               string  `json:"notes"`
}

// UpdateAppointmentRequest represents payload to edit an existing appointment
type UpdateAppointmentRequest struct {
	PatientID           *int64 `json:"patient_id"`
	DoctorID            *int64 `json:"doctor_id"`
	AppointmentTypeID   *int64 `json:"appointment_type_id"`
	AppointmentDateTime string `json:"appointment_date_time"`
	DurationMinutes     *int   `json:"duration_minutes"`
	Status              string `json:"status"`
	Notes               string `json:"notes"`
}

// AppointmentFilterParams represents query parameters for filtering and searching
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

// DashboardStats represents analytical summary for medical staff
type DashboardStats struct {
	TotalAppointments int64 `json:"total_appointments"`
	TodayAppointments int64 `json:"today_appointments"`
	ScheduledCount    int64 `json:"scheduled_count"`
	InProgressCount   int64 `json:"in_progress_count"`
	CompletedCount    int64 `json:"completed_count"`
	CancelledCount    int64 `json:"cancelled_count"`
	TotalPatients     int64 `json:"total_patients"`
	TotalDoctors      int64 `json:"total_doctors"`
}
