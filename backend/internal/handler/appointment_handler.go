package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/service"
)

type AppointmentHandler struct {
	apptService *service.AppointmentService
}

func NewAppointmentHandler(apptService *service.AppointmentService) *AppointmentHandler {
	return &AppointmentHandler{apptService: apptService}
}

// GetAppointments handles GET /api/v1/appointments
func (h *AppointmentHandler) GetAppointments(c *gin.Context) {
	var params models.AppointmentFilterParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters: " + err.Error()})
		return
	}

	result, err := h.apptService.ListAppointments(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetAppointmentByID handles GET /api/v1/appointments/:id
func (h *AppointmentHandler) GetAppointmentByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	appt, err := h.apptService.GetAppointmentByID(id)
	if err != nil {
		if errors.Is(err, service.ErrAppointmentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, appt)
}

// CreateAppointment handles POST /api/v1/appointments
func (h *AppointmentHandler) CreateAppointment(c *gin.Context) {
	var req models.CreateAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed: " + err.Error()})
		return
	}

	created, err := h.apptService.CreateAppointment(req)
	if err != nil {
		if errors.Is(err, service.ErrDoctorConflict) || errors.Is(err, service.ErrInvalidStatus) || errors.Is(err, service.ErrInvalidDateTime) || errors.Is(err, service.ErrMissingPatient) {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, created)
}

// UpdateAppointment handles PUT /api/v1/appointments/:id
func (h *AppointmentHandler) UpdateAppointment(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	var req models.UpdateAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed: " + err.Error()})
		return
	}

	updated, err := h.apptService.UpdateAppointment(id, req)
	if err != nil {
		if errors.Is(err, service.ErrAppointmentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
			return
		}
		if errors.Is(err, service.ErrDoctorConflict) || errors.Is(err, service.ErrInvalidStatus) || errors.Is(err, service.ErrInvalidDateTime) {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updated)
}

// DeleteAppointment handles DELETE /api/v1/appointments/:id
func (h *AppointmentHandler) DeleteAppointment(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	if err := h.apptService.DeleteAppointment(id); err != nil {
		if errors.Is(err, service.ErrAppointmentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully", "id": id})
}

// GetDashboardStats handles GET /api/v1/analytics/stats
func (h *AppointmentHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.apptService.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
