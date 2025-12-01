-- FillNWin Database Schema

-- Table for storing admin users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Table for storing participants
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    bill_receipt VARCHAR(100),
    vehicle_registration_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    sap_code VARCHAR(50),
    retail_outlet_name VARCHAR(255),
    rsa VARCHAR(100),
    divisonal_office VARCHAR(255) NOT NULL,
    submission_date_time VARCHAR(100),
    ticket_number VARCHAR(100) NOT NULL UNIQUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_drawn BOOLEAN DEFAULT FALSE
);

-- Table for storing draw history (winners)
CREATE TABLE IF NOT EXISTS draw_history (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER CONSTRAINT draw_history_participant_id_fkey REFERENCES participants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    bill_receipt VARCHAR(100),
    vehicle_registration_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    sap_code VARCHAR(50),
    retail_outlet_name VARCHAR(255),
    rsa VARCHAR(100),
    divisonal_office VARCHAR(255) NOT NULL,
    submission_date_time VARCHAR(100),
    ticket_number VARCHAR(100) NOT NULL,
    draw_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    draw_date VARCHAR(50),
    draw_time VARCHAR(50),
    prize_rank VARCHAR(50)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_participants_ticket ON participants(ticket_number);
CREATE INDEX IF NOT EXISTS idx_participants_drawn ON participants(is_drawn);
CREATE INDEX IF NOT EXISTS idx_draw_history_timestamp ON draw_history(draw_timestamp);

-- Fix foreign key constraint (ensure it exists with correct name and cascade)
ALTER TABLE draw_history DROP CONSTRAINT IF EXISTS draw_history_participant_id_fkey;
ALTER TABLE draw_history ADD CONSTRAINT draw_history_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE;

-- Add prize_rank column if it doesn't exist (for existing databases)
ALTER TABLE draw_history ADD COLUMN IF NOT EXISTS prize_rank VARCHAR(50);
