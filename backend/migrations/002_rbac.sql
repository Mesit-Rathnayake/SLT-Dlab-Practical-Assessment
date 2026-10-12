-- RBAC, Doctor Availability & Notifications Migration

-- Add columns to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slmc_reg_no VARCHAR(100) DEFAULT '';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- Users table for authentication
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Recurring Doctor Weekly Schedules
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 1=Monday, 2=Tuesday, ..., 7=Sunday
    start_time VARCHAR(10) NOT NULL, -- "09:00"
    end_time VARCHAR(10) NOT NULL, -- "17:00"
    is_available BOOLEAN DEFAULT TRUE,
    slot_duration_minutes INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_doctor_day UNIQUE (doctor_id, day_of_week)
);

-- Doctor Sudden Schedule Changes / Emergency Leaves
CREATE TABLE IF NOT EXISTS doctor_schedule_changes (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL, -- EMERGENCY_LEAVE, HOURS_ADJUSTMENT, TEMPORARY_UNAVAILABLE
    effective_date DATE NOT NULL,
    start_time VARCHAR(10) DEFAULT '',
    end_time VARCHAR(10) DEFAULT '',
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedule_changes_doctor ON doctor_schedule_changes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_schedule_changes_date ON doctor_schedule_changes(effective_date);

-- Simulated Outbox for Welcome / Temp Password Emails
CREATE TABLE IF NOT EXISTS email_notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'SENT',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
