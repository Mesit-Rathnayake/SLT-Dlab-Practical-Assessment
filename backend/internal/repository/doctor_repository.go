package repository

import (
	"database/sql"
	"fmt"
	"medwizard-backend/internal/models"
	"time"
)

type DoctorRepository struct {
	db *sql.DB
}

func NewDoctorRepository(db *sql.DB) *DoctorRepository {
	return &DoctorRepository{db: db}
}

func (r *DoctorRepository) GetAll() ([]models.Doctor, error) {
	query := `
	SELECT id, name, specialty, email, phone, room_number, 
	       COALESCE(slmc_reg_no, ''), COALESCE(status, 'Active'), COALESCE(bio, ''), 
	       created_at, updated_at 
	FROM doctors ORDER BY name ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query doctors: %w", err)
	}
	defer rows.Close()

	var doctors []models.Doctor
	for rows.Next() {
		var d models.Doctor
		if err := rows.Scan(&d.ID, &d.Name, &d.Specialty, &d.Email, &d.Phone, &d.RoomNumber, &d.SLMCRegNo, &d.Status, &d.Bio, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan doctor: %w", err)
		}
		doctors = append(doctors, d)
	}
	return doctors, nil
}

func (r *DoctorRepository) GetByID(id int64) (*models.Doctor, error) {
	query := `
	SELECT id, name, specialty, email, phone, room_number, 
	       COALESCE(slmc_reg_no, ''), COALESCE(status, 'Active'), COALESCE(bio, ''), 
	       created_at, updated_at 
	FROM doctors WHERE id = $1
	`
	var d models.Doctor
	err := r.db.QueryRow(query, id).Scan(&d.ID, &d.Name, &d.Specialty, &d.Email, &d.Phone, &d.RoomNumber, &d.SLMCRegNo, &d.Status, &d.Bio, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get doctor: %w", err)
	}

	// Fetch schedules
	schedules, _ := r.GetSchedulesByDoctorID(id)
	d.Schedules = schedules

	return &d, nil
}

func (r *DoctorRepository) Create(d *models.Doctor) (*models.Doctor, error) {
	query := `
	INSERT INTO doctors (name, specialty, email, phone, room_number, slmc_reg_no, status, bio, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	RETURNING id, created_at, updated_at
	`
	now := time.Now()
	status := d.Status
	if status == "" {
		status = "Active"
	}
	err := r.db.QueryRow(query, d.Name, d.Specialty, d.Email, d.Phone, d.RoomNumber, d.SLMCRegNo, status, d.Bio, now, now).Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert doctor: %w", err)
	}
	return d, nil
}

func (r *DoctorRepository) Update(id int64, d *models.Doctor) (*models.Doctor, error) {
	query := `
	UPDATE doctors
	SET name = $1, specialty = $2, email = $3, phone = $4, room_number = $5, slmc_reg_no = $6, status = $7, bio = $8, updated_at = $9
	WHERE id = $10
	`
	now := time.Now()
	_, err := r.db.Exec(query, d.Name, d.Specialty, d.Email, d.Phone, d.RoomNumber, d.SLMCRegNo, d.Status, d.Bio, now, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update doctor: %w", err)
	}
	return r.GetByID(id)
}

// Doctor Schedules (weekly recurring)
func (r *DoctorRepository) GetSchedulesByDoctorID(doctorID int64) ([]models.DoctorSchedule, error) {
	query := `
	SELECT id, doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at
	FROM doctor_schedules
	WHERE doctor_id = $1
	ORDER BY day_of_week ASC
	`
	rows, err := r.db.Query(query, doctorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schedules []models.DoctorSchedule
	for rows.Next() {
		var s models.DoctorSchedule
		if err := rows.Scan(&s.ID, &s.DoctorID, &s.DayOfWeek, &s.StartTime, &s.EndTime, &s.IsAvailable, &s.SlotDurationMinutes, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		schedules = append(schedules, s)
	}
	return schedules, nil
}

func (r *DoctorRepository) UpsertSchedule(doctorID int64, s *models.DoctorSchedule) error {
	query := `
	INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	ON CONFLICT (doctor_id, day_of_week) DO UPDATE
	SET start_time = EXCLUDED.start_time,
	    end_time = EXCLUDED.end_time,
	    is_available = EXCLUDED.is_available,
	    slot_duration_minutes = EXCLUDED.slot_duration_minutes,
	    updated_at = EXCLUDED.updated_at
	`
	now := time.Now()
	_, err := r.db.Exec(query, doctorID, s.DayOfWeek, s.StartTime, s.EndTime, s.IsAvailable, s.SlotDurationMinutes, now, now)
	return err
}

// Doctor Sudden Schedule Changes / Emergency Leaves
func (r *DoctorRepository) GetScheduleChanges(activeOnly bool) ([]models.DoctorScheduleChange, error) {
	query := `
	SELECT c.id, c.doctor_id, d.name, c.change_type, TO_CHAR(c.effective_date, 'YYYY-MM-DD'), c.start_time, c.end_time, c.reason, c.status, c.created_at
	FROM doctor_schedule_changes c
	JOIN doctors d ON c.doctor_id = d.id
	`
	if activeOnly {
		query += " WHERE c.status = 'ACTIVE'"
	}
	query += " ORDER BY c.effective_date ASC, c.created_at DESC"

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var changes []models.DoctorScheduleChange
	for rows.Next() {
		var c models.DoctorScheduleChange
		if err := rows.Scan(&c.ID, &c.DoctorID, &c.DoctorName, &c.ChangeType, &c.EffectiveDate, &c.StartTime, &c.EndTime, &c.Reason, &c.Status, &c.CreatedAt); err != nil {
			return nil, err
		}
		changes = append(changes, c)
	}
	return changes, nil
}

func (r *DoctorRepository) CreateScheduleChange(c *models.DoctorScheduleChange) error {
	query := `
	INSERT INTO doctor_schedule_changes (doctor_id, change_type, effective_date, start_time, end_time, reason, status, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7)
	`
	_, err := r.db.Exec(query, c.DoctorID, c.ChangeType, c.EffectiveDate, c.StartTime, c.EndTime, c.Reason, time.Now())
	return err
}

func (r *DoctorRepository) AcknowledgeScheduleChange(id int64) error {
	_, err := r.db.Exec("UPDATE doctor_schedule_changes SET status = 'ACKNOWLEDGED' WHERE id = $1", id)
	return err
}

// Email Notifications Outbox
func (r *DoctorRepository) GetEmailNotifications() ([]models.EmailNotification, error) {
	query := `
	SELECT id, recipient_email, subject, body, status, created_at
	FROM email_notifications ORDER BY created_at DESC LIMIT 50
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.EmailNotification
	for rows.Next() {
		var n models.EmailNotification
		if err := rows.Scan(&n.ID, &n.RecipientEmail, &n.Subject, &n.Body, &n.Status, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

func (r *DoctorRepository) CreateEmailNotification(recipient, subject, body string) error {
	query := `
	INSERT INTO email_notifications (recipient_email, subject, body, status, created_at)
	VALUES ($1, $2, $3, 'SENT', $4)
	`
	_, err := r.db.Exec(query, recipient, subject, body, time.Now())
	return err
}

type AppointmentTypeRepository struct {
	db *sql.DB
}

func NewAppointmentTypeRepository(db *sql.DB) *AppointmentTypeRepository {
	return &AppointmentTypeRepository{db: db}
}

func (r *AppointmentTypeRepository) GetAll() ([]models.AppointmentType, error) {
	query := "SELECT id, name, description, default_duration_minutes, created_at FROM appointment_types ORDER BY id ASC"
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query appointment types: %w", err)
	}
	defer rows.Close()

	var types []models.AppointmentType
	for rows.Next() {
		var t models.AppointmentType
		if err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.DefaultDurationMinutes, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan appointment type: %w", err)
		}
		types = append(types, t)
	}
	return types, nil
}
