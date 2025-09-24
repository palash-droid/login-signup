const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
// ❗ IMPORTANT: Update with your PostgreSQL credentials
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'auth_app_db',
    password: 'NewPassword123!', // Change this to your password
    port: 5432,
});

// --- API ROUTES ---

// 1. User Signup
app.post('/api/auth/signup', async (req, res) => {
    const { employee_id, name, password } = req.body;

    if (!employee_id || !name || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO employees (employee_id, name, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [employee_id, name, password_hash]
        );

        res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Employee ID already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// 2. User Login
app.post('/api/auth/login', async (req, res) => {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
        return res.status(400).json({ message: 'Please provide Employee ID and password.' });
    }

    try {
        const userQuery = await pool.query("SELECT * FROM employees WHERE employee_id = $1", [employee_id]);

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Don't send the password hash back
        delete user.password_hash;

        res.status(200).json({ message: 'Login successful!', employee: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// 3. Forgot Password - Generate Token
app.post('/api/auth/forgot-password', async (req, res) => {
    const { employee_id } = req.body;
    try {
        const userQuery = await pool.query("SELECT id FROM employees WHERE employee_id = $1", [employee_id]);
        if (userQuery.rows.length === 0) {
            // Still send a success-like message to prevent user enumeration
            return res.status(200).json({ message: 'If a user with that ID exists, a token has been generated.' });
        }
        const userId = userQuery.rows[0].id;

        // Delete any old tokens for this user
        await pool.query("DELETE FROM password_reset_tokens WHERE employee_id = $1", [userId]);

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(resetToken, 10);
        const expires_at = new Date(Date.now() + 3600000); // 1 hour expiry

        await pool.query(
            "INSERT INTO password_reset_tokens (employee_id, token_hash, expires_at) VALUES ($1, $2, $3)",
            [userId, tokenHash, expires_at]
        );

        // --- SIMULATED EMAIL ---
        // In a real app, you would email this token to the user.
        // For this project, we log it to the console for you to use in the app.
        console.log(`\n--- PASSWORD RESET ---`);
        console.log(`Employee ID: ${employee_id}`);
        console.log(`Reset Token: ${resetToken}`);
        console.log(`--------------------\n`);

        res.status(200).json({ message: 'A reset token has been generated.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

// 4. Reset Password with Token
app.post('/api/auth/reset-password', async (req, res) => {
    const { employee_id, token, newPassword } = req.body;

    if (!employee_id || !token || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    try {
        const userQuery = await pool.query("SELECT id FROM employees WHERE employee_id = $1", [employee_id]);
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid token or employee ID.' });
        }
        const userId = userQuery.rows[0].id;

        const tokenQuery = await pool.query("SELECT * FROM password_reset_tokens WHERE employee_id = $1", [userId]);
        if (tokenQuery.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        const storedToken = tokenQuery.rows[0];

        if (new Date() > new Date(storedToken.expires_at)) {
            return res.status(400).json({ message: 'Token has expired.' });
        }

        const isTokenValid = await bcrypt.compare(token, storedToken.token_hash);
        if (!isTokenValid) {
            return res.status(400).json({ message: 'Invalid token.' });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE employees SET password_hash = $1 WHERE id = $2", [newPasswordHash, userId]);

        // Invalidate the token after use
        await pool.query("DELETE FROM password_reset_tokens WHERE employee_id = $1", [userId]);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.send('Server is up and running 🚀');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
