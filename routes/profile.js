const express = require("express");
const router = express.Router();
const User = require("../models/user");

const moment = require("moment");
const groupConversation = require("../models/groupconversational");
const multer=require('multer')

const fs = require("fs");
const path = require("path");

const uploadDir = "./uploads/profilePic";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post("/profile-img", upload.single("profile"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const uniqueFilename = `profile-${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Save file manually
        fs.writeFileSync(filePath, req.file.buffer);

        // Save path to MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const baseUrl = `https://${req.get("host")}`;
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

        const baseUrl = `http://${req.get("host")}`;
        user.profilepic = user.profilepic ? `${baseUrl}${user.profilepic}` : null;

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



router.post("/setabout",async (req, res) => {
    try {
        const { userId } = req.body;
        const { about } = req.body;

        const user = await User.findByIdAndUpdate( userId, { about }, { new: true } );
        res.status(200).json({ message: "About updated successfully" });
        } catch (error) {
            console.error("Error updating about:", error);
            res.status(500).json({ message: "Internal Server Error" });
            }

}
)

module.exports = router;
