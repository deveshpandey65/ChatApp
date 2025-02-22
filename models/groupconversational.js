const mongoose = require("../connections/db");
const { groupconversationalSchema } = require("../Schema/schema");

const groupconversational = mongoose.models.groupconversational || mongoose.model("groupconversational", groupconversationalSchema);

module.exports = groupconversational;
