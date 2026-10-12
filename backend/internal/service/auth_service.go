package service

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"medwizard-backend/internal/auth"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailExists        = errors.New("a user with this email address already exists")
	ErrWeakPassword       = errors.New("password must be at least 8 characters long")
)

type AuthService struct {
	userRepo   *repository.UserRepository
	doctorRepo *repository.DoctorRepository
}

func NewAuthService(userRepo *repository.UserRepository, doctorRepo *repository.DoctorRepository) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		doctorRepo: doctorRepo,
	}
}

func (s *AuthService) Login(email, password string) (*models.LoginResponse, error) {
	user, err := s.userRepo.GetByEmail(strings.TrimSpace(email))
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if !auth.CheckPasswordHash(password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	token, err := auth.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.LoginResponse{
		Token:              token,
		User:               *user,
		MustChangePassword: user.MustChangePassword,
	}, nil
}

func (s *AuthService) ChangePassword(userID int64, currentPassword, newPassword string) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil || user == nil {
		return ErrUserNotFound
	}

	if !auth.CheckPasswordHash(currentPassword, user.PasswordHash) {
		return errors.New("current password does not match")
	}

	if len(strings.TrimSpace(newPassword)) < 8 {
		return ErrWeakPassword
	}

	newHash, err := auth.HashPassword(strings.TrimSpace(newPassword))
	if err != nil {
		return err
	}

	return s.userRepo.UpdatePassword(userID, newHash)
}

func generateTempPassword() string {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$"
	length := 10
	result := make([]byte, length)
	for i := range result {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		result[i] = charset[num.Int64()]
	}
	return "MedDoc" + string(result) + "!"
}

func (s *AuthService) RegisterDoctorAccount(req models.RegisterDoctorAccountRequest) (*models.Doctor, *models.User, string, error) {
	// Check existing email
	existing, _ := s.userRepo.GetByEmail(req.Email)
	if existing != nil {
		return nil, nil, "", ErrEmailExists
	}

	if strings.TrimSpace(req.SLMCRegNo) == "" {
		return nil, nil, "", errors.New("SLMC Registration Number is required for medical practitioners")
	}

	tempPassword := req.TempPassword
	if strings.TrimSpace(tempPassword) == "" {
		tempPassword = generateTempPassword()
	}

	// 1. Create Doctor
	doctor := &models.Doctor{
		Name:       strings.TrimSpace(req.Name),
		Specialty:  strings.TrimSpace(req.Specialty),
		Email:      strings.TrimSpace(req.Email),
		Phone:      strings.TrimSpace(req.Phone),
		RoomNumber: strings.TrimSpace(req.RoomNumber),
		SLMCRegNo:  strings.TrimSpace(req.SLMCRegNo),
		Status:     "Active",
		Bio:        strings.TrimSpace(req.Bio),
	}
	if doctor.RoomNumber == "" {
		doctor.RoomNumber = "Room 101"
	}

	createdDoctor, err := s.doctorRepo.Create(doctor)
	if err != nil {
		return nil, nil, "", fmt.Errorf("failed to create doctor profile: %w", err)
	}

	// 2. Hash temp password & Create User Account
	hash, err := bcrypt.GenerateFromPassword([]byte(tempPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, "", err
	}

	user := &models.User{
		Name:               createdDoctor.Name,
		Email:              createdDoctor.Email,
		PasswordHash:       string(hash),
		Role:               models.RoleDoctor,
		DoctorID:           &createdDoctor.ID,
		MustChangePassword: true,
	}

	createdUser, err := s.userRepo.Create(user)
	if err != nil {
		return nil, nil, "", fmt.Errorf("failed to create doctor login account: %w", err)
	}

	// 3. Create Default Mon-Fri Schedules
	for day := 1; day <= 5; day++ {
		_ = s.doctorRepo.UpsertSchedule(createdDoctor.ID, &models.DoctorSchedule{
			DayOfWeek:           day,
			StartTime:           "09:00",
			EndTime:             "17:00",
			IsAvailable:         true,
			SlotDurationMinutes: 30,
		})
	}

	// 4. Generate Welcome & Temporary Password Email Notification
	emailSubject := "Welcome to Medical Wizard — Doctor Account Activation & Credentials"
	emailBody := fmt.Sprintf(`Dear %s,

Your medical practitioner account has been registered with Medical Wizard Hospital Administration.

Clinical Account Details:
- Doctor Name: %s
- Medical Specialty: %s
- SLMC Registration No: %s
- Registered Email: %s
- Temporary Password: %s

Please access the Medical Wizard portal at http://localhost:5173. Upon initial login, you will be required to set your permanent secure password before managing your clinical appointments.

Best regards,
Super Administration
Medical Wizard Clinical Operations`,
		createdDoctor.Name,
		createdDoctor.Name,
		createdDoctor.Specialty,
		createdDoctor.SLMCRegNo,
		createdDoctor.Email,
		tempPassword,
	)

	_ = s.doctorRepo.CreateEmailNotification(createdDoctor.Email, emailSubject, emailBody)

	return createdDoctor, createdUser, tempPassword, nil
}
