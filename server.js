import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // In real app, hash password here!
        const [result] = await pool.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, password]
        );
        res.json({ id: result.insertId, username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND password_hash = ?',
            [username, password]
        );
        if (rows.length > 0) {
            const user = rows[0];
            res.json({ id: user.id, username: user.username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Exercise Routes ---
app.get('/api/exercises', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM exercises');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/exercises', async (req, res) => {
    try {
        const { name, category } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO exercises (name, category) VALUES (?, ?)',
            [name, category]
        );
        res.json({ id: result.insertId, name, category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/exercises/:id', async (req, res) => {
    try {
        const { name, category } = req.body;
        await pool.execute(
            'UPDATE exercises SET name = ?, category = ? WHERE id = ?',
            [name, category, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/exercises/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM exercises WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Workout Routes ---

// Get Workouts for Date
app.get('/api/workouts', async (req, res) => {
    try {
        const { date, user_id } = req.query; // date in YYYY-MM-DD
        if (!date || !user_id) return res.status(400).json({ error: 'Missing date or user_id' });

        // Get Sessions
        const [sessions] = await pool.execute(`
            SELECT ws.id, ws.exercise_id, ws.workout_date, e.name as exerciseName, e.category 
            FROM workout_sessions ws
            JOIN exercises e ON ws.exercise_id = e.id
            WHERE ws.user_id = ? AND ws.workout_date = ?
        `, [user_id, date]);

        // For each session, get sets
        const workoutsWithSets = await Promise.all(sessions.map(async (session) => {
            const [sets] = await pool.execute(
                'SELECT * FROM workout_sets WHERE session_id = ?',
                [session.id]
            );
            return {
                ...session,
                sets: sets.map(s => ({
                    id: s.id,
                    weight: parseFloat(s.weight),
                    reps: s.reps,
                    completed: !!s.is_completed // Convert 1/0 to boolean
                }))
            };
        }));

        res.json(workoutsWithSets);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Check if any workout exists on date (for Calendar dot)
app.get('/api/workouts/dates', async (req, res) => {
    try {
        const { user_id, month } = req.query; // month in YYYY-MM format preferably
        // To be simple, just return all dates with workouts for now or filter by string
        const [rows] = await pool.execute(`
            SELECT DISTINCT workout_date 
            FROM workout_sessions 
            WHERE user_id = ?
        `, [user_id]);
        res.json(rows.map(r => r.workout_date)); // returns string array ['2024-02-01', ...]
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/workouts/session', async (req, res) => {
    try {
        const { user_id, exercise_id, date } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO workout_sessions (user_id, exercise_id, workout_date) VALUES (?, ?, ?)',
            [user_id, exercise_id, date]
        );

        // Create initial set (match frontend logic)
        const sessionId = result.insertId;
        const [setResult] = await pool.execute(
            'INSERT INTO workout_sets (session_id, weight, reps) VALUES (?, 0, 0)',
            [sessionId]
        );

        res.json({ sessionId, setId: setResult.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/workouts/session/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM workout_sessions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Set Operations
app.post('/api/workouts/set', async (req, res) => {
    try {
        const { session_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO workout_sets (session_id, weight, reps) VALUES (?, 0, 0)',
            [session_id]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/workouts/set/:id', async (req, res) => {
    try {
        const { weight, reps, completed } = req.body;
        const updates = [];
        const values = [];

        if (weight !== undefined) { updates.push('weight = ?'); values.push(weight); }
        if (reps !== undefined) { updates.push('reps = ?'); values.push(reps); }
        if (completed !== undefined) { updates.push('is_completed = ?'); values.push(completed ? 1 : 0); }

        if (updates.length > 0) {
            values.push(req.params.id);
            await pool.execute(
                `UPDATE workout_sets SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/workouts/set/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM workout_sets WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
