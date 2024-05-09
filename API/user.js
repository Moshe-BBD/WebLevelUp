const express = require("express");
const cors = require("cors"); // Import cors
const app = express();
const AWS = require("aws-sdk");
app.use(express.json());
AWS.config.update({ region: "eu-west-1" });
const corsOptions = {
	origin: "http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:5000",
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const pool = require("./DB");

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
router.post("/favorite-spider", async (req, res) => {
	try {
		const { userId, spiderId } = req.body;

		if (!userId || !spiderId) {
			return res
				.status(400)
				.json({ message: "userId and spiderId are required" });
		}

		const userCheck = await pool.query(
			'SELECT * FROM "User" WHERE "userId" = $1',
			[userId]
		);
		if (userCheck.rowCount === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const spiderCheck = await pool.query(
			'SELECT * FROM "Spider" WHERE "spiderId" = $1',
			[spiderId]
		);
		if (spiderCheck.rowCount === 0) {
			return res.status(404).json({ message: "Spider not found" });
		}

		const existingFavorite = await pool.query(
			'SELECT * FROM "FavouriteSpider" WHERE "userId" = $1 AND "spiderId" = $2',
			[userId, spiderId]
		);
		if (existingFavorite.rowCount > 0) {
			return res
				.status(400)
				.json({ message: "Spider already favorited by the user" });
		}

		const insertQuery =
			'INSERT INTO "FavouriteSpider" ("userId", "spiderId", "like") VALUES ($1, $2, $3)';
		await pool.query(insertQuery, [userId, spiderId, 1]);

		res.status(201).json({ message: "Favorite spider added successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

router.delete("/favorite-spider", async (req, res) => {
	try {
		const { userId, spiderId } = req.query;

		if (!userId || !spiderId) {
			return res
				.status(400)
				.json({ message: "userId and spiderId are required" });
		}

		const userCheck = await pool.query(
			'SELECT * FROM "User" WHERE "userId" = $1',
			[userId]
		);
		if (userCheck.rowCount === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const spiderCheck = await pool.query(
			'SELECT * FROM "Spider" WHERE "spiderId" = $1',
			[spiderId]
		);
		if (spiderCheck.rowCount === 0) {
			return res.status(404).json({ message: "Spider not found" });
		}

		const existingFavorite = await pool.query(
			'SELECT * FROM "FavouriteSpider" WHERE "userId" = $1 AND "spiderId" = $2',
			[userId, spiderId]
		);
		if (existingFavorite.rowCount === 0) {
			return res
				.status(404)
				.json({ message: "Spider not favorited by the user" });
		}

		await pool.query(
			'DELETE FROM "FavouriteSpider" WHERE "userId" = $1 AND "spiderId" = $2',
			[userId, spiderId]
		);

		res.status(200).json({ message: "Favorite spider deleted successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
