package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"medwizard-backend/internal/auth"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/repository"
)

type DoctorPortalHandler struct {
	apptRepo   *repository.AppointmentRepository
	doctorRepo *repository.DoctorRepository
}

func NewDoctorPortalHandler(apptRepo *repository.AppointmentRepository, doctorRepo *repository.DoctorRepository) *DoctorPortalHandler {
	return &DoctorPortalHandler{
		apptRepo:   apptRepo,
		doctorRepo: doctorRepo,
	}
}

func getDoctorIDFromClaims(c *gin.Context) (int64, bool) {
	claimsVal, exists := c.Get("claims")
	if !exists {
		return 0, false
	}
	claims := claimsVal.(*auth.Claims)
	if claims.DoctorID == nil || *claims.DoctorID == 0 {
		return 0, false
	}
	return *claims.DoctorID, true
}

// GetMyAppointments handles GET /api/v1/doctor/my-appointments
func (h *DoctorPortalHandler) GetMyAppointments(c *gin.Context) {
	doctorID, ok := getDoctorIDFromClaims(c)
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "No associated doctor profile for this account"})
		return
	}

	var params models.AppointmentFilterParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters: " + err.Error()})
		return
	}

	// Restrict strictly to this doctor
	params.DoctorID = doctorID

	result, err := h.apptRepo.GetAll(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch doctor appointments: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetMySchedule handles GET /api/v1/doctor/my-schedule
func (h *DoctorPortalHandler) GetMySchedule(c *gin.Context) {
	doctorID, ok := getDoctorIDFromClaims(c)
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "No associated doctor profile for this account"})
		return
	}

	schedules, err := h.doctorRepo.GetSchedulesByDoctorID(doctorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schedules)
}

// UpdateMySchedule handles PUT /api/v1/doctor/my-schedule
func (h *DoctorPortalHandler) UpdateMySchedule(c *gin.Context) {
	doctorID, ok := getDoctorIDFromClaims(c)
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "No associated doctor profile for this account"})
		return
	}

	var sched models.DoctorSchedule
	if err := c.ShouldBindJSON(&sched); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule payload: " + err.Error()})
		return
	}

	if err := h.doctorRepo.UpsertSchedule(doctorID, &sched); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Doctor schedule updated successfully"})
}

// ReportScheduleChange handles POST /api/v1/doctor/schedule-changes
func (h *DoctorPortalHandler) ReportScheduleChange(c *gin.Context) {
	doctorID, ok := getDoctorIDFromClaims(c)
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "No associated doctor profile for this account"})
		return
	}

	var req models.DoctorScheduleChange
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	req.DoctorID = doctorID
	if err := h.doctorRepo.CreateScheduleChange(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Schedule change broadcasted to administration successfully",
		"change":  req,
	})
}
