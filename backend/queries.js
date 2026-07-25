const queries = {
    // Users - Authentication
    getUserByEmail: "SELECT * FROM users WHERE email = ?",
    addUser: "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",

    // Players
    getAllPlayers: "SELECT player_id, username, email, country, rank1, user_id FROM players",
    getPlayerByUser: "SELECT player_id, username, email, country, rank1, user_id FROM players WHERE user_id = ?",
    addPlayer: "INSERT INTO players (player_id, username, email, country, rank1, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    updatePlayer: "UPDATE players SET username=?, email=?, country=?, rank1=? WHERE player_id=?",
    deletePlayer: "DELETE FROM players WHERE player_id = ?",

    // Tournaments - Admin only
    getAllTournaments: "SELECT * FROM tournaments",
    addTournament: "INSERT INTO tournaments (tournament_id, tournament_name, start_date, end_date, prize_pool, status) VALUES (?, ?, ?, ?, ?, ?)",
    updateTournament: "UPDATE tournaments SET tournament_name=?, start_date=?, end_date=?, prize_pool=?, status=? WHERE tournament_id=?",
    deleteTournament: "DELETE FROM tournaments WHERE tournament_id = ?",

    // Registrations - Updated for applications
    getAllRegistrations: "SELECT * FROM registrations",
    getApplicationsByStatus: "SELECT * FROM registrations WHERE status = ? AND tournament_id = ?",
    getPlayerApplications: "SELECT * FROM registrations WHERE player_id = ?",
    getTournamentApplications: "SELECT * FROM registrations WHERE tournament_id = ? AND status IN ('application', 'confirmed')",
    addRegistration: "INSERT INTO registrations (registration_id, player_id, tournament_id, registration_date, status, application_type) VALUES (?, ?, ?, ?, ?, ?)",
    updateRegistrationStatus: "UPDATE registrations SET status = ? WHERE registration_id = ?",
    deleteRegistration: "DELETE FROM registrations WHERE registration_id = ?",

    // Matches - Admin only
    getAllMatches: "SELECT * FROM matches",
    addMatch: "INSERT INTO matches (match_id, tournament_id, match_date, stage, player1_id, player2_id, character_used, rounds_won, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    updateMatch: "UPDATE matches SET tournament_id=?, match_date=?, stage=?, player1_id=?, player2_id=?, character_used=?, rounds_won=?, result=? WHERE match_id=?",
    deleteMatch: "DELETE FROM matches WHERE match_id = ?",

    // Leaderboard
    getAllLeaderboard: "SELECT * FROM leaderboard ORDER BY position ASC",
    addLeaderboard: "INSERT INTO leaderboard (lb_id, player_id, position, total_points, season) VALUES (?, ?, ?, ?, ?)",
    updateLeaderboard: "UPDATE leaderboard SET position=?, total_points=?, season=? WHERE lb_id=?",
    deleteLeaderboard: "DELETE FROM leaderboard WHERE lb_id = ?"
};

module.exports = queries;
