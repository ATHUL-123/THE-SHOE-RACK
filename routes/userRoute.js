const express = require('express');
const user_route= express();
const userController=require('../controllers/userController')
const orderController=require('../controllers/orderController')
const bodyParser=require('body-parser');
const auth = require('../middlewares/userAuth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// const { isLogin } = require('../middlewares/adminAuth');

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))



// The user routes 
user_route.set('view engine','ejs');
user_route.set('views','./views');

user_route.get('/',userController.home);
user_route.get('/login',auth.isLogout,userController.loadLogin);
user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.getSendOtp);
user_route.post('/otp',userController.verifyOTP);
user_route.get('/resend-otp',userController.resendOTP)
user_route.post('/login',userController.userLogin);
user_route.get('/logout',userController.userLogout);
user_route.get('/productdetails/:productId',auth.isBlocked,userController.getProductDetails);
user_route.post('/productdetails/:productId',auth.isLogin,auth.isBlocked,userController.addReview);
user_route.get('/useraccount',auth.isBlocked,auth.isLogin,userController.loadAccount);
user_route.get('/searchsort',userController.searchSorting)
user_route.post('/',userController.searchResults);
user_route.get('/brandsearch',userController.brandSearch)
user_route.get('/forgotpassword',auth.isBlocked,userController.loadForgotPassword)
user_route.post('/forgotpassword',userController.sendForgotOTP)
user_route.get('/resend-forgototp',userController.resendForgotOTP)
user_route.post('/forgotverification',userController.verifyResendOTP)
user_route.post('/changepassword',userController.changePassword)
user_route.get('/shopcart',auth.isLogin,auth.isBlocked,userController.loadCart)
user_route.post('/addtocart',auth.isLogin,userController.addToCart)
user_route.get('/removeitem-cart',userController.removeCartProduct)
user_route.get('/address-form',auth.isLogin,userController.getAddressForm)
user_route.post('/address-form',userController.addAddress)
user_route.get('/editaddress',auth.isLogin,userController.loadEditAddress)
user_route.post('/editaddress',userController.updateAddress)
user_route.get('/addtowishlist',auth.isLogin,userController.addToWishlist)
user_route.get('/wishlist',auth.isLogin,userController.loadWishlist)
user_route.get('/removeitem-wishlist',userController.removeWishlistProduct)
user_route.get('/categorysearch',userController.categorySearch)
user_route.get('/sorting',userController.sorting)
user_route.put('/updateQuantity',userController.updateQuantity)
user_route.get('/shop',userController.pagination)
user_route.post('/updatepropic',upload.array('image',1),userController.uploadUserImg)
user_route.get('/contact',userController.loadContact)
user_route.post('/contact',userController.addMsg)
user_route.get('/purchaseguide',userController.loadGuide)
user_route.get('/about',userController.loadAbout)
user_route.post('/updateuser',userController.updateUser);
user_route.post('/changeuserpass',userController.changePass);
user_route.get('/policy',userController.loadPolicy)
user_route.get('/terms',userController.loadTerms)
//order starts...............................................................................
user_route.get('/checkout',auth.isLogin,auth.isBlocked,orderController.loadCheckout)
user_route.post('/checkout',orderController.placeOrder)
user_route.get('/getorderdetails',auth.isLogin,orderController.userOrderDetails)
user_route.get('/usercancelorder',auth.isLogin,orderController.userCancel)
user_route.get('/userreturnorder',auth.isLogin,orderController.userReturnOrder)
user_route.post('/onlinepayment',orderController.onlinePayment)
user_route.get('/onlinepayment',orderController.paymentResponce)
user_route.post('/applycoupon',auth.isLogin,orderController.addCoupon)



//error
user_route.get('*',userController.PageNotFound)

module.exports = user_route;