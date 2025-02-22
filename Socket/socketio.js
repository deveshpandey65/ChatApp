// const { app, server } = require('../connections/server');
// const socketIo = require('socket.io');
// const Message = require('../models/message');
// const mongoose = require('mongoose');
// const cors = require("cors");

// app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
// const io = require("socket.io")(server, {
//     cors: {
//         origin: "http://localhost:3001",
//         methods: ["GET", "POST"]
//     }
// });

// const users = {}; 

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on("joinRoom", ({ userId }) => {
//         users[userId] = socket.id;
//         console.log(`${userId} joined with socket ID: ${socket.id}`);
//     });

//     socket.on("sendMessage", (data) => {
//         console.log("Message received:", data);

//         if (data.groupId) {
//             io.emit(`group-${data.groupId}`, data); 
//         } else if (data.receiverId) {
//             const receiverSocketId = users[data.receiverId];
//             if (receiverSocketId) {
//                 io.to(receiverSocketId).emit("receiveMessage", data);
//             }
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//         Object.keys(users).forEach(userId => {
//             if (users[userId] === socket.id) {
//                 delete users[userId];
//             }
//         });
//     });
// });


// module.exports = io;
