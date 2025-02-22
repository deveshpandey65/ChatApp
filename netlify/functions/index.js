
const express = require('express');
require("dotenv").config();
const http = require("http");
const cors = require("cors");
const mongoose=  require('../../connections/db')
const authRoutes = require("../../routes/auth"); 
const authMiddleware=require("../../middlewares/authMiddleware")
const groupcreate=require("../../routes/groupcreate")
const addfriend= require('../../routes/addfriend')

const serverless = require('serverless-http');
const port = process.env.PORT

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
// const server = http.createServer(app);





app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
// const socketio=require('../../Socket/socketio')
app.use(express.json());

// app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
// const io = require("socket.io")(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

const message = require("../../routes/message");
app.use("/api/auth", authRoutes);
app.use("/api/friend", authMiddleware, addfriend)
app.use("/api/message",authMiddleware,message)
app.use("/api/message/create-group",authMiddleware,groupcreate)

// const users = {};

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on("joinRoom", ({ userId }) => {
//             users[userId] = socket.id;
//             socket.join(`dm-${userId}`);
//             console.log(`${userId} joined with socket ID: ${socket.id}`);
//     });

//     socket.on("sendMessage", (data) => {
//         console.log("Message received:", data);
//         console.log("Users Map:", users);

//         if (data.receiverId) {
//             const receiverSocketId = users[data.receiverId];
//             console.log(`Receiver ID: ${data.receiverId}, Receiver Socket ID: ${receiverSocketId}`);

//             if (receiverSocketId) {
//                 io.to(receiverSocketId).emit("receiveMessage", data);
//                 console.log("Message sent to:", receiverSocketId, "Message:", data.message);
//             } else {
//                 console.log("Receiver not connected");
//             }
//         }
//     });


    // socket.on("disconnect", () => {
    //     for (let userId in users) {
    //         if (users[userId] === socket.id) {
    //             delete users[userId];
    //             break;
    //         }
    //     }
    //     console.log("User disconnected:", socket.id);
    // });

// });






if (!app){
    return console.error('SEVER NOT RUNNING')
}
if (!mongoose){
    return console.error('MONGOOSE NOT CONNECTED')
}



module.exports.handler = serverless(app, { callbackWaitsForEmptyEventLoop: false });