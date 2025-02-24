const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();
require('dotenv').config



router.post("/verify", async (req, res) => {
    token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
    }
    try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            res.status(201).json(decoded)
        } catch (error) {
            res.status(400).json({ message: "Invalid token." });
        }
});

router.post("/register", async (req, res) => {
    console.log(req.body)
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name:name, email:email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "365d" });
    res.status(201).json({ token, user });
});

module.exports = router;
