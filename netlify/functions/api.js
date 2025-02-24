const express = require("express");
require("dotenv").config();
const cors = require("cors");
const serverless = require("serverless-http");

const mongoose = require("../../connections/db");
const authRoutes = require("../../routes/auth");
const authMiddleware = require("../../middlewares/authMiddleware");
const groupCreate = require("../../routes/groupcreate");
const addFriend = require("../../routes/addfriend");

const app = express();

// 🔹 Apply CORS to all routes
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Define routes
app.use("/api/auth", cors(), authRoutes);
app.use("/api/friend", cors(), authMiddleware, addFriend);
app.use("/api/message", cors(), authMiddleware, require("../../routes/message"));
app.use("/api/message/create-group", cors(), authMiddleware, groupCreate);
app.use("/api/profile", cors(), authMiddleware, require("../../routes/profile"));

if (!mongoose) {
    console.error("MONGOOSE NOT CONNECTED");
}

module.exports.handler = serverless(app);
