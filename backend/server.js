// server.js
// This file is now updated with Google OAuth 2.0 Authentication!

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Main authentication library
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Google strategy
const session = require('express-session'); // Required for passport

// --- IMPORTANT CONFIGURATION ---
// In a real app, these should be in a .env file
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET';
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';
const SESSION_SECRET = 'another-super-secret-for-sessions';


const app = express();
const PORT = process.env.PORT || 3001;

// === Database Connection ===
const connectionString = 'postgres://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: connectionString,
});

// === Middleware ===
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend to access
    credentials: true,
}));
app.use(express.json());

// Session middleware for Passport
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


// === Passport Configuration ===

// Serialize user determines which data of the user object should be stored in the session.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user is used to retrieve user data from the session.
passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (error) {
        done(error, null);
    }
});


// Configure the Google Strategy for Passport
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // This function is called when a user successfully authenticates with Google.
    // We need to find or create a user in our own database.
    try {
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        
        // Check if user already exists in our DB
        const result = await pool.query('SELECT * FROM users WHERE google_id = $1', [id]);
        
        if (result.rows.length > 0) {
            // User exists, log them in
            return done(null, result.rows[0]);
        } else {
            // User doesn't exist, create a new user
            // Note: password_hash can be null for OAuth users
            const newUserResult = await pool.query(
                `INSERT INTO users (username, email, google_id, avatar_url) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [displayName, email, id, photos[0].value]
            );
            return done(null, newUserResult.rows[0]);
        }
    } catch (error) {
        return done(error, null);
    }
  }
));


// === API Routes ===

// --- Product Routes (unchanged) ---
app.get('/api/products', async (req, res) => { /* ... */ });
app.get('/api/products/:id', async (req, res) => { /* ... */ });


// --- Local Auth Routes (unchanged) ---
app.post('/api/auth/register', async (req, res) => { /* ... */ });
app.post('/api/auth/login', async (req, res) => { /* ... */ });


// --- Google Auth Routes ---

// GET /api/auth/google
// This is the route the user will visit to initiate Google login.
// Passport will redirect them to Google.
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));


// GET /api/auth/google/callback
// Google will redirect the user to this URL after they have authenticated.
app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    // Successful authentication!
    // We can now create a JWT for our user.
    const token = jwt.sign(
        { userId: req.user.id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    // We will redirect the user back to the frontend with the token.
    // A more robust solution might use cookies, but this is simpler to start.
    const userString = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${userString}`);
  }
);


// === Start the Server ===
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Before running, you must add 'google_id' and 'avatar_url' columns to your 'users' table!
// ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
// ALTER TABLE users ADD COLUMN avatar_url TEXT;
// Also make password_hash, username nullable for Google users
