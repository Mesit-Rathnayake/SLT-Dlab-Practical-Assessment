package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"medwizard-backend/internal/database"
	"medwizard-backend/internal/handler"
	"medwizard-backend/internal/repository"
	"medwizard-backend/internal/service"
)

func main() {
	// Attempt to load .env file if present
	_ = godotenv.Load()

	log.Println("Starting Medical Wizard Appointment Management API...")

	// Connect to PostgreSQL database and auto-run migrations/seeding
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Fatal: Database connection failure: %v", err)
	}
	defer db.Close()

	// Initialize Repositories
	apptRepo := repository.NewAppointmentRepository(db)
	patientRepo := repository.NewPatientRepository(db)
	doctorRepo := repository.NewDoctorRepository(db)
	typeRepo := repository.NewAppointmentTypeRepository(db)

	// Initialize Services
	apptService := service.NewAppointmentService(apptRepo, patientRepo, doctorRepo, typeRepo)

	// Initialize Handlers
	apptHandler := handler.NewAppointmentHandler(apptService)
	patientHandler := handler.NewPatientHandler(patientRepo)
	metaHandler := handler.NewMetadataHandler(doctorRepo, typeRepo)

	// Setup Gin Engine
	r := gin.Default()

	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API Routing
	v1 := r.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "healthy",
				"service": "medwizard-appointment-api",
				"time":    time.Now().Format(time.RFC3339),
			})
		})

		// Appointments CRUD & search/filter
		v1.GET("/appointments", apptHandler.GetAppointments)
		v1.GET("/appointments/:id", apptHandler.GetAppointmentByID)
		v1.POST("/appointments", apptHandler.CreateAppointment)
		v1.PUT("/appointments/:id", apptHandler.UpdateAppointment)
		v1.DELETE("/appointments/:id", apptHandler.DeleteAppointment)

		// Metadata & Relations
		v1.GET("/patients", patientHandler.GetPatients)
		v1.POST("/patients", patientHandler.CreatePatient)
		v1.GET("/doctors", metaHandler.GetDoctors)
		v1.GET("/appointment-types", metaHandler.GetAppointmentTypes)

		// Analytics & KPI stats
		v1.GET("/analytics/stats", apptHandler.GetDashboardStats)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on port :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}
}
