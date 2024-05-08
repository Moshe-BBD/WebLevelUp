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

router.get("/spiders", async (req, res) => {
	try {
		const spiders = await pool.query('SELECT "spiderName" FROM "Spider"');
		const spiderNames = spiders.rows.map((spider) => spider.spiderName);
		res.json(spiderNames);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

router.get("/spiders-with-facts", async (req, res) => {
	try {
		const spidersWithFacts = await pool.query(`
            SELECT s."spiderId", sf."factContent"
            FROM "Spider" s
            INNER JOIN "SpiderFact" sf ON s."spiderId" = sf."spiderId"
        `);

		const spiderFactsMap = {};
		spidersWithFacts.rows.forEach((row) => {
			if (!spiderFactsMap[row.spiderId]) {
				spiderFactsMap[row.spiderId] = [];
			}
			spiderFactsMap[row.spiderId].push(row.factContent);
		});

		res.json(spiderFactsMap);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

router.get("/spiders-with-pictures", async (req, res) => {
	try {
		const spidersWithPictures = await pool.query(`
            SELECT "spiderId", "spiderImage"
            FROM "Spider"
        `);

		res.json(spidersWithPictures.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

router.get("/favorites-for-every-user", async (req, res) => {
	try {
		const favoritesForEveryUser = await pool.query(`
            SELECT "userId", "spiderId", "like"
            FROM "FavouriteSpider"
        `);

		res.json(favoritesForEveryUser.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

router.get("/spiders-info", async (req, res) => {
	try {
		const spidersInfo = await pool.query(`
            SELECT s."spiderId", s."spiderName", 
                   STRING_AGG(sf."factContent", ' ') AS "facts", 
                   s."spiderImage"
            FROM "Spider" s
            LEFT JOIN "SpiderFact" sf ON s."spiderId" = sf."spiderId"
            GROUP BY s."spiderId", s."spiderName", s."spiderImage"
        `);

		res.json(spidersInfo.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
