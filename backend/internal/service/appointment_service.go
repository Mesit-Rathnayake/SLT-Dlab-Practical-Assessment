package service

import (
	"errors"
	"fmt"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/repository"
	"strings"
	"time"
)

var (
	ErrAppointmentNotFound = errors.New("appointment not found")
	ErrInvalidStatus       = errors.New("invalid appointment status. Must be Scheduled, In-Progress, Completed, or Cancelled")
	ErrDoctorConflict      = errors.New("the selected doctor already has a scheduled appointment overlapping with this time slot")
	ErrInvalidDateTime     = errors.New("invalid appointment date and time format (expected RFC3339 or YYYY-MM-DDTHH:MM)")
	ErrMissingPatient      = errors.New("either patient_id or patient_name with contact info is required")
)

var validStatuses = map[string]bool{
	"Scheduled":   true,
	"In-Progress": true,
	"Completed":   true,
	"Cancelled":   true,
}

type AppointmentService struct {
	apptRepo    *repository.AppointmentRepository
	patientRepo *repository.PatientRepository
	doctorRepo  *repository.DoctorRepository
	typeRepo    *repository.AppointmentTypeRepository
}

func NewAppointmentService(
	apptRepo *repository.AppointmentRepository,
	patientRepo *repository.PatientRepository,
	doctorRepo *repository.DoctorRepository,
	typeRepo *repository.AppointmentTypeRepository,
) *AppointmentService {
	return &AppointmentService{
		apptRepo:    apptRepo,
		patientRepo: patientRepo,
		doctorRepo:  doctorRepo,
		typeRepo:    typeRepo,
	}
}

func (s *AppointmentService) ListAppointments(params models.AppointmentFilterParams) (*repository.ListAppointmentsResult, error) {
	return s.apptRepo.GetAll(params)
}

func (s *AppointmentService) GetAppointmentByID(id int64) (*models.Appointment, error) {
	appt, err := s.apptRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if appt == nil {
		return nil, ErrAppointmentNotFound
	}
	return appt, nil
}

func parseDateTime(raw string) (time.Time, error) {
	// Try standard RFC3339
	if t, err := time.Parse(time.RFC3339, raw); err == nil {
		return t, nil
	}
	// Try HTML5 datetime-local format: 2026-10-12T15:30 or 2026-10-12T15:30:00
	if t, err := time.Parse("2006-01-02T15:04:05", raw); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02T15:04", raw); err == nil {
		return t, nil
	}
	// Try YYYY-MM-DD HH:MM:SS
	if t, err := time.Parse("2006-01-02 15:04:05", raw); err == nil {
		return t, nil
	}
	return time.Time{}, ErrInvalidDateTime
}

func (s *AppointmentService) CreateAppointment(req models.CreateAppointmentRequest) (*models.Appointment, error) {
	// 1. Determine or create patient
	var patientID int64
	cleanNIC := strings.TrimSpace(req.PatientNIC)

	if cleanNIC != "" {
		existingByNIC, err := s.patientRepo.GetByNIC(cleanNIC)
		if err == nil && existingByNIC != nil {
			patientID = existingByNIC.ID
		}
	}

	if patientID == 0 && req.PatientID != nil && *req.PatientID > 0 {
		patientID = *req.PatientID
		patient, err := s.patientRepo.GetByID(patientID)
		if err != nil || patient == nil {
			return nil, fmt.Errorf("patient with ID %d not found", patientID)
		}
	}

	if patientID == 0 && strings.TrimSpace(req.PatientName) != "" {
		email := strings.TrimSpace(req.PatientEmail)
		if email == "" {
			email = strings.ToLower(strings.ReplaceAll(req.PatientName, " ", ".")) + fmt.Sprintf(".%d@medwizard.local", time.Now().Unix())
		}
		phone := strings.TrimSpace(req.PatientPhone)
		if phone == "" {
			phone = "Not provided"
		}
		gender := strings.TrimSpace(req.PatientGender)
		if gender == "" {
			gender = "Unspecified"
		}
		var dob *string
		if strings.TrimSpace(req.PatientDOB) != "" {
			val := strings.TrimSpace(req.PatientDOB)
			dob = &val
		}

		newPatient := &models.Patient{
			NIC:         cleanNIC,
			Name:        strings.TrimSpace(req.PatientName),
			Email:       email,
			Phone:       phone,
			Gender:      gender,
			DateOfBirth: dob,
		}
		createdPatient, err := s.patientRepo.Create(newPatient)
		if err != nil {
			return nil, fmt.Errorf("failed to create new patient: %w", err)
		}
		patientID = createdPatient.ID
	} else if patientID == 0 {
		return nil, ErrMissingPatient
	}

	// 2. Validate Doctor
	doctor, err := s.doctorRepo.GetByID(req.DoctorID)
	if err != nil || doctor == nil {
		return nil, fmt.Errorf("doctor with ID %d not found", req.DoctorID)
	}

	// 3. Parse and validate Date Time
	appTime, err := parseDateTime(req.AppointmentDateTime)
	if err != nil {
		return nil, err
	}

	// 4. Validate duration
	duration := req.DurationMinutes
	if duration <= 0 {
		duration = 30
	}

	// 5. Validate status
	status := strings.TrimSpace(req.Status)
	if status == "" {
		status = "Scheduled"
	}
	if !validStatuses[status] {
		return nil, ErrInvalidStatus
	}

	// 6. Check for doctor scheduling conflicts (only for Scheduled / In-Progress status)
	if status == "Scheduled" || status == "In-Progress" {
		hasConflict, err := s.apptRepo.CheckDoctorConflict(req.DoctorID, appTime, duration, 0)
		if err != nil {
			return nil, fmt.Errorf("failed to verify doctor schedule: %w", err)
		}
		if hasConflict {
			return nil, ErrDoctorConflict
		}
	}

	// 7. Save appointment
	appointment := &models.Appointment{
		PatientID:           patientID,
		DoctorID:            req.DoctorID,
		AppointmentTypeID:   req.AppointmentTypeID,
		AppointmentDateTime: appTime,
		DurationMinutes:     duration,
		Status:              status,
		Notes:               strings.TrimSpace(req.Notes),
	}

	return s.apptRepo.Create(appointment)
}

func (s *AppointmentService) UpdateAppointment(id int64, req models.UpdateAppointmentRequest) (*models.Appointment, error) {
	existing, err := s.apptRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, ErrAppointmentNotFound
	}

	if req.PatientID != nil && *req.PatientID > 0 {
		existing.PatientID = *req.PatientID
	}

	if req.DoctorID != nil && *req.DoctorID > 0 {
		existing.DoctorID = *req.DoctorID
	}

	if req.AppointmentTypeID != nil && *req.AppointmentTypeID > 0 {
		existing.AppointmentTypeID = *req.AppointmentTypeID
	}

	if strings.TrimSpace(req.AppointmentDateTime) != "" {
		appTime, err := parseDateTime(req.AppointmentDateTime)
		if err != nil {
			return nil, err
		}
		existing.AppointmentDateTime = appTime
	}

	if req.DurationMinutes != nil && *req.DurationMinutes > 0 {
		existing.DurationMinutes = *req.DurationMinutes
	}

	if strings.TrimSpace(req.Status) != "" {
		status := strings.TrimSpace(req.Status)
		if !validStatuses[status] {
			return nil, ErrInvalidStatus
		}
		existing.Status = status
	}

	existing.Notes = strings.TrimSpace(req.Notes)

	// Check conflict if scheduled or in-progress
	if existing.Status == "Scheduled" || existing.Status == "In-Progress" {
		hasConflict, err := s.apptRepo.CheckDoctorConflict(existing.DoctorID, existing.AppointmentDateTime, existing.DurationMinutes, id)
		if err != nil {
			return nil, fmt.Errorf("failed to check doctor availability: %w", err)
		}
		if hasConflict {
			return nil, ErrDoctorConflict
		}
	}

	return s.apptRepo.Update(id, existing)
}

func (s *AppointmentService) DeleteAppointment(id int64) error {
	existing, err := s.apptRepo.GetByID(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrAppointmentNotFound
	}
	return s.apptRepo.Delete(id)
}

func (s *AppointmentService) GetDashboardStats() (*models.DashboardStats, error) {
	return s.apptRepo.GetDashboardStats()
}
