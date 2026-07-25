CREATE DATABASE IF NOT EXISTS tekken;
USE tekken;

-- Users table for authentication with role-based access
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
    player_id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    country VARCHAR(50),
    rank1 VARCHAR(50),
    user_id INT UNIQUE NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tournaments (
    tournament_id VARCHAR(10) PRIMARY KEY,
    tournament_name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    prize_pool DECIMAL(10, 2),
    status ENUM('upcoming', 'ongoing', 'completed')
);

-- Updated registrations table: Users apply for tournaments, Admins confirm them
CREATE TABLE IF NOT EXISTS registrations (
    registration_id VARCHAR(10) PRIMARY KEY,
    player_id VARCHAR(10),
    tournament_id VARCHAR(10),
    registration_date DATE,
    status ENUM('application', 'confirmed', 'rejected', 'cancelled') DEFAULT 'application',
    application_type ENUM('direct_registration', 'application') DEFAULT 'application',
    applied_by_admin BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
);

CREATE TABLE IF NOT EXISTS matches (
    match_id VARCHAR(10) PRIMARY KEY,
    tournament_id VARCHAR(10),
    match_date DATE,
    stage VARCHAR(50),
    player1_id VARCHAR(10),
    player2_id VARCHAR(10),
    character_used VARCHAR(50),
    rounds_won VARCHAR(10),
    result ENUM('win', 'loss', 'pending'),

    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),
    FOREIGN KEY (player1_id) REFERENCES players(player_id),
    FOREIGN KEY (player2_id) REFERENCES players(player_id)
);

CREATE TABLE IF NOT EXISTS leaderboard (
    lb_id VARCHAR(10) PRIMARY KEY,
    player_id VARCHAR(10),
    position INT,
    total_points INT,
    season VARCHAR(20),

    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

-- Insert default admin and user accounts for testing
INSERT IGNORE INTO users (email, password, role) VALUES 
('admin@tekken.com', 'admin123', 'admin'),
('user@tekken.gg', 'user123', 'user');
