const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const userRouter = require("./user");
const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const { Pool } = require("pg");
require("dotenv").config();
const app = express();

app.use(
	expressSession({
		secret: process.env.GITHUB_SECRET || "default-secret-key",
		resave: false,
		saveUninitialized: false,
	})
);

app.use(passport.initialize());
app.use(passport.session());

const pool = new Pool({
	host: "spiderpedia-postgres-db.c4n7thcq1lqm.eu-west-1.rds.amazonaws.com",
	port: 5432,
	user: "",
	password: "",
	database: "SpiderpediaDB",
	ssl: {
		rejectUnauthorized: false,
	},
});

passport.use(
	new GitHubStrategy(
		{
			clientID: isProduction
				? process.env.PROD_GITHUB_ID
				: process.env.LOCAL_GITHUB_ID,
			clientSecret: isProduction
				? process.env.PROD_GITHUB_SECRET
				: process.env.LOCAL_GITHUB_SECRET,
			callbackURL: isProduction
				? `http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:${
						process.env.PORT || 5000
				  }/callback`
				: "http://localhost:5000/callback",
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const user = await findOrCreateUser(profile);
				console.log("users: " + user);
				done(null, profile);
			} catch (error) {
				done(error);
			}
		}
	)
);

async function findOrCreateUser(profile) {
	const client = await pool.connect();
	const emailAddress = "test@gmail.com";
	// const emailAddress = profile.emails && profile.emails[0].value;

	try {
		// Check if the user already exists
		// const result = await client.query('SELECT * FROM "User" WHERE "githubId" = $1', [profile.id]);
		const result = await client.query(
			'SELECT * FROM "User" WHERE "githubId" = $1',
			[profile.id]
		);
		console.log("result: " + result);
		if (result.rows.length > 0) {
			// User exists
			return result.rows[0];
		} else {
			// Insert new user
			const newUser = await client.query(
				'INSERT INTO "User" ("userId","emailAddress", "username", "githubId") VALUES (DEFAULT,$1, $2, $3) RETURNING *',
				[emailAddress, profile.username, profile.id]
			);
			return newUser.rows[0];
		}
	} catch (error) {
		console.log(error);
	} finally {
		client.release();
	}
}

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

// Serving static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.get("/", (req, res) => {
	res.sendFile("index.html", { root: path.join(__dirname, "../frontend") });
});

app.get("/login", passport.authenticate("github"));

app.get(
	"/callback",
	passport.authenticate("github", { failureRedirect: "/" }),
	(req, res) => {
		res.redirect("/");
	}
);

app.get("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

app.get("/user", (req, res) => {
	if (req.isAuthenticated()) {
		res.json({ username: req.user.username });
	} else {
		res.json("Not logged in");
	}
});

// API Routes
app.use("/api", userRouter);

// Server setup
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server listening on port ${port}`));
