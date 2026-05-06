-- ===== database.sql =====
-- Run this in phpMyAdmin or MySQL CLI to set up your database

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS agoda_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agoda_db;

-- 2. Create the users table
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  contact    VARCHAR(20)  NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
