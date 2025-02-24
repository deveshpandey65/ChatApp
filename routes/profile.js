const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads/profilePic");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage (Saves file buffer in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * 📌 Upload Profile Picture API
 */
router.post("/profile-img", upload.single("profile"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Generate Unique File Name
        const uniqueFilename = `profile-${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Save file to disk
        fs.writeFileSync(filePath, req.file.buffer);

        // Find User & Update Profile Picture
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Construct Profile Pic URL
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        user.profilepic = `${baseUrl}/uploads/profilePic/${uniqueFilename}`;
        await user.save();

        res.status(200).json({
            message: "Image uploaded successfully",
            filePath: user.profilepic,
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * 📌 Get User Profile API
 */
router.get("/get-profile", async (req, res) => {
    try {
        const { userId } = req.query;
        console.log("Requested UserID:", userId);

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId).select("profilepic about name email").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure Profile Pic URL is Correct
        if (user.profilepic && !user.profilepic.startsWith("http")) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            user.profilepic = `${baseUrl}${user.profilepic}`;
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * 📌 Set About Section API
 */
router.post("/setabout", async (req, res) => {
    try {
        const { userId, about } = req.body;

        if (!userId || typeof about === "undefined") {
            return res.status(400).json({ message: "User ID and About are required" });
        }

        const user = await User.findByIdAndUpdate(userId, { about }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "About updated successfully" });
    } catch (error) {
        console.error("Error updating about:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
