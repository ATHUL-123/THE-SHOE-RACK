const mongoose =  require('mongoose')


const productSchema = new mongoose.Schema({

    productName:{
        type:String,
        required:true
    },
    Brand:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brandstatus:{
        type:Boolean,
        default:true
    },
    description2:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    catstatus:{
        type:Boolean,
        default:true
    },
    regularPrice:{
        type:Number,
        required:true   

    },
    salePrice:{
        type:Number,
        required:true
    },
    is_active:{
        type:Boolean,
        default:true

    },
    images_url:[
       {
        type:String,
        required:false
       }
    ],
    rating:{
        type:Number
    },
    tags:{
        type:String,
        required:false
    },
    reviews: [
        {
            comment: {
                type: String,
                required: false
            },
            rating: {
                type: Number,
                required:false
            },
            customerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User' 
            },
            date:{
                type:Date,
                default:Date.now
            }
        }
    ],
    sizes:[
        {
            size:{
                type:String,
                required:true
            },
            quantity:{
                type:Number,
                required:true
            }
        }
    ],
    date:{
        type:Date,
        default:Date.now()
    },
    discountedPrice:{
        type:Number,
        default:0
    },
    avgrating:{
        type:Number
    }


});

module.exports = mongoose.model('Product',productSchema);