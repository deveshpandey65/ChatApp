const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const oneoneConversation = require("../models/oneoneconversational");
const groupConversation = require("../models/groupconversational");
const multer = require("multer");
const getRedisClient = require('../client/client');
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "chat_files",
        allowed_formats: ["jpg", "jpeg", "png", "pdf", "docx", "mp4", "mp3"],
    },
});

const upload = multer({ storage: storage });


router.post("/send-message", upload.array("files", 5), async (req, res) => {
    try {
        // const client = await getRedisClient();
        const { senderId, receiverId, groupId, message } = req.body;

        const user = await User.findById(senderId);
        if (!user) {
            return res.status(404).json({ message: "Sender not found" });
        }

        let fileUrls = [];
        if (req.files && req.files.length > 0) {
            fileUrls = req.files.map(file => ({
                url: file.path,
                type: file.mimetype
            }));
        }

        const newMessage = new Message({
            senderId,
            receiverId: groupId ? null : receiverId, 
            groupId,
            message,
            files: fileUrls
        });

        await newMessage.save();

        if (!groupId) {
            let oneoneconversation = await oneoneConversation.findOne({
                participantes: { $all: [senderId, receiverId] }
            });

            if (!oneoneconversation) {
                oneoneconversation = new oneoneConversation({
                    participantes: [senderId, receiverId],
                    messages: [newMessage._id]
                });
                await oneoneconversation.save();
            } else {
                if (!oneoneconversation.messages) {
                    oneoneconversation.messages = []; 
                }
                oneoneconversation.messages.push(newMessage._id);
                await oneoneconversation.save();

            }
            const cacheKey = `dm:${senderId}:${receiverId}`;
            // await client.del(cacheKey);
        } else {
            let groupconversational = await groupConversation.findById(groupId);
            if (!groupconversational) {
                return res.status(404).json({ message: "Group not found" });
            }

            if (!groupconversational.messages) {
                groupconversational.messages = []; // Initialize if undefined
            }
            groupconversational.messages.push(newMessage._id);
            await groupconversational.save();



            const cacheKey = `group:${groupId}`;
            // await client.del(cacheKey);
        }

        return res.status(200).json({ message: "Message sent successfully", newMessage });
    } catch (error) {
        console.error("Error in send-message:", error);
        return res.status(500).json({ error: error.message });
    }
});






router.post("/profile-img", upload.single("profile"), async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const fileUrl = req.file.path;

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







router.post('/get-message', async (req, res) => {
    try {
        // const client = await getRedisClient();
        const { userId, groupId, friendId } = req.body;

        if (!groupId && !friendId) {
            return res.status(400).json({ message: "Invalid request. Provide groupId or friendId." });
        }

        // const cacheKey = groupId ? `group:${groupId}` : `dm:${userId}:${friendId}`;

        // const cachedData = await client.get(cacheKey);
        // if (cachedData) {
        //     return res.status(200).json({ messages: JSON.parse(cachedData) });
        // }

        let messages = [];

        if (groupId) {
            const groupConversational = await groupConversation.findById(groupId);
            if (!groupConversational) {
                return res.status(404).json({ message: "Group not found" });
            }
            messages = await Message.find({ _id: { $in: groupConversational.messages } })
                .sort({ timestamp: -1 });
        } else if (friendId) {
            const oneOneConversation = await oneoneConversation.findOne({
                participantes: { $all: [userId, friendId] }
            });

            if (!oneOneConversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }
            messages = await Message.find({ _id: { $in: oneOneConversation.messages } })
                .sort({ timestamp: -1 });

            
            const unreadMessages = messages.filter(msg => msg.receiverId == userId );
            await Promise.all(unreadMessages.map(async (msg) => {
                msg.read = true;
                msg.seenAt = new Date();
                await msg.save();
            }));
        }

        // await client.set(cacheKey, JSON.stringify(messages), 'EX', 600);
        return res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});




    module.exports= router;

