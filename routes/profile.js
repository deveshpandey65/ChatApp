const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profilePics", // Cloudinary folder
        allowed_formats: ["jpg", "jpeg", "png"], // Allowed file types
    },
});

const upload = multer({ storage: storage });

/**
 * 📌 Upload Profile Picture API
 */
router.post("/profile-img", upload.single("profile"), async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // ✅ Cloudinary Image URL
        const fileUrl = req.file.path;

        // ✅ Update User Profile Pic
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profilepic = fileUrl;
        await user.save();

        res.status(200).json({
            message: "Image uploaded successfully",
            filePath: fileUrl,
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

        // ✅ Use the stored Cloudinary URL directly
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

// ✅ Ensure `module.exports = router;` is at the END of the file
module.exports = router;
