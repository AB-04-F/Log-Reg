const express = require("express");

const app = express();

const db = require("./db");

const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
app.use(cors());

const AuthController = require("./controller/authController");

app.use("/api/auth", AuthController);

const port = process.env.PORT || 3000;

app.listen(port, (req, res) => {
    console.log(`port is listing on ${port}`);
});