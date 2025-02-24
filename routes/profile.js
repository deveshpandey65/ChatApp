const express = require("express");
const cors = require("cors");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

// ✅ AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Get from .env
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Get from .env
    region: process.env.AWS_REGION, // e.g., "us-east-1"
});

// ✅ Multer Storage (Uploads directly to S3)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME, // Your S3 Bucket Name
        acl: "public-read",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, `profilePics/${Date.now()}-${file.originalname}`);
        },
    }),
});

/**
 * 📌 Upload Profile Picture API (Uploads to AWS S3)
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

        // ✅ Get Uploaded File URL from S3
        const fileUrl = req.file.location;

        // ✅ Find User & Update Profile Picture
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

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId).select("profilepic about name email").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
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
