// const io = require("socket.io-client");

// // Replace with actual MongoDB ObjectIds from your database
// const senderId = "65d4b2c8c9e0c24a88e73f12";   // Example valid MongoDB ObjectId
// const receiverId = "65d4b2c8c9e0c24a88e73f13";
// const chatId = "65d4b2c8c9e0c24a88e73f14";

// const socket = io("http://localhost:3000", {
//     transports: ["websocket"],
//     reconnectionAttempts: 3,
// });

// socket.on("connect", () => {
//     console.log("✅ Connected to WebSocket server");

//     socket.emit("joinChat", chatId);

//     socket.emit("sendMessage", {
//         senderId,
//         receiverId,
//         chatId,
//         message: "Hello from Node.js client!"
//     });

//     // Listen for messages
//     socket.on("receiveMessage", (data) => {
//         console.log("📩 Message received:", data);
//     });
// });

// // Error handling
// socket.on("connect_error", (err) => {
//     console.error("❌ Connection error:", err.message);
// });
// socket.on("disconnect", () => {
//     console.log("⚠️ Disconnected from server");
// });
