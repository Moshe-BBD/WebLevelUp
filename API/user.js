const express = require("express");
const { Pool } = require("pg");
const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-1" });

const secretsManager = new AWS.SecretsManager();
let pool;

async function initializePool() {
	try {
		const secretData = await secretsManager
			.getSecretValue({
				SecretId:
					"arn:aws:secretsmanager:eu-west-1:179530787873:secret:spiderpedia_secrets-CiA3Se",
			})
			.promise();
		const secret = JSON.parse(secretData.SecretString);

		pool = new Pool({
			user: secret.username,
			password: secret.password,
			host: "spiderpedia-postgres-db.c4n7thcq1lqm.eu-west-1.rds.amazonaws.com",
			database: "SpiderpediaDB",
			port: 5432,
			ssl: {
				rejectUnauthorized: false,
			},
		});
	} catch (err) {
		console.error("Error initializing database pool:", err);
		process.exit(1);
	}
}

initializePool();

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
