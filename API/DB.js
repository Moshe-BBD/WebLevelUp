const { Pool } = require("pg");
const express = require("express");
const app = express();

const AWS = require("aws-sdk");
app.use(express.json());
AWS.config.update({ region: "eu-west-1" });

const secretsManager = new AWS.SecretsManager();
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
module.exports = { query: (text, params) => pool.query(text, params) };
