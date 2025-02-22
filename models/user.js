const mongoose = require('../connections/db');
const { UserSchema } = require('../Schema/schema');
const user= mongoose.models.User||mongoose.model("User", UserSchema);
module.exports = user;
