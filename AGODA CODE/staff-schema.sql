-- ===== staff-schema.sql =====
-- Run this AFTER your existing database.sql to add staff support.
-- Adds: staff table, Booking_Status column, Booking_CreatedAt column.

USE agoda_db;

-- ──────────────────────────────────────────────────────
-- 1.  Ensure BOOKING table has Status & CreatedAt columns
--     (safe to run even if they already exist)
-- ──────────────────────────────────────────────────────

ALTER TABLE BOOKING
    MODIFY COLUMN Booking_Status VARCHAR(20) NOT NULL DEFAULT 'confirmed';

-- Add CreatedAt if missing (silent if already present)
ALTER TABLE BOOKING
    ADD COLUMN IF NOT EXISTS Booking_CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ──────────────────────────────────────────────────────
-- 2.  Staff table
-- ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS staff (
  Staff_ID       INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  Staff_Username VARCHAR(60)  NOT NULL UNIQUE,
  Staff_Password VARCHAR(255) NOT NULL,          -- bcrypt hash or plain-text for dev
  Staff_Name     VARCHAR(100) NOT NULL,
  Staff_Role     VARCHAR(60)  NOT NULL DEFAULT 'Support Agent',
  Staff_Email    VARCHAR(255)          DEFAULT NULL,
  Staff_Active   TINYINT(1)   NOT NULL DEFAULT 1,
  Created_At     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────
-- 3.  Seed default staff accounts
--     Passwords stored as plain-text here for easy first-run.
--     Change them immediately in production and use password_hash()!
-- ──────────────────────────────────────────────────────

INSERT IGNORE INTO staff (Staff_Username, Staff_Password, Staff_Name, Staff_Role, Staff_Email)
VALUES
  ('admin',    'admin123',    'Admin User',    'Administrator',  'admin@agoda-staff.local'),
  ('support1', 'support123',  'Support One',   'Support Agent',  'support1@agoda-staff.local'),
  ('support2', 'support456',  'Support Two',   'Support Agent',  'support2@agoda-staff.local');

-- ──────────────────────────────────────────────────────
-- 4.  Optional: index on Booking_Status for fast filters
-- ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_booking_status
  ON BOOKING (Booking_Status);

CREATE INDEX IF NOT EXISTS idx_booking_email
  ON BOOKING (Booking_UserEmail);
