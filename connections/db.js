const mongoose = require("mongoose");
require('dotenv').config()
console.log('Trying To Connect MongoDB')
mongoose.connect(process.env.MONGODB_URL,
)
.then(
    () => console.log("Connected to MongoDB")
)
.catch(
    err => console.log("ERROR :",err.message)
)

module.exports=mongoose
