const mongoose = require("mongoose");


const usermsgSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    msg: {
        type: String
    },
    sub:{
        type:String
    },
    name:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }

    // Other cart item details except price
});
const Usermsg = mongoose.model("Usermsg", usermsgSchema);
module.exports = Usermsg;