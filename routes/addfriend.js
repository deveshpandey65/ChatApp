const express = require("express");
const router = express.Router();
const User = require("../models/user");
const getRedisClient = require('../client/client');
const moment = require("moment");
const groupConversation = require("../models/groupconversational");
const Message = require("../models/message");


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
    // const client = await getRedisClient();
    try {
        const { userId } = req.body;
        const cacheKey = userId;

        // 🔹 Check Redis cache
        // const cachedData = await client.get(cacheKey);
        // if (cachedData) {
        //     return res.status(200).json({ friends: JSON.parse(cachedData) });
        // }
        console.log("hiii")
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // 🔹 Fetch all friends
        const friends = await User.find({ _id: { $in: user.friends } }).select("_id name lastseen profilepic about email createdAt");

        // 🔹 Fetch all groups
        const groups = await groupConversation.find({ _id: { $in: user.groups } }).select("_id groupId participantes profilepic createdAt");

        // 🔹 Find last message timestamps
        const lastMessages = await Promise.all(
            [...friends, ...groups].map(async (entity) => {
                let lastMessage = null;
                let createdAt = entity.createdAt || 0;

                if (entity.participantes) {
                    // It's a group chat
                    lastMessage = await Message.findOne({ groupId: entity._id })
                        .sort({ timestamp: -1 })
                        .select("timestamp message");

                    return {
                        _id: entity._id,
                        name: entity.groupId,  // ✅ Set `groupId` as `name`
                        lastMessage:lastMessage?lastMessage:'',
                        lastMessageTime: lastMessage ? lastMessage.timestamp : createdAt, // Sort fallback
                        lastSeen: entity.lastseen ? entity.lastseen :'',
                        createdAt: createdAt,
                        type: "group",
                        img: entity.profilepic
                    };
                } else {
                    // It's a one-on-one chat
                    lastMessage = await Message.findOne({
                        $or: [
                            { senderId: userId, receiverId: entity._id },
                            { senderId: entity._id, receiverId: userId }
                        ]
                    }).sort({ timestamp: -1 }).select("timestamp message");

                    return {
                        _id: entity._id,
                        name: entity.name,
                        lastMessageTime: lastMessage ? lastMessage.timestamp : createdAt,
                        lastSeen: entity.lastseen ? moment(entity.lastseen).fromNow() : '',
                        lastMessage:lastMessage?lastMessage:'',
                        createdAt: createdAt,
                        about:entity.about?entity.about:'',
                        type: "friend",
                        email:entity.email,
                        img: entity.profilepic
                    };
                }
            })
        );

        lastMessages.sort((a, b) => {
            if (b.lastMessageTime !== a.lastMessageTime) {
                return b.lastMessageTime - a.lastMessageTime; 
            }
            return b.createdAt - a.createdAt; 
        });

        // 🔹 Cache the result
        // await client.set(cacheKey, JSON.stringify(lastMessages), 'EX', 600);
        user.lastseen = Date.now();
        user.save()

        return res.status(200).json({ friends: lastMessages });

    } catch (error) {
        console.error("Error getting friends:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
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
