const http = require("http");

const requestBody = {
	userId: 4,
	spiderId: 2,
};

const options = {
	hostname: "localhost",
	port: 5000,
	path: "/api/favorite-spider",
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
};

const req = http.request(options, (res) => {
	let data = "";

	res.on("data", (chunk) => {
		data += chunk;
	});

	res.on("end", () => {
		console.log("Response:", JSON.parse(data));
	});
});

req.on("error", (error) => {
	console.error("Error:", error);
});

// Write the request body and end the request here, outside the response event listener
req.write(JSON.stringify(requestBody));
req.end();
