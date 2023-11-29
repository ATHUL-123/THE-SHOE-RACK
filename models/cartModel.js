const mongoose = require("mongoose");


const addCartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
},

    quantity: {
        type: Number,
    },
    size: {
        type: Number
    }
    // Other cart item details except price
});
const Cart = mongoose.model("Cart", addCartSchema);
module.exports = Cart;