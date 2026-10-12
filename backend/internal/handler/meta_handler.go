package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/repository"
)

type PatientHandler struct {
	patientRepo *repository.PatientRepository
}

func NewPatientHandler(patientRepo *repository.PatientRepository) *PatientHandler {
	return &PatientHandler{patientRepo: patientRepo}
}

func (h *PatientHandler) GetPatients(c *gin.Context) {
	search := c.Query("search")
	patients, err := h.patientRepo.GetAll(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get patients: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, patients)
}

func (h *PatientHandler) GetPatientByNIC(c *gin.Context) {
	nic := c.Param("nic")
	patient, err := h.patientRepo.GetByNIC(nic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query patient: " + err.Error()})
		return
	}
	if patient == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No patient found with NIC: " + nic})
		return
	}

	appts, err := h.patientRepo.GetPatientAppointments(patient.ID)
	if err != nil {
		appts = []models.Appointment{}
	}

	c.JSON(http.StatusOK, models.PatientHistoryResponse{
		Patient:      *patient,
		Appointments: appts,
	})
}

func (h *PatientHandler) GetPatientHistory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	patient, err := h.patientRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query patient: " + err.Error()})
		return
	}
	if patient == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	appts, err := h.patientRepo.GetPatientAppointments(patient.ID)
	if err != nil {
		appts = []models.Appointment{}
	}

	c.JSON(http.StatusOK, models.PatientHistoryResponse{
		Patient:      *patient,
		Appointments: appts,
	})
}

func (h *PatientHandler) CreatePatient(c *gin.Context) {
	var p models.Patient
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient data: " + err.Error()})
		return
	}

	if strings.TrimSpace(p.NIC) == "" || strings.TrimSpace(p.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "NIC number and Full Legal Name are required"})
		return
	}

	// Check if NIC already registered
	existing, _ := h.patientRepo.GetByNIC(p.NIC)
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "A patient record with this NIC already exists", "patient": existing})
		return
	}

	if p.Email == "" {
		p.Email = strings.ToLower(strings.ReplaceAll(p.Name, " ", ".")) + fmt.Sprintf(".%d@medwizard.local", time.Now().Unix())
	}
	if p.Phone == "" {
		p.Phone = "Not provided"
	}
	if p.Gender == "" {
		p.Gender = "Unspecified"
	}

	created, err := h.patientRepo.Create(&p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, created)
}

type MetadataHandler struct {
	doctorRepo *repository.DoctorRepository
	typeRepo   *repository.AppointmentTypeRepository
}

func NewMetadataHandler(doctorRepo *repository.DoctorRepository, typeRepo *repository.AppointmentTypeRepository) *MetadataHandler {
	return &MetadataHandler{doctorRepo: doctorRepo, typeRepo: typeRepo}
}

func (h *MetadataHandler) GetDoctors(c *gin.Context) {
	doctors, err := h.doctorRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get doctors: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, doctors)
}

func (h *MetadataHandler) GetAppointmentTypes(c *gin.Context) {
	types, err := h.typeRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get appointment types: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}
