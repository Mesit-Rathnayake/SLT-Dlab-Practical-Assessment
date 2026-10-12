package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// ConnectDB establishes a connection pool to the PostgreSQL database with retries
func ConnectDB() (*sql.DB, error) {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5433"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "meduser"
	}
	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" {
		dbPass = "medpassword"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "medwizard_db"
	}
	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		sslMode = "disable"
	}

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", dbUser, dbPass, dbHost, dbPort, dbName, sslMode)

	var db *sql.DB
	var err error

	// Retry connection for up to 30 seconds to allow container initialization
	for i := 1; i <= 10; i++ {
		db, err = sql.Open("pgx", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Printf("Successfully connected to PostgreSQL database at %s:%s/%s", dbHost, dbPort, dbName)
				break
			}
		}
		log.Printf("Waiting for database connection (attempt %d/10)... error: %v", i, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Run migrations and seed data
	if err := RunMigrations(db); err != nil {
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	return db, nil
}

// RunMigrations executes initial DDL schema and seeds fictional test data if empty
func RunMigrations(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS patients (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(150) NOT NULL,
		email VARCHAR(150) NOT NULL UNIQUE,
		phone VARCHAR(50) NOT NULL,
		date_of_birth DATE,
		gender VARCHAR(20) DEFAULT 'Unspecified',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS doctors (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(150) NOT NULL,
		specialty VARCHAR(100) NOT NULL,
		email VARCHAR(150) NOT NULL UNIQUE,
		phone VARCHAR(50) NOT NULL,
		room_number VARCHAR(30) DEFAULT 'Room 101',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS appointment_types (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL UNIQUE,
		description TEXT,
		default_duration_minutes INT DEFAULT 30,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS appointments (
		id BIGSERIAL PRIMARY KEY,
		patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
		doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
		appointment_type_id BIGINT NOT NULL REFERENCES appointment_types(id) ON DELETE RESTRICT,
		appointment_date_time TIMESTAMPTZ NOT NULL,
		duration_minutes INT DEFAULT 30,
		status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
		notes TEXT DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
	CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
	CREATE INDEX IF NOT EXISTS idx_appointments_type_id ON appointments(appointment_type_id);
	CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date_time);
	CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
	`

	if _, err := db.Exec(schema); err != nil {
		return fmt.Errorf("failed to apply database schema: %w", err)
	}

	return SeedData(db)
}

// SeedData inserts fictional test data only if tables are currently empty
func SeedData(db *sql.DB) error {
	var doctorCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM doctors").Scan(&doctorCount); err != nil {
		return err
	}

	if doctorCount == 0 {
		log.Println("Seeding fictional doctors...")
		doctorsSQL := `
		INSERT INTO doctors (name, specialty, email, phone, room_number) VALUES
		('Dr. Eleanor Vance', 'Cardiology', 'eleanor.vance@medwizard.health', '+1 (555) 234-5678', 'Suite 402'),
		('Dr. Marcus Chen', 'General Practice', 'marcus.chen@medwizard.health', '+1 (555) 345-6789', 'Suite 101'),
		('Dr. Sarah Jenkins', 'Pediatrics', 'sarah.jenkins@medwizard.health', '+1 (555) 456-7890', 'Suite 205'),
		('Dr. David Kim', 'Dermatology', 'david.kim@medwizard.health', '+1 (555) 567-8901', 'Suite 310'),
		('Dr. Aisha Patel', 'Neurology', 'aisha.patel@medwizard.health', '+1 (555) 678-9012', 'Suite 512'),
		('Dr. Robert Sterling', 'Orthopedics', 'robert.sterling@medwizard.health', '+1 (555) 789-0123', 'Suite 118');
		`
		if _, err := db.Exec(doctorsSQL); err != nil {
			return err
		}
	}

	var typeCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM appointment_types").Scan(&typeCount); err != nil {
		return err
	}

	if typeCount == 0 {
		log.Println("Seeding appointment types...")
		typesSQL := `
		INSERT INTO appointment_types (name, description, default_duration_minutes) VALUES
		('General Consultation', 'Standard diagnostic consultation for general health evaluation', 30),
		('Follow-up Review', 'Post-treatment evaluation or medication monitoring review', 20),
		('Routine Checkup', 'Annual preventive health screening and lab reviews', 45),
		('Emergency / Urgent Care', 'Immediate non-life-threatening medical attention', 40),
		('Specialist Evaluation', 'In-depth consultation for specialized medical concerns', 60);
		`
		if _, err := db.Exec(typesSQL); err != nil {
			return err
		}
	}

	var patientCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&patientCount); err != nil {
		return err
	}

	if patientCount == 0 {
		log.Println("Seeding fictional patients...")
		patientsSQL := `
		INSERT INTO patients (name, email, phone, date_of_birth, gender) VALUES
		('James Wilson', 'james.wilson@example.com', '+1 (555) 890-1234', '1988-04-12', 'Male'),
		('Sophia Martinez', 'sophia.martinez@example.com', '+1 (555) 901-2345', '1995-09-23', 'Female'),
		('Liam Johnson', 'liam.johnson@example.com', '+1 (555) 012-3456', '2012-11-05', 'Male'),
		('Olivia Davis', 'olivia.davis@example.com', '+1 (555) 123-4567', '1974-02-18', 'Female'),
		('Alexander Wright', 'alex.wright@example.com', '+1 (555) 234-8765', '1982-07-30', 'Male'),
		('Emma Watson', 'emma.watson@example.com', '+1 (555) 345-9876', '1990-12-15', 'Female');
		`
		if _, err := db.Exec(patientsSQL); err != nil {
			return err
		}
	}

	var apptCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM appointments").Scan(&apptCount); err != nil {
		return err
	}

	if apptCount == 0 {
		log.Println("Seeding fictional appointments...")
		now := time.Now()

		appts := []struct {
			PatientID int64
			DoctorID  int64
			TypeID    int64
			Offset    time.Duration
			Duration  int
			Status    string
			Notes     string
		}{
			{1, 1, 1, -48 * time.Hour, 30, "Completed", "Patient reports mild chest tightness after exercise. ECG completed; recommended stress test."},
			{2, 2, 2, -24 * time.Hour, 20, "Completed", "Follow-up on hypertension management. Blood pressure normalized with current dosage."},
			{3, 3, 3, 2 * time.Hour, 45, "In-Progress", "Annual pediatric developmental checkup and scheduled vaccination."},
			{4, 4, 1, 6 * time.Hour, 30, "Scheduled", "Consultation regarding persistent skin rash on right forearm."},
			{5, 5, 5, 26 * time.Hour, 60, "Scheduled", "Neurological evaluation for recurrent migraine episodes and light sensitivity."},
			{6, 6, 4, 50 * time.Hour, 40, "Scheduled", "Urgent knee examination following minor sports injury yesterday."},
			{1, 2, 2, 72 * time.Hour, 20, "Scheduled", "Follow-up blood test results discussion."},
			{2, 4, 1, -72 * time.Hour, 30, "Cancelled", "Patient rescheduled due to conflicting travel commitments."},
		}

		insertApptSQL := `
		INSERT INTO appointments (patient_id, doctor_id, appointment_type_id, appointment_date_time, duration_minutes, status, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7);
		`
		for _, a := range appts {
			apptTime := now.Add(a.Offset)
			if _, err := db.Exec(insertApptSQL, a.PatientID, a.DoctorID, a.TypeID, apptTime, a.Duration, a.Status, a.Notes); err != nil {
				return err
			}
		}
	}

	log.Println("Database migration and seeding completed successfully.")
	return nil
}
