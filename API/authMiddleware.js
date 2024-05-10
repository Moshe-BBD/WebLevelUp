const authenticateSession = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ message: "No authorization token provided." });
	}

	const token = authHeader.split(" ")[1];

	try {
		// Send a request to GitHub to verify the token
		const response = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// Check if the token is valid
		if (response.ok) {
			const userData = await response.json();
			req.user = userData; // Attach user data to the request object
			next(); // Pass control to the next middleware function
		} else {
			return res
				.status(403)
				.json({ message: "Invalid token or unauthorized." });
		}
	} catch (error) {
		console.error("Error verifying token:", error);
		return res.status(500).json({ message: "Internal server error." });
	}
};

module.exports = authenticateSession;
