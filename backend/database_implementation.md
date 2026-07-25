# Database Implementation

## 5.1 Table Creation

### Users
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Players
```sql
CREATE TABLE IF NOT EXISTS players (
    player_id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    country VARCHAR(50),
    rank1 VARCHAR(50),
    user_id INT UNIQUE NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Tournaments
```sql
CREATE TABLE IF NOT EXISTS tournaments (
    tournament_id VARCHAR(10) PRIMARY KEY,
    tournament_name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    prize_pool DECIMAL(10, 2),
    status ENUM('upcoming', 'ongoing', 'completed')
);
```

### Registrations
```sql
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
```

### Matches
```sql
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
```

### Leaderboard
```sql
CREATE TABLE IF NOT EXISTS leaderboard (
    lb_id VARCHAR(10) PRIMARY KEY,
    player_id VARCHAR(10),
    position INT,
    total_points INT,
    season VARCHAR(20),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);
```

## Relational Schema
The relational schema for the Gaming Tournament Management System is presented below.
Primary Keys (PK) and Foreign Keys (FK) are clearly marked.

- users ( id [PK], email, password, role, created_at )
- players ( player_id [PK], username, email, country, rank1, user_id [FK -> users.id] )
- tournaments ( tournament_id [PK], tournament_name, start_date, end_date, prize_pool, status )
- registrations ( registration_id [PK], player_id [FK -> players.player_id], tournament_id [FK -> tournaments.tournament_id], registration_date, status, application_type, applied_by_admin )
- matches ( match_id [PK], tournament_id [FK -> tournaments.tournament_id], match_date, stage, player1_id [FK -> players.player_id], player2_id [FK -> players.player_id], character_used, rounds_won, result )
- leaderboard ( lb_id [PK], player_id [FK -> players.player_id], position, total_points, season )

### Relationship Summary
| Relationship | Cardinality | Description |
|---|---|---|
| users → players | 1 : 1 | A user account can be linked to one player profile. |
| players → registrations | 1 : M | A player can submit many tournament registrations. |
| tournaments → registrations | 1 : M | A tournament can receive many player registrations. |
| tournaments → matches | 1 : M | A tournament contains many matches. |
| players → matches | 1 : M | A player can appear in many matches. |
| players → leaderboard | 1 : M | A player can have multiple leaderboard entries across seasons. |

## 5.2 Data Insertion

### Sample Users
```sql
INSERT INTO users (email, password, role)
VALUES
    ('admin@tekken.com', 'admin123', 'admin'),
    ('user@tekken.gg', 'user123', 'user');
```

### Sample Players
```sql
INSERT INTO players (player_id, username, email, country, rank1, user_id)
VALUES
    ('P0001', 'KazuyaFan', 'kazuya@example.com', 'Japan', 'King', 2),
    ('P0002', 'AkumaAce', 'akuma@example.com', 'USA', 'Demon', NULL);
```

### Sample Tournaments
```sql
INSERT INTO tournaments (tournament_id, tournament_name, start_date, end_date, prize_pool, status)
VALUES
    ('T001', 'Tekken Summer Clash', '2026-07-10', '2026-07-12', 5000.00, 'upcoming'),
    ('T002', 'Champions Cup', '2026-08-05', '2026-08-07', 10000.00, 'upcoming');
```

### Sample Registrations
```sql
INSERT INTO registrations (registration_id, player_id, tournament_id, registration_date, status, application_type, applied_by_admin)
VALUES
    ('R001', 'P0001', 'T001', '2026-06-01', 'application', 'application', FALSE),
    ('R002', 'P0002', 'T002', '2026-06-02', 'confirmed', 'direct_registration', TRUE);
```

### Sample Matches
```sql
INSERT INTO matches (match_id, tournament_id, match_date, stage, player1_id, player2_id, character_used, rounds_won, result)
VALUES
    ('M001', 'T001', '2026-07-10', 'Quarterfinal', 'P0001', 'P0002', 'Devil Jin', '2-1', 'win');
```

### Sample Leaderboard
```sql
INSERT INTO leaderboard (lb_id, player_id, position, total_points, season)
VALUES
    ('L001', 'P0001', 1, 1200, '2026 Summer'),
    ('L002', 'P0002', 2, 1100, '2026 Summer');
```

## 6. SQL Queries

### Authentication & User Lookup
```sql
SELECT *
FROM users
WHERE email = 'user@tekken.gg';
```

### List All Players
```sql
SELECT player_id, username, email, country, rank1, user_id
FROM players;
```

### Get Registered Tournaments for a Player
```sql
SELECT r.registration_id,
       t.tournament_name,
       r.registration_date,
       r.status,
       r.application_type
FROM registrations r
JOIN tournaments t ON r.tournament_id = t.tournament_id
WHERE r.player_id = 'P0001';
```

### Admin View of Pending Applications
```sql
SELECT r.registration_id,
       p.username,
       t.tournament_name,
       r.registration_date,
       r.status
FROM registrations r
JOIN players p ON r.player_id = p.player_id
JOIN tournaments t ON r.tournament_id = t.tournament_id
WHERE r.status = 'application';
```

### Tournament Application Count
```sql
SELECT t.tournament_id,
       t.tournament_name,
       COUNT(r.registration_id) AS application_count
FROM tournaments t
LEFT JOIN registrations r ON t.tournament_id = r.tournament_id
GROUP BY t.tournament_id, t.tournament_name;
```

### Get Matches for a Tournament
```sql
SELECT m.match_id,
       m.match_date,
       m.stage,
       p1.username AS player1,
       p2.username AS player2,
       m.character_used,
       m.rounds_won,
       m.result
FROM matches m
LEFT JOIN players p1 ON m.player1_id = p1.player_id
LEFT JOIN players p2 ON m.player2_id = p2.player_id
WHERE m.tournament_id = 'T001';
```

### Leaderboard Ranking
```sql
SELECT l.position,
       p.username,
       l.total_points,
       l.season
FROM leaderboard l
JOIN players p ON l.player_id = p.player_id
ORDER BY l.position ASC;
```

### Update Registration Status
```sql
UPDATE registrations
SET status = 'confirmed'
WHERE registration_id = 'R001';
```

### Delete a Tournament (cascade cleanup is not automatic in this schema)
```sql
DELETE FROM registrations WHERE tournament_id = 'T002';
DELETE FROM matches WHERE tournament_id = 'T002';
DELETE FROM tournaments WHERE tournament_id = 'T002';
```
