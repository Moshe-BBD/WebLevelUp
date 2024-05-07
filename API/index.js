const express = require("express");
const userRouter = require("./user");

const app = express();

app.use("/api", userRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server listening on port ${port}`));
