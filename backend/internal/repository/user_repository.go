package repository

import (
	"database/sql"
	"fmt"
	"medwizard-backend/internal/models"
	"time"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	query := `
	SELECT u.id, u.name, u.email, u.password_hash, u.role, u.doctor_id, u.must_change_password, u.created_at, u.updated_at,
	       d.id, d.name, d.specialty, d.email, d.phone, d.room_number, d.slmc_reg_no, d.status, d.bio
	FROM users u
	LEFT JOIN doctors d ON u.doctor_id = d.id
	WHERE LOWER(u.email) = LOWER($1)
	`
	var u models.User
	var docID sql.NullInt64
	var d models.Doctor
	var dID sql.NullInt64
	var dName, dSpec, dEmail, dPhone, dRoom, dSLMC, dStatus, dBio sql.NullString

	err := r.db.QueryRow(query, email).Scan(
		&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &docID, &u.MustChangePassword, &u.CreatedAt, &u.UpdatedAt,
		&dID, &dName, &dSpec, &dEmail, &dPhone, &dRoom, &dSLMC, &dStatus, &dBio,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	if docID.Valid {
		u.DoctorID = &docID.Int64
	}
	if dID.Valid {
		d.ID = dID.Int64
		d.Name = dName.String
		d.Specialty = dSpec.String
		d.Email = dEmail.String
		d.Phone = dPhone.String
		d.RoomNumber = dRoom.String
		d.SLMCRegNo = dSLMC.String
		d.Status = dStatus.String
		d.Bio = dBio.String
		u.Doctor = &d
	}

	return &u, nil
}

func (r *UserRepository) GetByID(id int64) (*models.User, error) {
	query := `
	SELECT u.id, u.name, u.email, u.password_hash, u.role, u.doctor_id, u.must_change_password, u.created_at, u.updated_at,
	       d.id, d.name, d.specialty, d.email, d.phone, d.room_number, d.slmc_reg_no, d.status, d.bio
	FROM users u
	LEFT JOIN doctors d ON u.doctor_id = d.id
	WHERE u.id = $1
	`
	var u models.User
	var docID sql.NullInt64
	var d models.Doctor
	var dID sql.NullInt64
	var dName, dSpec, dEmail, dPhone, dRoom, dSLMC, dStatus, dBio sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &docID, &u.MustChangePassword, &u.CreatedAt, &u.UpdatedAt,
		&dID, &dName, &dSpec, &dEmail, &dPhone, &dRoom, &dSLMC, &dStatus, &dBio,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}

	if docID.Valid {
		u.DoctorID = &docID.Int64
	}
	if dID.Valid {
		d.ID = dID.Int64
		d.Name = dName.String
		d.Specialty = dSpec.String
		d.Email = dEmail.String
		d.Phone = dPhone.String
		d.RoomNumber = dRoom.String
		d.SLMCRegNo = dSLMC.String
		d.Status = dStatus.String
		d.Bio = dBio.String
		u.Doctor = &d
	}

	return &u, nil
}

func (r *UserRepository) Create(u *models.User) (*models.User, error) {
	query := `
	INSERT INTO users (name, email, password_hash, role, doctor_id, must_change_password, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING id, created_at, updated_at
	`
	now := time.Now()
	err := r.db.QueryRow(query, u.Name, u.Email, u.PasswordHash, u.Role, u.DoctorID, u.MustChangePassword, now, now).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}
	return u, nil
}

func (r *UserRepository) UpdatePassword(id int64, newHash string) error {
	query := `
	UPDATE users
	SET password_hash = $1, must_change_password = FALSE, updated_at = $2
	WHERE id = $3
	`
	_, err := r.db.Exec(query, newHash, time.Now(), id)
	return err
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	query := `
	SELECT id, name, email, role, doctor_id, must_change_password, created_at, updated_at
	FROM users ORDER BY id ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		var docID sql.NullInt64
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &docID, &u.MustChangePassword, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		if docID.Valid {
			u.DoctorID = &docID.Int64
		}
		users = append(users, u)
	}
	return users, nil
}
