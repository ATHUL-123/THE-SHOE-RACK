const { ObjectId } = require('bson')
const mongoose =  require('mongoose')

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required: true // This field is now required
    },
    email:{
        type:String,
        required: true // This field is now required
    },
    phone:{
        type:String,
        required: true // This field is now required
    },
    password:{
        type:String,
        required: true // This field is now required
    },
    wallet:{
        type:String
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_active:{
        type:Boolean,
        default:true
    },
    address:[{
        addressName:{type:String},
        house:{type:String},
        city:{type:String},
        landmark:{type:String},
        country:{type:String},
        pincode:{type:Number},
        phone:{type:Number},
        road:{type:String},
        fname:{type:String},
        lname:{type:String},
        description:{type:String}
    }],
    date:{
        type:Date,
        default:Date.now()
    },
    wallet:{
        type:Number,
        default:0
    },
    image:{
        type:String
    }
});

module.exports = mongoose.model('User',userSchema);
