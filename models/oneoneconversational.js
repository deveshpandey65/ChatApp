const mongoose = require("../connections/db");
const { oneoneconversationalSchema } = require("../Schema/schema");

const oneoneconversational = mongoose.models.oneoneconversational || mongoose.model("oneoneconversational", oneoneconversationalSchema);

module.exports = oneoneconversational;
