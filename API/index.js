const express = require('express');
const expressSession = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const userRouter = require('./user');
const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';
require('dotenv').config();

const app = express();

// Session Configuration
app.use(expressSession({

    secret: process.env.GITHUB_SECRET || 'default-secret-key',

    resave: false,

    saveUninitialized: false

}));


// Passport Initialization
app.use(passport.initialize());

app.use(passport.session());

// Passport GitHub OAuth Strategy
passport.use(new GitHubStrategy({

    clientID: isProduction ? process.env.PROD_GITHUB_ID : process.env.LOCAL_GITHUB_ID,

    clientSecret: isProduction ? process.env.PROD_GITHUB_SECRET : process.env.LOCAL_GITHUB_SECRET,

    callbackURL: isProduction
        ? `http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:${process.env.PORT || 5000}/callback`
        : `http://localhost:${process.env.PORT || 5000}/callback`

}, (accessToken, refreshToken, profile, done) => {

    done(null, profile);

}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Serving static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.get('/', (req, res) => {

    res.sendFile('index.html', { root: path.join(__dirname, '../frontend') });

});

app.get('/login', passport.authenticate('github'));

app.get('/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/');
});

app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {

        res.json({ username: req.user.username });

    } else {
        res.json('Not logged in');
    }
});

// API Routes
app.use("/api", userRouter);

// Server setup
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server listening on port ${port}`));