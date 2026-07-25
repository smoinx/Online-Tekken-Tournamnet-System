const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const queries = require('./queries');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true
});

db.connect(err => {
    if (err) {
        console.error('CRITICAL: Error connecting to MySQL:', err.message);
        console.error('Check if MySQL is running and credentials in .env are correct.');
        return;
    }
    console.log('SUCCESS: Connected to MySQL Database: ' + process.env.DB_NAME);

    db.query("SHOW COLUMNS FROM players LIKE 'user_id'", (colErr, columns) => {
        if (colErr) {
            console.warn('Unable to verify players table schema:', colErr.message);
        } else if (!Array.isArray(columns) || columns.length === 0) {
            db.query('ALTER TABLE players ADD COLUMN user_id INT UNIQUE NULL', alterErr => {
                if (alterErr) {
                    console.error('Failed to add user_id column to players table:', alterErr.message);
                } else {
                    console.log('Updated players table: added user_id column.');
                }
            });
        }
    });

    db.query("SHOW COLUMNS FROM registrations LIKE 'status'", (colErr1, columns1) => {
        if (colErr1) {
            console.warn('Unable to verify registrations table status schema:', colErr1.message);
        } else if (Array.isArray(columns1) && columns1.length > 0) {
            db.query("ALTER TABLE registrations MODIFY COLUMN status ENUM('application','confirmed','rejected','cancelled') DEFAULT 'application'", alterStatusErr => {
                if (alterStatusErr) {
                    console.error('Failed to update registrations.status enum:', alterStatusErr.message);
                } else {
                    console.log('Updated registrations table: ensured status enum includes application.');
                }
            });
        }
    });

    db.query("SHOW COLUMNS FROM registrations LIKE 'application_type'", (colErr2, columns2) => {
        if (colErr2) {
            console.warn('Unable to verify registrations table schema:', colErr2.message);
        } else if (!Array.isArray(columns2) || columns2.length === 0) {
            db.query("ALTER TABLE registrations ADD COLUMN application_type ENUM('direct_registration','application') DEFAULT 'application'", alterErr2 => {
                if (alterErr2) {
                    console.error('Failed to add application_type column to registrations table:', alterErr2.message);
                } else {
                    console.log('Updated registrations table: added application_type column.');
                }
            });
        }
    });
});

// Helper for query execution
const run = (sql, params, res, msg) => {
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('SQL Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(msg ? { message: msg, result } : result);
    });
};

// --- Auth Routes ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query(queries.getUserByEmail, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
        const user = results[0];
        if (user.password !== password) return res.status(401).json({ error: 'Invalid email or password' });
        res.json({ message: 'Login successful', user: { id: user.id, email: user.email, role: user.role } });
    });
});

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    run(queries.addUser, [email, password, 'user'], res, 'User registered');
});

// --- Player Routes ---
app.get('/api/players', (req, res) => run(queries.getAllPlayers, [], res));
app.get('/api/players/user/:userId', (req, res) => run(queries.getPlayerByUser, [req.params.userId], res));
app.post('/api/players', (req, res) => {
    // Admin only
    const { player_id, username, email, country, rank, user_id } = req.body;
    run(queries.addPlayer, [player_id, username, email, country, rank, user_id || null], res, 'Player added');
});
app.post('/api/players/self', (req, res) => {
    const { player_id, username, email, country, rank, user_id } = req.body;
    run(queries.addPlayer, [player_id, username, email, country, rank, user_id], res, 'Player profile created for user');
});
app.put('/api/players/:id', (req, res) => {
    // Admin only
    const { username, email, country, rank } = req.body;
    run(queries.updatePlayer, [username, email, country, rank, req.params.id], res, 'Player updated');
});
app.delete('/api/players/:id', (req, res) => {
    // Admin only
    run(queries.deletePlayer, [req.params.id], res, 'Player deleted');
});

// --- Tournament Routes (Admin only) ---
app.get('/api/tournaments', (req, res) => run(queries.getAllTournaments, [], res));
app.post('/api/tournaments', (req, res) => {
    const { tournament_id, tournament_name, start_date, end_date, prize_pool, status } = req.body;
    run(queries.addTournament, [tournament_id, tournament_name, start_date, end_date, prize_pool, status], res, 'Tournament added');
});
app.put('/api/tournaments/:id', (req, res) => {
    const { tournament_name, start_date, end_date, prize_pool, status } = req.body;
    run(queries.updateTournament, [tournament_name, start_date, end_date, prize_pool, status, req.params.id], res, 'Tournament updated');
});
app.delete('/api/tournaments/:id', (req, res) => {
    run(queries.deleteTournament, [req.params.id], res, 'Tournament deleted');
});

// --- Registration Routes ---
app.get('/api/registrations', (req, res) => run(queries.getAllRegistrations, [], res));

// Get player's applications
app.get('/api/my-applications/:playerId', (req, res) => {
    const sql = queries.getPlayerApplications;
    run(sql, [req.params.playerId], res);
});

// Get tournament's applications (admin only)
app.get('/api/tournament-applications/:tournamentId', (req, res) => {
    const sql = queries.getTournamentApplications;
    run(sql, [req.params.tournamentId], res);
});

// User applies for tournament
app.post('/api/apply-tournament', (req, res) => {
    const { registration_id, player_id, tournament_id, registration_date } = req.body;
    const sql = queries.addRegistration;
    run(sql, [registration_id, player_id, tournament_id, registration_date, 'application', 'application'], res, 'Application submitted');
});

// Admin approves/rejects applications
app.put('/api/application-status/:registrationId', (req, res) => {
    const { status } = req.body; // 'confirmed' or 'rejected'
    const sql = queries.updateRegistrationStatus;
    run(sql, [status, req.params.registrationId], res, 'Application status updated');
});

app.post('/api/registrations', (req, res) => {
    const { registration_id, player_id, tournament_id, registration_date, status } = req.body;
    run(queries.addRegistration, [registration_id, player_id, tournament_id, registration_date, status || 'application', 'direct_registration'], res, 'Registration added');
});
app.delete('/api/registrations/:id', (req, res) => {
    run(queries.deleteRegistration, [req.params.id], res, 'Registration deleted');
});

// --- Match Routes (Admin only) ---
app.get('/api/matches', (req, res) => run(queries.getAllMatches, [], res));
app.post('/api/matches', (req, res) => {
    const { match_id, tournament_id, match_date, stage, player1_id, player2_id, character_used, rounds_won, result } = req.body;
    run(queries.addMatch, [match_id, tournament_id, match_date, stage, player1_id, player2_id, character_used, rounds_won, result], res, 'Match added');
});
app.put('/api/matches/:id', (req, res) => {
    const { tournament_id, match_date, stage, player1_id, player2_id, character_used, rounds_won, result } = req.body;
    const sql = queries.updateMatch;
    run(sql, [tournament_id, match_date, stage, player1_id, player2_id, character_used, rounds_won, result, req.params.id], res, 'Match updated');
});
app.delete('/api/matches/:id', (req, res) => {
    run(queries.deleteMatch, [req.params.id], res, 'Match deleted');
});

// --- Leaderboard Routes ---
app.get('/api/leaderboard', (req, res) => run(queries.getAllLeaderboard, [], res));
app.post('/api/leaderboard', (req, res) => {
    const { lb_id, player_id, position, total_points, season } = req.body;
    run(queries.addLeaderboard, [lb_id, player_id, position, total_points, season], res, 'Leaderboard entry added');
});
app.put('/api/leaderboard/:id', (req, res) => {
    const { position, total_points, season } = req.body;
    run(queries.updateLeaderboard, [position, total_points, season, req.params.id], res, 'Leaderboard entry updated');
});
app.delete('/api/leaderboard/:id', (req, res) => {
    run(queries.deleteLeaderboard, [req.params.id], res, 'Leaderboard entry deleted');
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
