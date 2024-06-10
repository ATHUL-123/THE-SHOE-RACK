const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');
const Admin = require('../models/adminModel');
const Order = require("../models/orderModel")
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: process.env.YOUR_KEY_ID,
    key_secret: process.env.YOUR_KEY_SECRET
});
const Coupon =require('../models/couponModel')

const loadCheckout = async (req, res) => {
    try {
        let couponcode    =req.query.couponcode
        let afterDiscount =parseInt(req.query.afterDiscount);
        let discount      =parseInt(req.query.discount);
        const userId      =req.session.userId
        if ((typeof afterDiscount === 'undefined' || isNaN(afterDiscount)) && 
        (typeof discount === 'undefined' || isNaN(discount))) {
        afterDiscount = 0;
        discount = 0;
        couponcode = 0;
    }
    
        const currentDate = new Date();
        const coupons = await Coupon.find({
            status: true,
            expiryDate: { $gt: currentDate },
            redeemedUsers: { $nin: [userId]}
        });
       
        const user = await User.findById(userId)
        const productsData = await Product.find({})
        const categoryData = await Category.find({})
        const userCart = await Cart.find({ userId: userId }).populate('productId');
        let totalAmount = 0;
        userCart.forEach(cartItem => {
            totalAmount += cartItem.productId.salePrice * cartItem.quantity;
        });

        // Filter coupons based on minimum amount requirement
        const eligibleCoupons = coupons.filter(coupon => totalAmount >= coupon.limit);

        // Sort eligible coupons based on total amount in ascending order
        eligibleCoupons.sort((a, b) => a.minimumAmount - b.minimumAmount);
        res.render('users/checkout', { products: productsData, user: user, cart: userCart, category: categoryData,coupons:eligibleCoupons, msg: '1',afterDiscount,discount,couponcode})
    } catch (error) {
        res.redirect('/error')
    }
}




const placeOrder = async (req, res) => {
    try {
        const wallet       = req.body.wallet;
        const addressIndex = req.body.selectedAddress;
        const total1 = req.body.totalAmount;
        const userId = req.session.userId;
        const paymentMethod = req.body.payment_option;
        const couponcode = req.body.couponcode;
        const discount   =req.body.discount;
        const  total2 =req.body.afterdiscount;
        const user = await User.findById(req.session.userId)
        const selectedAddress = user.address[addressIndex];
        let orderMethod = 'COD'
        let paymentStatus='Pending'
        if(wallet=='wallet'){
           orderMethod = 'WALLET'
           paymentStatus='Success'

        }


       

        if(selectedAddress){
        const userCart = await Cart.find({ userId: userId }).populate('productId');

        const orderProducts = [];

        userCart.forEach(cartItem => {
            orderProducts.push({
                productId: cartItem.productId._id,
                quantity: cartItem.quantity,
                size: cartItem.size
            });
        });
        
        
        for (const orderedProduct of orderProducts) {
            const product = await Product.findById(orderedProduct.productId);
        
            if (product) {
                console.log('Found product:', product);
                const sizeToUpdate = product.sizes.find(
                    size => size.size == orderedProduct.size
                );
        
                if (sizeToUpdate) {
                    console.log('Found sizeToUpdate:', sizeToUpdate);
                    sizeToUpdate.quantity -= orderedProduct.quantity;
                    sizeToUpdate.quantity = Math.max(0, sizeToUpdate.quantity); // Ensure quantity doesn't go negative
        
                    // Save the updated product with reduced quantities
                    await product.save();
                    console.log(`Quantity updated for product ${orderedProduct.productId}, size ${orderedProduct.size}`);
                } else {
                    console.log(`Size ${orderedProduct.size} not found for product ${orderedProduct.productId}`);
                }
            } else {
                console.log(`Product with ID ${orderedProduct.productId} not found`);
            }
        }
        
        

        // Generate a unique orderId
        let generatedID = Math.floor(100000 + Math.random() * 900000);
        let existingOrder = await Order.findOne({ orderID: generatedID });

        // Loop until a unique order ID is generated
        while (existingOrder) {
            generatedID = Math.floor(100000 + Math.random() * 900000);
            existingOrder = Order.findOne({ orderID: generatedID });
        }

        // Use the generated unique orderId for the new order
        const orderId = `ORD${generatedID}`;
        

        // Create a new order
        const newOrder = new Order({
            userId: userId,
            orderID: orderId,
            products: orderProducts,
            addressIndex: addressIndex,
            totalAmount: total1,
            PaymentMethod: orderMethod, // Assuming you have a payment option in the request
            discount:discount,
            appliedcoupon:couponcode,
            discountedAmount:total2,
            paymentStatus:paymentStatus,
            address: {
                addressName: selectedAddress.addressName,
                house: selectedAddress.house,
                city: selectedAddress.city,
                landmark: selectedAddress.landmark,
                country: selectedAddress.country,
                pincode: selectedAddress.pincode,
                phone: selectedAddress.phone,
                road: selectedAddress.road,
                fname: selectedAddress.fname,
                lname: selectedAddress.lname,
                description: selectedAddress.description
                // Add other fields as needed
            }
            
            
        });
    
        // Save the new order
        await newOrder.save();



        await Coupon.updateOne(
            { couponcode: couponcode },
            { $push: { redeemedUsers: userId } }
        );

        await Cart.deleteMany({userId:userId})
       
        if(wallet=='wallet'){
            user.wallet= user.wallet - total2
             await user.save()
          }
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('productId');
        const order = await Order.find({ userId: userId }).populate('products.productId').sort({ orderDate: -1 })
        res.render('users/account', { user, category, cart, order, msg: true })
    }else{
        res.redirect('/checkout')
    }

        // Clear the user's cart after placing the order

    } catch (error) {
        res.redirect('/error')
    }
}

const userOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.userId
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('productId');
        const order = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
        
        res.render('users/order-details', { user, category, cart, order })
    } catch (error) {
        res.redirect('/error')
    }
}

const userCancel = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.userId
        const newStatus = 'Cancelled'
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('productId');
        const order = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
            if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
                await User.findByIdAndUpdate(
                    order.userId,
                    { $inc: { wallet: order.discountedAmount } },
                    );
               order.paymentStatus = 'Refunded';
               await order.save()     
            }
        res.render('users/order-details', { user, category, cart, order })
    } catch (error) {
        res.redirect('/error')
    }
}

const userReturnOrder = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.userId
        const newStatus = 'Returned'
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )


        const order = await Order.findById(orderId)
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('productId');
        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
            const updatedUser = await User.findByIdAndUpdate(
                order.userId,
                {
                    $inc: { wallet: order.discountedAmount },
                   
                }
            );
        
            order.paymentStatus = 'Refunded';
               await order.save()     
        }
        
        const orders = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');

           
        res.render('users/order-details', { user, category, cart, order:orders})
    } catch (error) {
        res.redirect('/error')
    }
}
// adminside..........................................................................................
const loadOrderList = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({orderDate:-1}).populate('userId')
        
       
        res.render('admin/orderlist', { orders })
    } catch (error) {
        res.redirect('/error')
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
        res.render('admin/orderdetails', { order, msg: false })
    } catch (error) {
        res.redirect('/error')
    }
}

const updateStatus = async (req, res) => {
    try {
        const orderId = req.query.OID;
        const newStatus = req.body.orderStatus
       
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )
        const order = await Order.findById(orderId)
        
        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
            await User.findByIdAndUpdate(
                order.userId,
                { $inc: { wallet: order.discountedAmount } },
                );
                order.paymentStatus = 'Refunded';
                await order.save()     
        }
        
        
        const orders = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
        

        res.render('admin/orderdetails', { order: orders, msg: true })

    

    } catch (error) {
        res.redirect('/error')
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.OID
        const newStatus = 'Cancelled'
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )
        const order = await Order.findById(orderId)

        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
            await User.findByIdAndUpdate(
                order.userId,
                { $inc: { wallet: order.discountedAmount } },
                );
                order.paymentStatus = 'Refunded';
                await order.save()     
        }
        
        const orders = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
             

        res.render('admin/orderdetails', { order: orders, msg: false })

    } catch (error) {
        res.redirect('/error')
    }
}


const onlinePayment = async (req, res) => {
    try {

       console.log('dfdf',process.env.YOUR_KEY_ID);
        const addressId = req.query.addressId
        const couponcode =req.query.couponcode;
        const discount   =parseInt(req.query.discount);
        let  total2 =parseInt(req.query.afterdiscount);
        const userId = req.session.userId;
        const userCart = await Cart.find({ userId: userId }).populate('productId');
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const order = await Order.find({ userId: userId }).populate('products.productId');
        
        const selectedAddress = user.address[addressId];
        const orderProducts = [];

        userCart.forEach(cartItem => {
            orderProducts.push({
                productId: cartItem.productId._id,
                quantity: cartItem.quantity,
                size: cartItem.size
            });
        });

        let totalAmount = 0;

        userCart.forEach(cartItem => {
            totalAmount += cartItem.productId.salePrice * cartItem.quantity;
        });
        
        for (const orderedProduct of orderProducts) {
            const product = await Product.findById(orderedProduct.productId);
        
            if (product) {
                console.log('Found product:', product);
                const sizeToUpdate = product.sizes.find(
                    size => size.size == orderedProduct.size
                );
        
                if (sizeToUpdate) {
                    console.log('Found sizeToUpdate:', sizeToUpdate);
                    sizeToUpdate.quantity -= orderedProduct.quantity;
                    sizeToUpdate.quantity = Math.max(0, sizeToUpdate.quantity); // Ensure quantity doesn't go negative
        
                    // Save the updated product with reduced quantities
                    await product.save();
                    console.log(`Quantity updated for product ${orderedProduct.productId}, size ${orderedProduct.size}`);
                } else {
                    console.log(`Size ${orderedProduct.size} not found for product ${orderedProduct.productId}`);
                }
            } else {
                console.log(`Product with ID ${orderedProduct.productId} not found`);
            }
        }
       
        
        var options = {
            amount: total2 * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        instance.orders.create(options, async function (err, razorOrder) {
            if (err) {
                console.error("Error creating Razorpay order:", err);
                res.status(500).json({ error: "An error occurred while placing the order." });
            } else {

                // Generate a unique orderId
                let generatedID = Math.floor(100000 + Math.random() * 900000);
                let existingOrder = await Order.findOne({ orderID: generatedID });

                // Loop until a unique order ID is generated
                while (existingOrder) {
                    generatedID = Math.floor(100000 + Math.random() * 900000);
                    existingOrder = Order.findOne({ orderID: generatedID });
                }

                // Use the generated unique orderId for the new order
                const orderId = `ORD${generatedID}`;
                // Create a new order

                

                
                const newOrder = new Order({
                    userId: userId,
                    razoID: razorOrder.id,
                    orderID:orderId,
                    products: orderProducts,
                    totalAmount: totalAmount,
                    PaymentMethod: "online Payment",
                    discount:discount,
                    appliedcoupon:couponcode,
                    discountedAmount:total2,
                    address: {
                        addressName: selectedAddress.addressName,
                        house: selectedAddress.house,
                        city: selectedAddress.city,
                        landmark: selectedAddress.landmark,
                        country: selectedAddress.country,
                        pincode: selectedAddress.pincode,
                        phone: selectedAddress.phone,
                        road: selectedAddress.road,
                        fname: selectedAddress.fname,
                        lname: selectedAddress.lname,
                        description: selectedAddress.description
                    }

                });

                // Save the new order
                await newOrder.save();

                // Clear the user's cart after placing the order
                await Cart.deleteMany({ userId: userId });
                await Coupon.updateOne(
                    { couponcode: couponcode },
                    { $push: { redeemedUsers: userId } }
                );
                // Send the JSON response
                res.status(200).json({ message: "Order placed successfully.", razorOrder });
            }
        });


    } catch (error) {
        console.log(error)
        res.redirect('/error')
    }
}

const paymentResponce = async (req, res) => {
    try {
        const status = req.query.status
        const userId = req.session.userId;
        const orderId = req.query.orderId;
       
    
        await Order.updateOne({ razoID: orderId }, { $set: { paymentStatus: status } })
        const userCart = await Cart.find({ userId: userId }).populate('productId');
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const order = await Order.find({ userId: userId }).populate('products.productId').sort({orderDate:-1})

        res.render('users/account', { user, category, cart: userCart, order, msg: true })
    } catch (error) {
        res.redirect('/error')
    }
}

// coupon addding to the order

const addCoupon = async(req,res)=>{
    try {
        const couponCode=req.body.code
        const currentDate = new Date();
        const userId = req.session.userId
        const isCouponValid=await Coupon.findOne({couponcode:couponCode,status:true,expiryDate:{$gt:currentDate},redeemedUsers: { $nin: [userId]}})
        if (isCouponValid) {
            const userId = req.session.userId;

            // Fetch user's cart
            const userCart = await Cart.find({ userId: userId }).populate('productId');

            // Calculate total cart amount
            let totalAmount = 0;
            userCart.forEach(cartItem => {
                totalAmount += cartItem.productId.salePrice * cartItem.quantity;
            });

            // Check if the total cart amount meets the coupon's limit
            if (totalAmount >= isCouponValid.limit) {
                // Apply coupon discount to the total amount
                const discount = isCouponValid.discount;
                const discountedAmount = totalAmount - discount;
                
                res.redirect(`/checkout?afterDiscount=${discountedAmount}&discount=${discount}&couponcode=${couponCode}`)
            } else {
                res.status(400).json({ message: 'Cart amount does not meet the coupon requirements' });
            }
        } else {
            res.status(404).json({ message: 'Invalid or expired coupon' });
        }
    } catch (error) {
       res.redirect('/error')
    }
}




//user functions
module.exports = {

    loadCheckout,
    placeOrder,
    loadOrderList,                         //admin-----//
    loadOrderDetails,
    updateStatus,
    cancelOrder,
    userOrderDetails,
    userCancel,
    userReturnOrder,
    onlinePayment,
    paymentResponce,
    addCoupon,
   
    //admin----//
}


