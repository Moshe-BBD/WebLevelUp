const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
	user: "Spiderpedia_db",
	password: "Spiderpedia1#",
	host: "spiderpedia-postgres-db.c4n7thcq1lqm.eu-west-1.rds.amazonaws.com",
	database: "SpiderpediaDB",
	port: 5432,
	ssl: {
		rejectUnauthorized: false,
	},
});

const router = express.Router();

router.get("/users", async (req, res) => {
	try {
		const users = await pool.query('SELECT * FROM "User"');
		res.json(users.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
