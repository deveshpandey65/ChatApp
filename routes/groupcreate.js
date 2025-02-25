const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const oneoneConversation = require("../models/oneoneconversational");
const groupConversation = require("../models/groupconversational");
const getRedisClient = require('../client/client');

router.post("/", async (req, res) => {
    const client = await getRedisClient();
    try {
        const { groupId, participantes } = req.body;

        // Create new group conversation
        const newGroupConversation = new groupConversation({
            groupId,
            participantes,
            messages: []
        });

        await newGroupConversation.save();

        await Promise.all(participantes.map(async (participantId) => {
            await User.findByIdAndUpdate(
                participantId,
                { $addToSet: { groups: newGroupConversation._id } },
                { new: true }
            );
            await client.del(participantId.toString());
        }));

        res.status(200).json({ message: "Group created successfully", newGroupConversation });
    } catch (error) {
        console.error("Error in create-group:", error);
        res.status(500).json({ error: error.message });
    }
});


router.post('/searchMembers', async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch user from database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch friends list
        const members = user.friends;
        if (!members || members.length === 0) {
            return res.status(400).json({ message: "User has no friends" });
        }

        const result = await User.find({ _id: { $in: members } }).select("_id name profilepic");

        return res.status(200).json({ friends: result });
    } catch (error) {
        console.error("Error in searchMembers:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;