package repository

import (
	"database/sql"
	"fmt"
	"medwizard-backend/internal/models"
	"strings"
	"time"
)

type AppointmentRepository struct {
	db *sql.DB
}

func NewAppointmentRepository(db *sql.DB) *AppointmentRepository {
	return &AppointmentRepository{db: db}
}

// ListAppointmentsResult wraps paginated results with metadata
type ListAppointmentsResult struct {
	Appointments []models.Appointment `json:"appointments"`
	TotalCount   int64                `json:"total_count"`
	Page         int                  `json:"page"`
	Limit        int                  `json:"limit"`
	TotalPages   int                  `json:"total_pages"`
}

// GetAll filters, searches, and paginates appointments
func (r *AppointmentRepository) GetAll(params models.AppointmentFilterParams) (*ListAppointmentsResult, error) {
	baseQuery := `
	FROM appointments a
	JOIN patients p ON a.patient_id = p.id
	JOIN doctors d ON a.doctor_id = d.id
	JOIN appointment_types t ON a.appointment_type_id = t.id
	WHERE 1=1
	`
	var whereClauses []string
	var args []interface{}
	argIdx := 1

	if strings.TrimSpace(params.Search) != "" {
		searchTerm := "%" + strings.ToLower(strings.TrimSpace(params.Search)) + "%"
		whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(p.name) LIKE $%d OR LOWER(COALESCE(p.nic, '')) LIKE $%d OR LOWER(d.name) LIKE $%d OR LOWER(a.notes) LIKE $%d OR LOWER(t.name) LIKE $%d)", argIdx, argIdx, argIdx, argIdx, argIdx))
		args = append(args, searchTerm)
		argIdx++
	}

	if strings.TrimSpace(params.Status) != "" && strings.ToLower(params.Status) != "all" {
		whereClauses = append(whereClauses, fmt.Sprintf("LOWER(a.status) = LOWER($%d)", argIdx))
		args = append(args, strings.TrimSpace(params.Status))
		argIdx++
	}

	if params.DoctorID > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("a.doctor_id = $%d", argIdx))
		args = append(args, params.DoctorID)
		argIdx++
	}

	if params.TypeID > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("a.appointment_type_id = $%d", argIdx))
		args = append(args, params.TypeID)
		argIdx++
	}

	if strings.TrimSpace(params.StartDate) != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("a.appointment_date_time >= $%d", argIdx))
		args = append(args, strings.TrimSpace(params.StartDate))
		argIdx++
	}

	if strings.TrimSpace(params.EndDate) != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("a.appointment_date_time <= $%d", argIdx))
		args = append(args, strings.TrimSpace(params.EndDate))
		argIdx++
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " AND " + strings.Join(whereClauses, " AND ")
	}

	// Count total matching records
	countQuery := "SELECT COUNT(*) " + baseQuery + whereSQL
	var totalCount int64
	if err := r.db.QueryRow(countQuery, args...).Scan(&totalCount); err != nil {
		return nil, fmt.Errorf("failed to count appointments: %w", err)
	}

	// Pagination defaults
	page := params.Page
	if page < 1 {
		page = 1
	}
	limit := params.Limit
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Ordering
	orderBy := "a.appointment_date_time DESC"
	switch strings.ToLower(params.SortBy) {
	case "date":
		if strings.ToLower(params.SortOrder) == "asc" {
			orderBy = "a.appointment_date_time ASC"
		} else {
			orderBy = "a.appointment_date_time DESC"
		}
	case "patient":
		if strings.ToLower(params.SortOrder) == "desc" {
			orderBy = "p.name DESC"
		} else {
			orderBy = "p.name ASC"
		}
	case "doctor":
		if strings.ToLower(params.SortOrder) == "desc" {
			orderBy = "d.name DESC"
		} else {
			orderBy = "d.name ASC"
		}
	case "status":
		orderBy = "a.status ASC, a.appointment_date_time DESC"
	}

	selectQuery := fmt.Sprintf(`
	SELECT 
		a.id, a.patient_id, a.doctor_id, a.appointment_type_id, a.appointment_date_time, a.duration_minutes, a.status, a.notes, a.created_at, a.updated_at,
		p.id, COALESCE(p.nic, ''), p.name, p.email, p.phone, TO_CHAR(p.date_of_birth, 'YYYY-MM-DD'), p.gender, p.created_at, p.updated_at,
		d.id, d.name, d.specialty, d.email, d.phone, d.room_number, d.created_at, d.updated_at,
		t.id, t.name, t.description, t.default_duration_minutes, t.created_at
	%%s %%s
	ORDER BY %%s
	LIMIT $%d OFFSET $%d
	`, argIdx, argIdx+1)
	selectQuery = fmt.Sprintf(selectQuery, baseQuery, whereSQL, orderBy)

	args = append(args, limit, offset)

	rows, err := r.db.Query(selectQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch appointments: %w", err)
	}
	defer rows.Close()

	var appointments []models.Appointment
	for rows.Next() {
		var a models.Appointment
		var p models.Patient
		var d models.Doctor
		var t models.AppointmentType
		var patientDOB sql.NullString

		err := rows.Scan(
			&a.ID, &a.PatientID, &a.DoctorID, &a.AppointmentTypeID, &a.AppointmentDateTime, &a.DurationMinutes, &a.Status, &a.Notes, &a.CreatedAt, &a.UpdatedAt,
			&p.ID, &p.NIC, &p.Name, &p.Email, &p.Phone, &patientDOB, &p.Gender, &p.CreatedAt, &p.UpdatedAt,
			&d.ID, &d.Name, &d.Specialty, &d.Email, &d.Phone, &d.RoomNumber, &d.CreatedAt, &d.UpdatedAt,
			&t.ID, &t.Name, &t.Description, &t.DefaultDurationMinutes, &t.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan appointment row: %w", err)
		}

		if patientDOB.Valid {
			p.DateOfBirth = &patientDOB.String
		}

		a.Patient = &p
		a.Doctor = &d
		a.AppointmentType = &t
		appointments = append(appointments, a)
	}

	totalPages := int((totalCount + int64(limit) - 1) / int64(limit))
	if totalPages == 0 {
		totalPages = 1
	}

	return &ListAppointmentsResult{
		Appointments: appointments,
		TotalCount:   totalCount,
		Page:         page,
		Limit:        limit,
		TotalPages:   totalPages,
	}, nil
}

// GetByID fetches a single appointment with full relational information
func (r *AppointmentRepository) GetByID(id int64) (*models.Appointment, error) {
	query := `
	SELECT 
		a.id, a.patient_id, a.doctor_id, a.appointment_type_id, a.appointment_date_time, a.duration_minutes, a.status, a.notes, a.created_at, a.updated_at,
		p.id, COALESCE(p.nic, ''), p.name, p.email, p.phone, TO_CHAR(p.date_of_birth, 'YYYY-MM-DD'), p.gender, p.created_at, p.updated_at,
		d.id, d.name, d.specialty, d.email, d.phone, d.room_number, d.created_at, d.updated_at,
		t.id, t.name, t.description, t.default_duration_minutes, t.created_at
	FROM appointments a
	JOIN patients p ON a.patient_id = p.id
	JOIN doctors d ON a.doctor_id = d.id
	JOIN appointment_types t ON a.appointment_type_id = t.id
	WHERE a.id = $1
	`

	var a models.Appointment
	var p models.Patient
	var d models.Doctor
	var t models.AppointmentType
	var patientDOB sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&a.ID, &a.PatientID, &a.DoctorID, &a.AppointmentTypeID, &a.AppointmentDateTime, &a.DurationMinutes, &a.Status, &a.Notes, &a.CreatedAt, &a.UpdatedAt,
		&p.ID, &p.NIC, &p.Name, &p.Email, &p.Phone, &patientDOB, &p.Gender, &p.CreatedAt, &p.UpdatedAt,
		&d.ID, &d.Name, &d.Specialty, &d.Email, &d.Phone, &d.RoomNumber, &d.CreatedAt, &d.UpdatedAt,
		&t.ID, &t.Name, &t.Description, &t.DefaultDurationMinutes, &t.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get appointment: %w", err)
	}

	if patientDOB.Valid {
		p.DateOfBirth = &patientDOB.String
	}
	a.Patient = &p
	a.Doctor = &d
	a.AppointmentType = &t
	return &a, nil
}

// Create inserts a new appointment record
func (r *AppointmentRepository) Create(a *models.Appointment) (*models.Appointment, error) {
	query := `
	INSERT INTO appointments (patient_id, doctor_id, appointment_type_id, appointment_date_time, duration_minutes, status, notes, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	RETURNING id, created_at, updated_at
	`
	now := time.Now()
	err := r.db.QueryRow(
		query,
		a.PatientID,
		a.DoctorID,
		a.AppointmentTypeID,
		a.AppointmentDateTime,
		a.DurationMinutes,
		a.Status,
		a.Notes,
		now,
		now,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to insert appointment: %w", err)
	}

	return r.GetByID(a.ID)
}

// Update modifies an existing appointment
func (r *AppointmentRepository) Update(id int64, a *models.Appointment) (*models.Appointment, error) {
	query := `
	UPDATE appointments
	SET patient_id = $1, doctor_id = $2, appointment_type_id = $3, appointment_date_time = $4, duration_minutes = $5, status = $6, notes = $7, updated_at = $8
	WHERE id = $9
	`
	now := time.Now()
	res, err := r.db.Exec(query, a.PatientID, a.DoctorID, a.AppointmentTypeID, a.AppointmentDateTime, a.DurationMinutes, a.Status, a.Notes, now, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update appointment: %w", err)
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return nil, sql.ErrNoRows
	}

	return r.GetByID(id)
}

// Delete removes an appointment by ID
func (r *AppointmentRepository) Delete(id int64) error {
	res, err := r.db.Exec("DELETE FROM appointments WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete appointment: %w", err)
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// CheckDoctorConflict verifies if a doctor has an overlapping scheduled appointment
func (r *AppointmentRepository) CheckDoctorConflict(doctorID int64, startTime time.Time, durationMinutes int, excludeAppointmentID int64) (bool, error) {
	endTime := startTime.Add(time.Duration(durationMinutes) * time.Minute)

	query := `
	SELECT COUNT(*) FROM appointments
	WHERE doctor_id = $1
	  AND status IN ('Scheduled', 'In-Progress')
	  AND id != $2
	  AND (
	    (appointment_date_time <= $3 AND (appointment_date_time + (duration_minutes || ' minutes')::interval) > $3)
	    OR
	    (appointment_date_time < $4 AND (appointment_date_time + (duration_minutes || ' minutes')::interval) >= $4)
	    OR
	    (appointment_date_time >= $3 AND (appointment_date_time + (duration_minutes || ' minutes')::interval) <= $4)
	  )
	`
	var count int
	err := r.db.QueryRow(query, doctorID, excludeAppointmentID, startTime, endTime).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetDashboardStats aggregates summary statistics
func (r *AppointmentRepository) GetDashboardStats() (*models.DashboardStats, error) {
	stats := &models.DashboardStats{}

	_ = r.db.QueryRow("SELECT COUNT(*) FROM appointments").Scan(&stats.TotalAppointments)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date_time) = CURRENT_DATE").Scan(&stats.TodayAppointments)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM appointments WHERE status = 'Scheduled'").Scan(&stats.ScheduledCount)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM appointments WHERE status = 'In-Progress'").Scan(&stats.InProgressCount)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM appointments WHERE status = 'Completed'").Scan(&stats.CompletedCount)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM appointments WHERE status = 'Cancelled'").Scan(&stats.CancelledCount)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&stats.TotalPatients)
	_ = r.db.QueryRow("SELECT COUNT(*) FROM doctors").Scan(&stats.TotalDoctors)

	return stats, nil
}
