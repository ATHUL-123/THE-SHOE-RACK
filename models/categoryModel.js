const mongoose =  require('mongoose')


const categorySchema = new mongoose.Schema({

    name:{
        type:String,
        required: true // This field is now required
    },
    type:{
           type:String,
           required:true
    },
    description:{
        type:String,
        required: true // This field is now required
    },
    status:{
        type:Boolean,
        default:true
    },
    discount:{
        type:Number,
        default:0
    },
    expiryDate:{
        type:Date,
        default:Date.now

    },
    offerstatus:{
        type:Boolean,
        default:true
    }



});

module.exports = mongoose.model('Category',categorySchema);