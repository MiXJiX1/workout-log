CREATE DATABASE IF NOT EXISTS workout_log;
USE workout_log;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data for Exercises
INSERT INTO exercises (name, category) VALUES 
('Bench Press', 'Chest'),
('Squat', 'Legs'),
('Deadlift', 'Back'),
('Overhead Press', 'Shoulders'),
('Pull Up', 'Back'),
('Dumbbell Curl', 'Arms'),
('Tricep Extension', 'Arms'),
('Plank', 'Core');

-- Workout Sessions (Links a user, a date, and an exercise)
CREATE TABLE IF NOT EXISTS workout_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    workout_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Workout Sets (Specific sets for a session)
CREATE TABLE IF NOT EXISTS workout_sets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    weight DECIMAL(5,2) DEFAULT 0,
    reps INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
);
