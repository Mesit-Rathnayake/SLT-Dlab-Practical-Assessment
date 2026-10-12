package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"golang.org/x/crypto/bcrypt"
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

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", dbUser, dbPass, dbHost, dbPort, dbName, sslMode)
	}

	var db *sql.DB
	var err error

	// Retry connection for up to 30 seconds to allow container initialization
	for i := 1; i <= 10; i++ {
		db, err = sql.Open("pgx", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				if os.Getenv("DATABASE_URL") != "" {
					log.Printf("Successfully connected to Cloud PostgreSQL database (Neon)")
				} else {
					log.Printf("Successfully connected to PostgreSQL database at %s:%s/%s", dbHost, dbPort, dbName)
				}
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
		nic VARCHAR(50) DEFAULT '',
		name VARCHAR(150) NOT NULL,
		email VARCHAR(150) NOT NULL,
		phone VARCHAR(50) NOT NULL,
		date_of_birth DATE,
		gender VARCHAR(20) DEFAULT 'Unspecified',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	ALTER TABLE patients ADD COLUMN IF NOT EXISTS nic VARCHAR(50) DEFAULT '';
	CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_nic ON patients(nic) WHERE nic != '' AND nic IS NOT NULL;

	CREATE TABLE IF NOT EXISTS doctors (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(150) NOT NULL,
		specialty VARCHAR(100) NOT NULL,
		email VARCHAR(150) NOT NULL UNIQUE,
		phone VARCHAR(50) NOT NULL,
		room_number VARCHAR(30) DEFAULT 'Room 101',
		slmc_reg_no VARCHAR(100) DEFAULT '',
		status VARCHAR(50) DEFAULT 'Active',
		bio TEXT DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	-- In case doctors was already created in earlier run, add missing columns safely
	ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slmc_reg_no VARCHAR(100) DEFAULT '';
	ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
	ALTER TABLE doctors ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

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

	-- Users & RBAC
	CREATE TABLE IF NOT EXISTS users (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(150) NOT NULL,
		email VARCHAR(150) NOT NULL UNIQUE,
		password_hash VARCHAR(255) NOT NULL,
		role VARCHAR(50) NOT NULL, -- SUPER_ADMIN, ADMIN, DOCTOR
		doctor_id BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
		must_change_password BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	-- Doctor Recurring Schedules
	CREATE TABLE IF NOT EXISTS doctor_schedules (
		id BIGSERIAL PRIMARY KEY,
		doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
		day_of_week INT NOT NULL, -- 1=Mon, ..., 7=Sun
		start_time VARCHAR(10) NOT NULL,
		end_time VARCHAR(10) NOT NULL,
		is_available BOOLEAN DEFAULT TRUE,
		slot_duration_minutes INT DEFAULT 30,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT unique_doctor_day UNIQUE (doctor_id, day_of_week)
	);

	-- Doctor Sudden Changes / Emergency Leaves
	CREATE TABLE IF NOT EXISTS doctor_schedule_changes (
		id BIGSERIAL PRIMARY KEY,
		doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
		change_type VARCHAR(50) NOT NULL,
		effective_date DATE NOT NULL,
		start_time VARCHAR(10) DEFAULT '',
		end_time VARCHAR(10) DEFAULT '',
		reason TEXT NOT NULL,
		status VARCHAR(50) DEFAULT 'ACTIVE',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	-- Simulated Outbox for Notification Audit
	CREATE TABLE IF NOT EXISTS email_notifications (
		id BIGSERIAL PRIMARY KEY,
		recipient_email VARCHAR(150) NOT NULL,
		subject VARCHAR(255) NOT NULL,
		body TEXT NOT NULL,
		status VARCHAR(50) DEFAULT 'SENT',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
	CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
	CREATE INDEX IF NOT EXISTS idx_appointments_type_id ON appointments(appointment_type_id);
	CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date_time);
	CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
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
		log.Println("Seeding fictional doctors with SLMC registration numbers...")
		doctorsSQL := `
		INSERT INTO doctors (name, specialty, email, phone, room_number, slmc_reg_no, status, bio) VALUES
		('Dr. Eleanor Vance', 'Cardiology', 'eleanor.vance@medwizard.health', '+1 (555) 234-5678', 'Suite 402', 'SLMC-MD-48291', 'Active', 'Senior Consultant Cardiologist specializing in echocardiography and preventive cardiology.'),
		('Dr. Marcus Chen', 'General Practice', 'marcus.chen@medwizard.health', '+1 (555) 345-6789', 'Suite 101', 'SLMC-MD-51204', 'Active', 'Primary care clinician focused on family health, chronic illness, and holistic wellness.'),
		('Dr. Sarah Jenkins', 'Pediatrics', 'sarah.jenkins@medwizard.health', '+1 (555) 456-7890', 'Suite 205', 'SLMC-MD-39812', 'Active', 'Pediatric specialist caring for child developmental health, immunizations, and pediatric wellness.'),
		('Dr. David Kim', 'Dermatology', 'david.kim@medwizard.health', '+1 (555) 567-8901', 'Suite 310', 'SLMC-MD-60319', 'Active', 'Board-certified dermatologist focusing on clinical dermatology and lesion management.'),
		('Dr. Aisha Patel', 'Neurology', 'aisha.patel@medwizard.health', '+1 (555) 678-9012', 'Suite 512', 'SLMC-MD-44910', 'Active', 'Neurology consultant with expertise in migraine management and neuromuscular disorders.'),
		('Dr. Robert Sterling', 'Orthopedics', 'robert.sterling@medwizard.health', '+1 (555) 789-0123', 'Suite 118', 'SLMC-MD-55823', 'Active', 'Orthopedic surgeon and musculoskeletal specialist managing sports injuries and joint care.');
		`
		if _, err := db.Exec(doctorsSQL); err != nil {
			return err
		}
	} else {
		// Update SLMC numbers if empty
		_, _ = db.Exec("UPDATE doctors SET slmc_reg_no = 'SLMC-MD-48291', bio = 'Senior Consultant Cardiologist' WHERE email = 'eleanor.vance@medwizard.health' AND (slmc_reg_no = '' OR slmc_reg_no IS NULL)")
		_, _ = db.Exec("UPDATE doctors SET slmc_reg_no = 'SLMC-MD-51204', bio = 'Primary care clinician' WHERE email = 'marcus.chen@medwizard.health' AND (slmc_reg_no = '' OR slmc_reg_no IS NULL)")
		_, _ = db.Exec("UPDATE doctors SET slmc_reg_no = 'SLMC-MD-39812', bio = 'Pediatric specialist' WHERE email = 'sarah.jenkins@medwizard.health' AND (slmc_reg_no = '' OR slmc_reg_no IS NULL)")
		_, _ = db.Exec("UPDATE doctors SET slmc_reg_no = 'SLMC-MD-60319', bio = 'Board-certified dermatologist' WHERE email = 'david.kim@medwizard.health' AND (slmc_reg_no = '' OR slmc_reg_no IS NULL)")
		_, _ = db.Exec("UPDATE doctors SET slmc_reg_no = 'SLMC-MD-44910', bio = 'Neurology consultant' WHERE email = 'aisha.patel@medwizard.health' AND (slmc_reg_no = '' OR slmc_reg_no IS NULL)")
		_, _ = db.Exec("UPDATE doctors SET slmc_reg_no = 'SLMC-MD-55823', bio = 'Orthopedic surgeon' WHERE email = 'robert.sterling@medwizard.health' AND (slmc_reg_no = '' OR slmc_reg_no IS NULL)")
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
		INSERT INTO patients (nic, name, email, phone, date_of_birth, gender) VALUES
		('198810502341', 'James Wilson', 'james.wilson@example.com', '+1 (555) 890-1234', '1988-04-12', 'Male'),
		('199578201945', 'Sophia Martinez', 'sophia.martinez@example.com', '+1 (555) 901-2345', '1995-09-23', 'Female'),
		('201231005829', 'Liam Johnson', 'liam.johnson@example.com', '+1 (555) 012-3456', '2012-11-05', 'Male'),
		('197451904321', 'Olivia Davis', 'olivia.davis@example.com', '+1 (555) 123-4567', '1974-02-18', 'Female'),
		('198221203456', 'Alexander Wright', 'alex.wright@example.com', '+1 (555) 234-8765', '1982-07-30', 'Male'),
		('199084601289', 'Emma Watson', 'emma.watson@example.com', '+1 (555) 345-9876', '1990-12-15', 'Female');
		`
		if _, err := db.Exec(patientsSQL); err != nil {
			return err
		}
	} else {
		// Backfill NICs if empty
		_, _ = db.Exec("UPDATE patients SET nic = '198810502341' WHERE email = 'james.wilson@example.com' AND (nic = '' OR nic IS NULL)")
		_, _ = db.Exec("UPDATE patients SET nic = '199578201945' WHERE email = 'sophia.martinez@example.com' AND (nic = '' OR nic IS NULL)")
		_, _ = db.Exec("UPDATE patients SET nic = '201231005829' WHERE email = 'liam.johnson@example.com' AND (nic = '' OR nic IS NULL)")
		_, _ = db.Exec("UPDATE patients SET nic = '197451904321' WHERE email = 'olivia.davis@example.com' AND (nic = '' OR nic IS NULL)")
		_, _ = db.Exec("UPDATE patients SET nic = '198221203456' WHERE email = 'alex.wright@example.com' AND (nic = '' OR nic IS NULL)")
		_, _ = db.Exec("UPDATE patients SET nic = '199084601289' WHERE email = 'emma.watson@example.com' AND (nic = '' OR nic IS NULL)")
		_, _ = db.Exec("UPDATE patients SET nic = '199214502834' WHERE email = 'nuwan.perera@test.com' AND (nic = '' OR nic IS NULL)")
	}

	// Seed RBAC Users
	var userCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount); err != nil {
		return err
	}

	if userCount == 0 {
		log.Println("Seeding RBAC users (Super Admin, General Admin, Doctors)...")
		superHash, _ := bcrypt.GenerateFromPassword([]byte("SuperAdmin123!"), bcrypt.DefaultCost)
		adminHash, _ := bcrypt.GenerateFromPassword([]byte("Admin123!"), bcrypt.DefaultCost)
		doc1Hash, _ := bcrypt.GenerateFromPassword([]byte("DoctorPass123!"), bcrypt.DefaultCost)
		doc2TempHash, _ := bcrypt.GenerateFromPassword([]byte("TempDr2026!"), bcrypt.DefaultCost)

		// Fetch IDs of doctors
		var doc1ID, doc2ID int64
		_ = db.QueryRow("SELECT id FROM doctors WHERE email = 'eleanor.vance@medwizard.health'").Scan(&doc1ID)
		_ = db.QueryRow("SELECT id FROM doctors WHERE email = 'marcus.chen@medwizard.health'").Scan(&doc2ID)

		usersSQL := `
		INSERT INTO users (name, email, password_hash, role, doctor_id, must_change_password) VALUES
		('Arthur Kingsley (Hospital Executive Director)', 'superadmin@medwizard.health', $1, 'SUPER_ADMIN', NULL, FALSE),
		('Sarah Miller (Front Desk & Admissions Officer)', 'admin@medwizard.health', $2, 'ADMIN', NULL, FALSE),
		('Dr. Eleanor Vance', 'eleanor.vance@medwizard.health', $3, 'DOCTOR', $5, FALSE),
		('Dr. Marcus Chen', 'marcus.chen@medwizard.health', $4, 'DOCTOR', $6, TRUE);
		`
		if _, err := db.Exec(usersSQL, string(superHash), string(adminHash), string(doc1Hash), string(doc2TempHash), doc1ID, doc2ID); err != nil {
			return err
		}

		// Initial welcome notification for Dr. Marcus Chen (simulating temp password email)
		welcomeBody := fmt.Sprintf(`Dear Dr. Marcus Chen,

Welcome to Medical Wizard Hospital Portal.
Your Doctor account has been registered by the Super Administration.

Details:
SLMC Reg No: SLMC-MD-51204
Assigned Email: marcus.chen@medwizard.health
Temporary Password: TempDr2026!

Please log in at http://localhost:5173 and you will be prompted to choose a permanent secure password.

Best regards,
Medical Wizard Administration`)

		_, _ = db.Exec(`INSERT INTO email_notifications (recipient_email, subject, body, status) VALUES ($1, $2, $3, 'SENT')`,
			"marcus.chen@medwizard.health",
			"Welcome to Medical Wizard: Account Created & Temporary Password",
			welcomeBody,
		)
	} else {
		// Ensure Super Admin and General Admin names accurately represent non-doctor administration
		_, _ = db.Exec("UPDATE users SET name = 'Arthur Kingsley (Hospital Executive Director)' WHERE email = 'superadmin@medwizard.health'")
		_, _ = db.Exec("UPDATE users SET name = 'Sarah Miller (Front Desk & Admissions Officer)' WHERE email = 'admin@medwizard.health'")
	}

	// Seed Doctor Schedules (Monday-Friday 09:00-17:00)
	var schedCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM doctor_schedules").Scan(&schedCount); err == nil && schedCount == 0 {
		log.Println("Seeding default weekly doctor schedules...")
		rows, err := db.Query("SELECT id FROM doctors")
		if err == nil {
			defer rows.Close()
			var docIDs []int64
			for rows.Next() {
				var did int64
				if err := rows.Scan(&did); err == nil {
					docIDs = append(docIDs, did)
				}
			}
			for _, did := range docIDs {
				for day := 1; day <= 5; day++ { // Mon - Fri
					_, _ = db.Exec(`
					INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
					VALUES ($1, $2, '09:00', '17:00', TRUE, 30)
					ON CONFLICT DO NOTHING
					`, did, day)
				}
			}
		}
	}

	// Seed Sample Sudden Schedule Change Alert (Dr. Sterling attending medical conference / leave)
	var changeCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM doctor_schedule_changes").Scan(&changeCount); err == nil && changeCount == 0 {
		var doc6ID int64
		_ = db.QueryRow("SELECT id FROM doctors WHERE email = 'robert.sterling@medwizard.health'").Scan(&doc6ID)
		if doc6ID > 0 {
			tomorrowStr := time.Now().Add(24 * time.Hour).Format("2006-01-02")
			_, _ = db.Exec(`
			INSERT INTO doctor_schedule_changes (doctor_id, change_type, effective_date, start_time, end_time, reason, status)
			VALUES ($1, 'EMERGENCY_LEAVE', $2, '09:00', '13:00', 'Emergency surgical workshop duty at National Teaching Hospital. Morning clinics postponed.', 'ACTIVE')
			`, doc6ID, tomorrowStr)
		}
	}

	// Seed Sample Appointments
	var apptCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM appointments").Scan(&apptCount); err == nil && apptCount == 0 {
		log.Println("Seeding fictional appointments...")
		now := time.Now()

		appts := []struct {
			PatientEmail string
			DoctorEmail  string
			TypeID       int64
			Offset       time.Duration
			Duration     int
			Status       string
			Notes        string
		}{
			{"james.wilson@example.com", "eleanor.vance@medwizard.health", 1, -48 * time.Hour, 30, "Completed", "Patient reports mild chest tightness after exercise. ECG completed; recommended stress test."},
			{"sophia.martinez@example.com", "marcus.chen@medwizard.health", 2, -24 * time.Hour, 20, "Completed", "Follow-up on hypertension management. Blood pressure normalized with current dosage."},
			{"liam.johnson@example.com", "sarah.jenkins@medwizard.health", 3, 2 * time.Hour, 45, "In-Progress", "Annual pediatric developmental checkup and scheduled vaccination."},
			{"olivia.davis@example.com", "david.kim@medwizard.health", 1, 6 * time.Hour, 30, "Scheduled", "Consultation regarding persistent skin rash on right forearm."},
			{"alex.wright@example.com", "aisha.patel@medwizard.health", 5, 26 * time.Hour, 60, "Scheduled", "Neurological evaluation for recurrent migraine episodes and light sensitivity."},
			{"emma.watson@example.com", "robert.sterling@medwizard.health", 4, 50 * time.Hour, 40, "Scheduled", "Urgent knee examination following minor sports injury yesterday."},
			{"james.wilson@example.com", "marcus.chen@medwizard.health", 2, 72 * time.Hour, 20, "Scheduled", "Follow-up blood test results discussion."},
			{"sophia.martinez@example.com", "david.kim@medwizard.health", 1, -72 * time.Hour, 30, "Cancelled", "Patient rescheduled due to conflicting travel commitments."},
		}

		insertApptSQL := `
		INSERT INTO appointments (patient_id, doctor_id, appointment_type_id, appointment_date_time, duration_minutes, status, notes)
		SELECT p.id, d.id, $3, $4, $5, $6, $7
		FROM patients p, doctors d
		WHERE p.email = $1 AND d.email = $2;
		`
		for _, a := range appts {
			apptTime := now.Add(a.Offset)
			_, _ = db.Exec(insertApptSQL, a.PatientEmail, a.DoctorEmail, a.TypeID, apptTime, a.Duration, a.Status, a.Notes)
		}
	}

	log.Println("Database migration, seeding, and RBAC provisioning completed successfully.")
	return nil
}
