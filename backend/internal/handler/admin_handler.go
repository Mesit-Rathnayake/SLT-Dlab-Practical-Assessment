package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/repository"
	"medwizard-backend/internal/service"
)

type AdminHandler struct {
	authService *service.AuthService
	doctorRepo  *repository.DoctorRepository
	userRepo    *repository.UserRepository
}

func NewAdminHandler(
	authService *service.AuthService,
	doctorRepo *repository.DoctorRepository,
	userRepo *repository.UserRepository,
) *AdminHandler {
	return &AdminHandler{
		authService: authService,
		doctorRepo:  doctorRepo,
		userRepo:    userRepo,
	}
}

// RegisterDoctor handles POST /api/v1/admin/doctors (Super Admin only)
func (h *AdminHandler) RegisterDoctor(c *gin.Context) {
	var req models.RegisterDoctorAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation error: " + err.Error()})
		return
	}

	doctor, user, tempPassword, err := h.authService.RegisterDoctorAccount(req)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":       "Doctor registered and account activated successfully",
		"doctor":        doctor,
		"user":          user,
		"temp_password": tempPassword,
	})
}

// UpdateDoctor handles PUT /api/v1/admin/doctors/:id
func (h *AdminHandler) UpdateDoctor(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
		return
	}

	var d models.Doctor
	if err := c.ShouldBindJSON(&d); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	updated, err := h.doctorRepo.Update(id, &d)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updated)
}

// GetDoctorSchedules handles GET /api/v1/admin/doctors/:id/schedules
func (h *AdminHandler) GetDoctorSchedules(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
		return
	}

	schedules, err := h.doctorRepo.GetSchedulesByDoctorID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schedules)
}

// UpdateDoctorSchedule handles PUT /api/v1/admin/doctors/:id/schedules
func (h *AdminHandler) UpdateDoctorSchedule(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
		return
	}

	var sched models.DoctorSchedule
	if err := c.ShouldBindJSON(&sched); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule payload: " + err.Error()})
		return
	}

	if err := h.doctorRepo.UpsertSchedule(id, &sched); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule updated successfully"})
}

// GetScheduleChanges handles GET /api/v1/admin/schedule-changes
func (h *AdminHandler) GetScheduleChanges(c *gin.Context) {
	changes, err := h.doctorRepo.GetScheduleChanges(false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, changes)
}

// AcknowledgeScheduleChange handles POST /api/v1/admin/schedule-changes/:id/ack
func (h *AdminHandler) AcknowledgeScheduleChange(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.doctorRepo.AcknowledgeScheduleChange(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule change acknowledged"})
}

// GetEmailNotifications handles GET /api/v1/admin/emails
func (h *AdminHandler) GetEmailNotifications(c *gin.Context) {
	emails, err := h.doctorRepo.GetEmailNotifications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, emails)
}

// GetUsers handles GET /api/v1/admin/users
func (h *AdminHandler) GetUsers(c *gin.Context) {
	users, err := h.userRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}
