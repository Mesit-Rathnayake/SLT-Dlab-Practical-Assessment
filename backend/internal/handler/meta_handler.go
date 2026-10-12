package handler

import (
	"net/http"

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

func (h *PatientHandler) CreatePatient(c *gin.Context) {
	var p models.Patient
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient data: " + err.Error()})
		return
	}

	if p.Name == "" || p.Email == "" || p.Phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, email, and phone are required"})
		return
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
