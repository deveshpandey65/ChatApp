const mongoose = require("../connections/db");
const { MessageSchema } = require("../Schema/schema");

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

module.exports = Message;
