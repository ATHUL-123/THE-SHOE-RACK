const mongoose =  require('mongoose')

const adminSchema = new mongoose.Schema({

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
    DOB:{
        type:Date,
        required:true
    }

});

module.exports = mongoose.model('Admin',adminSchema);