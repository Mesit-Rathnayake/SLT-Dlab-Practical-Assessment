package repository

import (
	"database/sql"
	"fmt"
	"medwizard-backend/internal/models"
	"strings"
	"time"
)

type PatientRepository struct {
	db *sql.DB
}

func NewPatientRepository(db *sql.DB) *PatientRepository {
	return &PatientRepository{db: db}
}

func (r *PatientRepository) GetAll(search string) ([]models.Patient, error) {
	query := "SELECT id, COALESCE(nic, ''), name, email, phone, TO_CHAR(date_of_birth, 'YYYY-MM-DD'), gender, created_at, updated_at FROM patients"
	var args []interface{}

	if strings.TrimSpace(search) != "" {
		query += " WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1 OR phone LIKE $1 OR LOWER(COALESCE(nic, '')) LIKE $1"
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(search))+"%")
	}
	query += " ORDER BY name ASC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query patients: %w", err)
	}
	defer rows.Close()

	var patients []models.Patient
	for rows.Next() {
		var p models.Patient
		var dob sql.NullString
		if err := rows.Scan(&p.ID, &p.NIC, &p.Name, &p.Email, &p.Phone, &dob, &p.Gender, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan patient: %w", err)
		}
		if dob.Valid {
			p.DateOfBirth = &dob.String
		}
		patients = append(patients, p)
	}

	return patients, nil
}

func (r *PatientRepository) GetByID(id int64) (*models.Patient, error) {
	query := "SELECT id, COALESCE(nic, ''), name, email, phone, TO_CHAR(date_of_birth, 'YYYY-MM-DD'), gender, created_at, updated_at FROM patients WHERE id = $1"
	var p models.Patient
	var dob sql.NullString

	err := r.db.QueryRow(query, id).Scan(&p.ID, &p.NIC, &p.Name, &p.Email, &p.Phone, &dob, &p.Gender, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get patient by id: %w", err)
	}
	if dob.Valid {
		p.DateOfBirth = &dob.String
	}
	return &p, nil
}

func (r *PatientRepository) GetByNIC(nic string) (*models.Patient, error) {
	cleanNIC := strings.TrimSpace(nic)
	if cleanNIC == "" {
		return nil, nil
	}
	query := "SELECT id, COALESCE(nic, ''), name, email, phone, TO_CHAR(date_of_birth, 'YYYY-MM-DD'), gender, created_at, updated_at FROM patients WHERE LOWER(nic) = LOWER($1)"
	var p models.Patient
	var dob sql.NullString

	err := r.db.QueryRow(query, cleanNIC).Scan(&p.ID, &p.NIC, &p.Name, &p.Email, &p.Phone, &dob, &p.Gender, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get patient by nic: %w", err)
	}
	if dob.Valid {
		p.DateOfBirth = &dob.String
	}
	return &p, nil
}

func (r *PatientRepository) Create(p *models.Patient) (*models.Patient, error) {
	query := `
	INSERT INTO patients (nic, name, email, phone, date_of_birth, gender, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING id, created_at, updated_at
	`
	now := time.Now()
	var dob interface{}
	if p.DateOfBirth != nil && *p.DateOfBirth != "" {
		dob = *p.DateOfBirth
	} else {
		dob = nil
	}

	cleanNIC := strings.TrimSpace(p.NIC)

	err := r.db.QueryRow(query, cleanNIC, p.Name, p.Email, p.Phone, dob, p.Gender, now, now).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create patient: %w", err)
	}

	return p, nil
}

func (r *PatientRepository) GetPatientAppointments(patientID int64) ([]models.Appointment, error) {
	query := `
	SELECT 
		a.id, a.patient_id, a.doctor_id, a.appointment_type_id,
		a.appointment_date_time, a.duration_minutes, a.status, a.notes,
		a.created_at, a.updated_at,
		d.id, d.name, d.specialty, d.room_number,
		t.id, t.name, t.default_duration_minutes
	FROM appointments a
	JOIN doctors d ON a.doctor_id = d.id
	JOIN appointment_types t ON a.appointment_type_id = t.id
	WHERE a.patient_id = $1
	ORDER BY a.appointment_date_time DESC
	`
	rows, err := r.db.Query(query, patientID)
	if err != nil {
		return nil, fmt.Errorf("failed to query patient appointments: %w", err)
	}
	defer rows.Close()

	var appts []models.Appointment
	for rows.Next() {
		var a models.Appointment
		var doc models.Doctor
		var at models.AppointmentType
		err := rows.Scan(
			&a.ID, &a.PatientID, &a.DoctorID, &a.AppointmentTypeID,
			&a.AppointmentDateTime, &a.DurationMinutes, &a.Status, &a.Notes,
			&a.CreatedAt, &a.UpdatedAt,
			&doc.ID, &doc.Name, &doc.Specialty, &doc.RoomNumber,
			&at.ID, &at.Name, &at.DefaultDurationMinutes,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan appointment: %w", err)
		}
		a.Doctor = &doc
		a.AppointmentType = &at
		appts = append(appts, a)
	}
	return appts, nil
}
