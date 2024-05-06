const express = require('express');
const expressSession = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
require('dotenv').config();


const app = express();

app.use(expressSession({
    secret: process.env.GITHUB_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../frontend'));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: 'http://localhost:3000/callback'
},
    function (accessToken, refreshToken, profile, done) {
        // Use profile information to determine if user is authenticated
        done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../frontend/index.html');
});

app.get('/login', passport.authenticate('github'));

app.get('/callback', passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => res.redirect('/')
);

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Pass error to the next middleware (or error handler)
        }
        res.redirect('/'); // Redirect to the home page after logging out
    });
});


app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ username: req.user.username }); // Adjust based on your user model
    } else {
        res.json('Not logged in');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
