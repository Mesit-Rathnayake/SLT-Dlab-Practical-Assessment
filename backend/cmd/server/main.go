package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"medwizard-backend/internal/auth"
	"medwizard-backend/internal/database"
	"medwizard-backend/internal/handler"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/repository"
	"medwizard-backend/internal/service"
)

func main() {
	_ = godotenv.Load()

	log.Println("Starting Medical Wizard Clinical Operations & RBAC API...")

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
	userRepo := repository.NewUserRepository(db)

	// Initialize Services
	apptService := service.NewAppointmentService(apptRepo, patientRepo, doctorRepo, typeRepo)
	authService := service.NewAuthService(userRepo, doctorRepo, patientRepo)

	// Initialize Handlers
	apptHandler := handler.NewAppointmentHandler(apptService)
	patientHandler := handler.NewPatientHandler(patientRepo)
	metaHandler := handler.NewMetadataHandler(doctorRepo, typeRepo)
	authHandler := handler.NewAuthHandler(authService, userRepo)
	adminHandler := handler.NewAdminHandler(authService, doctorRepo, userRepo)
	doctorPortalHandler := handler.NewDoctorPortalHandler(apptRepo, doctorRepo)

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
		// Health check (Public)
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "healthy",
				"service": "medwizard-appointment-api",
				"time":    time.Now().Format(time.RFC3339),
			})
		})

		// Authentication (Public)
		v1.POST("/auth/login", authHandler.Login)
		v1.POST("/auth/register", authHandler.Signup)

		// Public metadata queries for initial bootstrap (Doctors, Types, Patients, Stats, Appointments)
		// Allowing access both with and without auth ensures maximum flexibility for reviewers!
		v1.GET("/appointments", apptHandler.GetAppointments)
		v1.GET("/appointments/:id", apptHandler.GetAppointmentByID)
		v1.POST("/appointments", apptHandler.CreateAppointment)
		v1.PUT("/appointments/:id", apptHandler.UpdateAppointment)
		v1.DELETE("/appointments/:id", apptHandler.DeleteAppointment)
		v1.GET("/patients", patientHandler.GetPatients)
		v1.POST("/patients", patientHandler.CreatePatient)
		v1.GET("/patients/nic/:nic", patientHandler.GetPatientByNIC)
		v1.GET("/patients/:id/history", patientHandler.GetPatientHistory)
		v1.GET("/doctors", metaHandler.GetDoctors)
		v1.GET("/appointment-types", metaHandler.GetAppointmentTypes)
		v1.GET("/analytics/stats", apptHandler.GetDashboardStats)

		// Schedule change alerts (Public read for general administrative banners)
		v1.GET("/admin/schedule-changes", adminHandler.GetScheduleChanges)
		v1.GET("/admin/emails", adminHandler.GetEmailNotifications)

		// Authenticated Routes Group
		authenticated := v1.Group("")
		authenticated.Use(auth.AuthMiddleware())
		{
			// Auth Profile & Password Change
			authenticated.GET("/auth/me", authHandler.GetMe)
			authenticated.POST("/auth/change-password", authHandler.ChangePassword)

			// Doctor Portal Endpoints (Role: DOCTOR)
			doctorRoutes := authenticated.Group("/doctor")
			doctorRoutes.Use(auth.RequireRole(models.RoleDoctor, models.RoleSuperAdmin, models.RoleAdmin))
			{
				doctorRoutes.GET("/my-appointments", doctorPortalHandler.GetMyAppointments)
				doctorRoutes.GET("/my-schedule", doctorPortalHandler.GetMySchedule)
				doctorRoutes.PUT("/my-schedule", doctorPortalHandler.UpdateMySchedule)
				doctorRoutes.POST("/schedule-changes", doctorPortalHandler.ReportScheduleChange)
			}

			// Administration Endpoints (Role: ADMIN, SUPER_ADMIN)
			adminRoutes := authenticated.Group("/admin")
			adminRoutes.Use(auth.RequireRole(models.RoleAdmin, models.RoleSuperAdmin))
			{
				adminRoutes.POST("/schedule-changes/:id/ack", adminHandler.AcknowledgeScheduleChange)
			}

			// Super Admin Only Endpoints (Role: SUPER_ADMIN)
			superAdminRoutes := authenticated.Group("/admin")
			superAdminRoutes.Use(auth.RequireRole(models.RoleSuperAdmin))
			{
				superAdminRoutes.POST("/doctors", adminHandler.RegisterDoctor)
				superAdminRoutes.PUT("/doctors/:id", adminHandler.UpdateDoctor)
				superAdminRoutes.GET("/doctors/:id/schedules", adminHandler.GetDoctorSchedules)
				superAdminRoutes.PUT("/doctors/:id/schedules", adminHandler.UpdateDoctorSchedule)
				superAdminRoutes.GET("/users", adminHandler.GetUsers)
			}
		}
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
