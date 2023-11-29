const mongoose =  require('mongoose')


const brandSchema = new mongoose.Schema({

    name:{
        type:String,
        required: true // This field is now required
    },
    description:{
        type:String,
        required: true // This field is now required
    },
    status:{
        type:Boolean,
        default:true
    },
    image:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:Date.now
    }



});

module.exports = mongoose.model('Brand',brandSchema);