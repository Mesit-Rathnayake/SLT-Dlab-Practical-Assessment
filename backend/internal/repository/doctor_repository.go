package repository

import (
	"database/sql"
	"fmt"
	"medwizard-backend/internal/models"
)

type DoctorRepository struct {
	db *sql.DB
}

func NewDoctorRepository(db *sql.DB) *DoctorRepository {
	return &DoctorRepository{db: db}
}

func (r *DoctorRepository) GetAll() ([]models.Doctor, error) {
	query := "SELECT id, name, specialty, email, phone, room_number, created_at, updated_at FROM doctors ORDER BY name ASC"
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query doctors: %w", err)
	}
	defer rows.Close()

	var doctors []models.Doctor
	for rows.Next() {
		var d models.Doctor
		if err := rows.Scan(&d.ID, &d.Name, &d.Specialty, &d.Email, &d.Phone, &d.RoomNumber, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan doctor: %w", err)
		}
		doctors = append(doctors, d)
	}
	return doctors, nil
}

func (r *DoctorRepository) GetByID(id int64) (*models.Doctor, error) {
	query := "SELECT id, name, specialty, email, phone, room_number, created_at, updated_at FROM doctors WHERE id = $1"
	var d models.Doctor
	err := r.db.QueryRow(query, id).Scan(&d.ID, &d.Name, &d.Specialty, &d.Email, &d.Phone, &d.RoomNumber, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get doctor: %w", err)
	}
	return &d, nil
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
