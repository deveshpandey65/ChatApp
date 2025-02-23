const express = require("express");
const router = express.Router();
const User = require("../models/user");

const moment = require("moment");
const groupConversation = require("../models/groupconversational");


router.post("/add-friend", async (req, res) => {
    try {
        const { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).json({ message: "User ID and Friend ID are required" });
        }

        if (userId === friendId) {
            return res.status(400).json({ message: "You cannot add yourself as a friend" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.friends.includes(friendId)) {
            user.friends.push(friendId);
        }
        if (!friend.friends.includes(userId)) {
            friend.friends.push(userId);
        }
        await user.save();
        await friend.save();
        res.status(200).json({ message: "Friend added successfully" });
    } catch (error) {
        console.error("Error adding friend:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
router.post('/get-friend', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const friends = await User.find({ _id: { $in: user.friends } }).select("_id name lastseen profilepic");

        const formattedFriends = friends.map(friend => ({
            _id: friend._id,
            name: friend.name,
            lastSeen: moment(friend.lastSeen).fromNow(),
            type:"friend"
        }));
        const groups = await groupConversation.find({ _id: { $in: user.groups } }).select("_id groupId participantes");

        const formattedGroups = groups.map(group => ({
            _id: group._id,
            name: group.groupId,  
            participantes: group.participantes,
            type: "group"  
        }));

        res.status(200).json({ friends: [...formattedFriends, ...formattedGroups] });
    } catch (error) {
        console.error("Error getting friends:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
router.get('/users',async(req,res)=>{
    try {
        const searchQuery = req.query.search;
        console.log(searchQuery)
        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }
        const users = await User.find({
            $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } },
            ],
        }).select("name _id email friends profilepic");

        res.json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }

    }
)

module.exports = router;
