const express = require('express');
const admin_route= express();
const adminController=require('../controllers/adminController')
const orderController=require('../controllers/orderController')
const userController=require('../controllers/userController')
const bodyParser=require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Set the destination folder for uploaded files
const auth   = require('../middlewares/adminAuth')

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}))
//setting the view engine
admin_route.set('view engine','ejs');
admin_route.set('views','./views');

//The admin routes
admin_route.get('/',adminController.loadLogin)
admin_route.post('/',adminController.adminLogin)
admin_route.get('/logout',adminController.adminLogout)
admin_route.get('/userList',auth.isLogin,adminController.loadUserList)
admin_route.get('/addproducts',auth.isLogin,adminController.loadProductForm)
admin_route.post('/addproducts',auth.isLogin, upload.array('images', 5),adminController.addProduct);
admin_route.get('/productlist',auth.isLogin,adminController.loadProductlist)
admin_route.get('/useraction/:userId/:act',auth.isLogin,adminController.userAction)
admin_route.get('/productaction/:productId/:act',auth.isLogin,adminController.productAction)
admin_route.get('/editproduct/:productId',auth.isLogin,adminController.loadEditProduct)
admin_route.post('/editproduct',auth.isLogin,upload.array('images'),adminController.updateProduct)
admin_route.get('/categories',auth.isLogin,adminController.loadCategories)
admin_route.post('/categories',auth.isLogin,adminController.addCategories);
admin_route.get('/categoriesaction/:categoryId/:act',auth.isLogin,adminController.categoriestAction)
admin_route.delete('/deleteImage/:productId/:imageIndex',auth.isLogin,adminController.deleteImage)
admin_route.get('/editcategory/:categoryId',auth.isLogin,adminController.editCategoryLoad)
admin_route.post('/editcategory/:categoryId',auth.isLogin,adminController.updateCategory)
admin_route.get('/orderlist',auth.isLogin,orderController.loadOrderList)
admin_route.get('/orderdetails',auth.isLogin,orderController.loadOrderDetails)
admin_route.post('/updateorderstatus',auth.isLogin,orderController.updateStatus)
admin_route.get('/cancelorder',auth.isLogin,orderController.cancelOrder)
admin_route.get('/salereport',auth.isLogin,adminController.loadSalesReport)
admin_route.post('/salesreportsearch',auth.isLogin,adminController.salesSearch)
admin_route.get('/coupons',auth.isLogin,adminController.loadCoupons)
admin_route.post('/coupons',auth.isLogin,adminController.addCoupon)
admin_route.get('/editcoupon',auth.isLogin,adminController.loadEditCoupon)
admin_route.post('/editcoupon',auth.isLogin,adminController.updateCoupon)
admin_route.get('/brands',auth.isLogin,adminController.loadBrands)
admin_route.post('/brands',auth.isLogin,upload.array('image',1),adminController.addBrand)
admin_route.get('/brandaction',auth.isLogin,adminController.brandAction)
admin_route.get('/catoffer',auth.isLogin,adminController.loadCatOffer)
admin_route.post('/catoffer',auth.isLogin,adminController.addCatOffer)
admin_route.get('/banner',auth.isLogin,adminController.banners)
admin_route.post('/banner',auth.isLogin,upload.array('image',1),adminController.addbanner)
admin_route.get('/editbanner',auth.isLogin,adminController.loadEditbanner)
admin_route.post('/editbanner',auth.isLogin,upload.array('image',1),adminController.updateBanner)
admin_route.get('/usermsgs',auth.isLogin,adminController.loadusermsg)
admin_route.get('/deletemsg',adminController.deleteMsg)
admin_route.get('/forgotOTP',auth.isLogout,adminController.forgotStep1)
admin_route.post('/forgotOTP',adminController.sendOtp)
admin_route.post('/verifyotp',adminController.verifyOTP)
admin_route.post('/changepass',adminController.changePass)
admin_route.get('/resendOTP',adminController.sendOtp)
admin_route.get('/settings',adminController.loadSettings)
admin_route.post('/settings',adminController.saveChanges)
admin_route.post('/changepassword',adminController.changePass)

//error

module.exports=admin_route;