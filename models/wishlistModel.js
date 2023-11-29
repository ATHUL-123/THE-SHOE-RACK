const mongoose = require("mongoose");


const addWishlistSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        products: [{
            productId: {
                type:  mongoose.Schema.Types.ObjectId,
                ref : "Product"
            },
            quantity: {
                type: Number,
            },
            size:{
                type:Number
            }
        }]
    });
const Wishlist = mongoose.model("Wishlist", addWishlistSchema)
module.exports = Wishlist;