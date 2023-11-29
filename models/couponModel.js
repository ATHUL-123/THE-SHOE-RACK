const mongoose =  require('mongoose');
const { text } = require('pdfkit');


const couponSchema = new mongoose.Schema({

    couponcode:{
        type:String,
        required: true // This field is now required
    },
    status:{
        type:Boolean,
        default:true
    },
    discount:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    limit:{
        type:Number,
        required:true
    },
    redeemedUsers:[{
        type: mongoose.Schema.Types.ObjectId,

    }],
    description:{
        type:String

    }



});

module.exports = mongoose.model('Coupon',couponSchema);