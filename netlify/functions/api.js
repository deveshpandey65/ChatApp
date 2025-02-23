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
app.use(express.json());
app.use(cors({ origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
 }));

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/friend", authMiddleware, addFriend);
app.use("/api/message", authMiddleware, require("../../routes/message"));
app.use("/api/message/create-group", authMiddleware, groupCreate);

if (!mongoose) {
    console.error("MONGOOSE NOT CONNECTED");
}

module.exports.handler = serverless(app);
