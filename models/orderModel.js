const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
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
    // Add other address fields like state, zip code, etc., as needed
});

const orderSchema = new mongoose.Schema({
      
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true
        },
        products: [{
            productId: {
                type:  mongoose.Schema.Types.ObjectId,
                ref : "Product",
                required:true
            },
            quantity: {
                type: Number,
                required:true
            },
            size:{
                type:Number,
                required:true
            }
        }],
        address:{
            type:addressSchema,
            required:true
        },
        orderDate:{
            type:Date,
            default:Date.now,
        },
        totalAmount:{
            type:Number,
            required:true
        },
        orderStatus:{
            type:String,
            enum:["Order Placed","Shipped","Delivered","Cancelled","Returned"],
            default:"Order Placed"
        },
        paymentStatus:{
            type:String,
            enum:["Pending","Success","Failed","Refunded"],
            default:"Pending"
        },
        PaymentMethod:{
            type:String,
            required:true
        },
        cancelReason:{
            type:String,

        },
        returnReason:{
            type:String
        },
        orderID:{
            type:String
        },
        razoID:{
            type:String
        },
        discount:{
            type:Number,
            default:0
        },
        appliedcoupon:{
            type:String
        },
        discountedAmount:{
            type:Number,
            default:0
        }

    });
      
   
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;