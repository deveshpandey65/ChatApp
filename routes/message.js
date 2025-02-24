const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const oneoneConversation = require("../models/oneoneconversational");
const groupConversation = require("../models/groupconversational");
const app = express();
app.use(cors({ origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
 }));

// module.exports = (io) => {
    router.post("/send-message", async (req, res) => {
        try {
            const { senderId, receiverId, groupId, message } = req.body;

            const user = await User.findById(senderId);
            if (!user) {
                return res.status(404).json({ message: "Sender not found" });
            }

            const newMessage = new Message({ senderId, receiverId, groupId, message });
            await newMessage.save();

            if (!groupId) {
                let oneoneconversation = await oneoneConversation.findOne({
                    participantes: { $all: [senderId, receiverId] }
                });

                if (!oneoneconversation) {
                    let newOneoneConversation = new oneoneConversation({
                        participantes: [senderId, receiverId],
                        messages: [newMessage._id]
                    });
                    await newOneoneConversation.save();
                } else {
                    oneoneconversation.messages.push(newMessage._id);
                    oneoneconversation.markModified("messages");
                    await oneoneconversation.save();
                }


                // io.to(`dm-${senderId}-${receiverId}`).emit("new-message", newMessage);
                // io.to(`dm-${receiverId}-${senderId}`).emit("new-message", newMessage);
            } else {
                let groupconversational = await groupConversation.findById(groupId);

                if (!groupconversational) {
                    return res.status(404).json({ message: "Group not found" });
                }

                groupconversational.messages.push(newMessage._id);
                groupconversational.markModified("messages");
                await groupconversational.save();
                // io.to(`group-${groupId}`).emit("new-message", newMessage);

            }

            res.status(200).json({ message: "Message sent successfully", newMessage });
        } catch (error) {
            console.error("Error in send-message:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/get-message', async (req, res) => {
        try {
            const { userId, groupId, friendId } = req.body;
            if (groupId) {
                const groupConversational = await groupConversation.findById(groupId);

                if (!groupConversational) {
                    return res.status(404).json({ message: "Group not found" });
                }

                const messages = await Message.find({ _id: { $in: groupConversational.messages } });

                return res.status(200).json({ messages });
            } else if (friendId) {
                const oneOneConversation = await oneoneConversation.findOne({
                    participantes: { $all: [userId, friendId] }
                });

                if (!oneOneConversation) {
                    return res.status(404).json({ message: "Conversation not found" });
                }
                const messages = await Message.find({ _id: { $in: oneOneConversation.messages } });
                return res.status(200).json({ messages });
            }
            return res.status(400).json({ message: "Invalid request. Provide groupId or friendId." });
        } catch (error) {
            console.error("Error fetching messages:", error.message);
            return res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    });

    module.exports= router;
// };
