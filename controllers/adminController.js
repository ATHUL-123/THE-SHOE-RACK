const Admin = require('../models/adminModel');
// const { render } = require('../routes/adminRoute');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const modals = require('../middlewares/swal');
const Order =  require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Brand = require('../models/BrandModel');
const Banner = require('../models/bannerModel');
const Usermsg    = require('../models/usermsgModel');
const nodemailer = require('nodemailer')
require('dotenv').config();

const ITEMS_PER_PAGE = 12;
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user:process.env.EMAIL,
        pass:process.env.PASS,
    },
});


//admin forgot otp
const forgotStep1 = async(req,res)=>{
    try {
        const msg = req.query.msg;
        if(msg){
            res.render('admin/enteremail',{message:msg})
        }else{
            res.render('admin/enteremail',{message:''})
        }
        
    } catch (error) {
        res.redirect('/admin/error')
    }
}

//sending otp   
let isOtpVerified = true;
const OTP_TIMEOUT   =60*1000
const sendOtp =async(req,res)=>{
    try {
        let email = req.body.email;
        const email2 =req.query.email
       
       if(email){
        
       }else{
        isOtpVerified = true;
        email=email2
       
       }
       const emailExist = await Admin.findOne({email:email})
        if(emailExist){
            const randomOTP = Math.floor(1000 + Math.random() * 9000);
                

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Hello,THE SHOE RACK!!',
                    text: `Admin verification OTP is ${randomOTP}`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                       res.redirect('/admin/error')(error);
                    } else {
                        console.log(`Email is send with verification code ${randomOTP}`, info.response);
                    }
                })
                req.session.AdminOTP = randomOTP
                res.render('admin/otp', {email})
                
                setTimeout(() => {
                    if (isOtpVerified) {
                        req.session.AdminOTP = null;
                        isOtpVerified = false;
                        console.log('time out over');
                    }
                }, OTP_TIMEOUT);
            
        }else{
            res.redirect('/admin/forgotOTP?msg=No Admins Found In This Email')
        }
        
    } catch (error) {
       console.log(error.message);
    }
}

const verifyOTP = async (req, res) => {
    try {
        const otp = req.body.OTP
        
        const orginalOTP = req.session.AdminOTP
        console.log(orginalOTP ,otp);
        if (isOtpVerified) {
            if (otp == orginalOTP) {
               
                res.render('admin/addnewpass')
            } else {
                res.redirect('/admin/forgotOTP?msg=Invalid OTP')
               
            }
        } else {
            isOtpVerified = false;
            res.redirect('/admin/forgotOTP?msg=Action Failed')
        }
    } catch (err) {
       
        res.render('users/page-login-register', { message: 'Error occurred during OTP verification' });
    }
}

//changing pass
const changePass = async(req,res)=>{
    try {
        
        const newpass = req.body.newpass
        const oldpass = req.body.oldpass
        const pass= req.body.password
        if(oldpass){
            const exist=await Admin.findOne({password:oldpass})
            if(exist){
                await Admin.updateMany({},{$set:{password:newpass}})
                res.redirect('/admin/settings?msg=Password Changed')
            }else{
                res.redirect('/admin/settings?msg=Invalid Password')
            }
        }else{
        await Admin.updateMany({},{$set:{password:pass}})
        res.redirect('/admin')
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}
// admin login page load function
const loadLogin = async (req, res) => {
    try {
        
        const brands =await Brand.find({status:true})   
        const product= await Product.find({})
        if (req.session.adminId) {
            const user = await User.find({})
            const order = await Order.find({})
           
            .populate('products.productId')
            .populate('userId');
            res.render('admin/index',{brands,order,user,product})
        } else {
            res.render('admin/adminlogin', { message: '' })
        }

    } catch (error) {
        res.redirect('/admin/error')
    }
}

//admin login function
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        const user = await User.find({})
        const product= await Product.find({})
        const brands =await Brand.find({status:true})
        if (!admin) {
            res.render('admin/adminlogin', { message: 'Admin not found' })
        } else {
 
            if (admin.password == password) {
                req.session.adminId = admin._id;
                const order = await Order.find({})
                .sort({ orderDate: -1 })
                .populate('products.productId')
                .populate('userId')
                
                res.render('admin/index',{brands,order,user,product});


            } else {
                res.render('admin/adminlogin', { message: 'Invalid Password' })
            }

        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}

//admin logout function
const adminLogout = async (req, res) => {
    try {

       
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                  
                    res.redirect('/admin'); // Redirect to a different route after destroying the session
                }
            });
       
        

    } catch (error) {
        res.redirect('/admin/error')
    }
}

// loading the user list function
const loadUserList = async (req, res) => {
    try {
       
            const usersData = await User.find({})
            res.render('admin/userslist', { users: usersData })
       
           
        
    } catch (error) {
        res.redirect('/admin/error')
    }
}


// loading the add product form function
const loadProductForm = async (req, res) => {
    try {
        const brands = await Brand.find({status:true})
            
            const categories = await Category.find({})
            res.render('admin/productform', { brands,category: categories })
        
    } catch (error) {
        res.redirect('/admin/error')
    }
}


//Add new product function
const addProduct = async (req, res) => {
    try {
       
        const productName = req.body.productName;
        const description = req.body.description;
        const description2 = req.body.description2
        const regularPrice = req.body.regularPrice;
        const salePrice = req.body.salePrice;
        const productId = req.body.productId;
        const category = req.body.category;
        const Brand = req.body.brand;
        const tags = req.body.tags;
       
        const sizes = [];
        const size7 = {
            size: '7',
            quantity: req.body.QOS7 || 0
        };
        sizes.push(size7);

        const size8 = {
            size: '8',
            quantity: req.body.QOS8 || 0
        };
        sizes.push(size8);

        const size9 = {
            size: '9',
            quantity: req.body.QOS9 || 0
        };
        sizes.push(size9);

        const size10 = {
            size: '10',
            quantity: req.body.QOS10 || 0
        };
        sizes.push(size10);

        //adding the product
        const product = new Product({
            productName: productName,
            description: description,
            regularPrice: regularPrice,
            salePrice: salePrice,
            description2:description2,
            productId: productId,
            category: category,
            Brand: Brand,
            sizes: sizes,
            tags: tags,
            images_url: req.files.map(file => file.path) // Save file paths to the database
        });

        const productData = await product.save();

        if (productData) {
            res.redirect('/admin');
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
};


// product list and product status change[started]
let ar = []
const loadProductlist = async (req, res) => {
    try {
        const productsData = await Product.find({}).populate('category')
        if (req.session.adminId) {
            if (ar == 3) {
              
                res.render('admin/productslist', { products: productsData, message: true })
                ar = 2;
            } else {

                res.render('admin/productslist', { products: productsData, message: false })
            }
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}

// The product listing and unlisting function
const productAction = async (req, res) => {
    try {
        ar = 3
        const productId = req.params.productId;
        const act = req.params.act;

        if (act == 0) {
            const product = await Product.findByIdAndUpdate(productId, { is_active: false }, { new: true });
            if (product) {
              
                res.redirect('/admin/productlist');
            } else {

                res.status(404).send(`User with ID ${productId} not found.`);
            }
        } else {
            const product = await Product.findByIdAndUpdate(productId, { is_active: true }, { new: true });
            if (product) {
                res.redirect('/admin/productlist');
            } else {

                res.status(404).send(`User with ID ${productId} not found.`);
            }
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}
// product list and product status change [ended]



//The user Blocking & Unblocking function
const userAction = async (req, res) => {
    try {
        if (req.session.adminId) {
            const userId = req.params.userId;
            const act = req.params.act
            if (act == 0) {
                const user = await User.findByIdAndUpdate(userId, { is_active: false }, { new: true });
                // Check if user is found and updated
                if (user) {
                    res.redirect('/admin/userList')
                } else {
                    res.status(404).send(`User with ID ${userId} not found.`);
                }
            } else {
                const user = await User.findByIdAndUpdate(userId, { is_active: true }, { new: true });
                if (user) {
                    res.redirect('/admin/userList')
                } else {
                    res.status(404).send(`User with ID ${userId} not found.`);
                }
            }
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}


//The product edit page loading function
const loadEditProduct = async (req, res) => {
    try {
        const brands=await Brand.find({})
        const productId = req.params.productId;
       
       
            const product = await Product.findById(productId)
            const category = await Category.find({})
            res.render('admin/editproduct', { product, category ,brands})
        
    } catch (error) {
        res.redirect('/admin/error')
    }
}


//The product updating function
const updateProduct = async (req, res) => {

    try {
        if (req.session.adminId) {
            const product_id = req.body.productid
            const product = await Product.findById(product_id)
            const productName = req.body.productName;
            const description = req.body.description;
            const description2 = req.body.description2;
            const regularPrice = req.body.regularPrice;
            const salePrice = req.body.salePrice;
            const productId = req.body.productId;
            const category = req.body.category;
            const Brand = req.body.brand;
            const tags = req.body.tags;
            const sizes = [];
            const size7 = {
                size: '7',
                quantity: req.body.QOS7 || 0
            };
            sizes.push(size7);

            const size8 = {
                size: '8',
                quantity: req.body.QOS8 || 0
            };
            sizes.push(size8);

            const size9 = {
                size: '9',
                quantity: req.body.QOS9 || 0
            };
            sizes.push(size9);

            const size10 = {
                size: '10',
                quantity: req.body.QOS10 || 0
            };
            sizes.push(size10);

            // Your existing size code...
            let Newimages = []
            req.files.forEach((image) => {
                Newimages.push(
                    image.path
                )
            })
           

            Newimages.forEach((image) => {
                product.images_url.push(
                    image

                )
            })

            // Update other product properties
            product.productName = productName;
            product.description = description;
            product.regularPrice = regularPrice;
            product.description2 = description2;
            product.salePrice = salePrice;
            product.category = category;
            product.Brand = Brand;
            product.tags = tags;
            product.sizes = sizes;
            await product.save();
            res.redirect('/admin'); // Redirect after successful update
        } else {
            res.redirect('/admin');
        }

    } catch (error) {
        res.redirect('/admin/error')
    }
}


const loadCategories = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        const msg = req.query.msg;
        if (msg == 'true') {

            
            res.render('admin/categories', { category: categoryData, msg: true });
        }else if(msg=='invalid'){
             
            res.render('admin/categories',{ category: categoryData, msg:'invalid' })
        }else{
            const categoryData = await Category.find({})

            res.render('admin/categories', { category: categoryData, msg: false });
        }

    } catch (error) {
        res.redirect('/admin/error')
    }
}


const addCategories = async (req, res) => {
    try {

        const categoryName = req.body.name.toUpperCase();
        const description = req.body.description;
        const type = req.body.type
        const catExistOrNot = await Category.find({ name: categoryName })
        
        const isWhitespace = /^\s*$/.test(categoryName);
        if(isWhitespace){
            res.redirect('/admin/categories?msg=invalid');
        }else if (catExistOrNot.length > 0) {

            res.redirect('/admin/categories?msg=true');

        } else {

            const category = new Category({
                name: categoryName,
                description: description,
                type: type
            });

            const categoryData = await category.save();
            if (categoryData) {
                res.redirect('/admin/categories?msg=false');
            }

        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const categoriestAction = async (req, res) => {
    try {
        const categoryId = req.params.categoryId
        const act = req.params.act

        if (act == 0) {
            const category = await Category.findByIdAndUpdate(categoryId, { status: false }, { new: true });
            await Product.updateMany({category:categoryId},{$set:{catstatus:false}})
            if (category) {
                res.redirect('/admin/categories');
            } else {

                res.status(404).send('Category not found');
            }
        } else if (act == 1) {
            const category = await Category.findByIdAndUpdate(categoryId, { status: true }, { new: true });
            await Product.updateMany({category:categoryId},{$set:{catstatus:true}})
            if (category) {
                res.redirect('/admin/categories');
            } else {

                res.status(404).send('Category not found');
            }
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}



const deleteImage = async (req, res) => {
    const productId = req.params.productId;
    const imageIndex = req.params.imageIndex;
  

    try {
        const product = await Product.findOne({ _id: productId });

        if (!product) {
            return res.status(200).send('Product not found');
        }

        if (!product.images_url || !Array.isArray(product.images_url)) {
            return res.status(500).send('Invalid image data for the product');
        }

        // Check if imageIndex is valid
        if (imageIndex >= 0 && imageIndex < product.images_url.length) {
            // Remove the image at imageIndex
            product.images_url.splice(imageIndex, 1);

            // Save the updated product
            const updated = await product.save();

            if (updated) {
                return res.redirect(`/admin/editproduct/${productId}`);
            } else {
                return res.status(500).send('Error updating product');
            }
        } else {
            return res.status(400).send('Invalid image index');
        }
    } catch (error) {
        
        res.redirect('/admin/error')
    }

};


const editCategoryLoad = async (req,res)=>{
    try {
        
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);
        const categoryData = await Category.find({})

        if(category){
            res.render('admin/editcategories',{category:categoryData,editcategory:category,msg: false})
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const updateCategory = async (req,res)=>{
    try {
         const categoryName = req.body.name.toUpperCase()
         const type = req.body.type;
         const description = req.body.description;
         const categoryId = req.params.categoryId;
         // Define the update operation
         const filter = { _id:categoryId  };
         const update = {
            $set: {
                name:categoryName,
                type: type,
                description: description
            }
        };
         const categoryCount = await Category.countDocuments({name:categoryName});
         const categoryData = await Category.find({})
         if(categoryCount>0){
            res.render('admin/categories', { category: categoryData, msg: true});  
         }else{
         
         const result = await Category.updateOne(filter, update);
  
        if(result){
            res.redirect('/admin/categories');
         }else{
               
            res.redirect('/admin/error')
         }
        }
         
    } catch (error) {
        res.redirect('/admin/error')
    }
}


const loadSalesReport =  async(req,res)=>{
    try {
        const orders=await Order.find({})
        .populate('products.productId')
        .populate('userId');
         
        res.render('admin/salesreport',{orders})

    } catch (error) {
        res.redirect('/admin/error')
    }
}

const salesSearch = async(req,res)=>{
    try {
        const start=req.body.start;
        const end= req.body.end;

        const orders = await Order.find({
            orderDate: {
                $gte: new Date(start), // Greater than or equal to the start date
                $lte: new Date(end)    // Less than or equal to the end date
            }
        })
        .populate('products.productId')
        .populate('userId');
        res.render('admin/salesreport', { orders,start,end});
    } catch (error) {
        res.redirect('/admin/error')
    }
}


const loadCoupons = async (req,res)=>{
    try {
        let msg = req.query.msg=='true'
        console.log(msg);
        const coupons = await Coupon.find({})
        res.render('admin/coupons',{coupons,msg})
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const addCoupon = async(req,res)=>{
    try {
        const couponCode = req.body.code.replace(/\s/g, '').trim().toUpperCase()
        const date = req.body.expirydate;
        let status    = req.body.status
        const discount    =req.body.discount;
        const AmountLimit =req.body.limit
        const description = req.body.description
        if(status=='Active'){
            status=true;
        }else{
            status=false;
        }
        const couponExist = await Coupon.find({couponcode:couponCode})
        
         if(couponExist.length>0){
            res.redirect(`/admin/coupons?msg=true`)
        }else{
        
        const coupon = new Coupon({
          couponcode:couponCode,
          discount:discount,
          status:status,
          limit:AmountLimit,
          expiryDate:date,
          description:description
        });

        const couponData = await coupon.save()
        if(couponData){
            res.redirect('/admin/coupons')
        }
    }
    } catch (error) {
        res.redirect('/admin/error')
    }
}

       
const loadEditCoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId;
        console.log(couponId);

        // Use findById with the correct syntax
        const coupons = await Coupon.findById(couponId);
       const coupon = await Coupon.find({})
      
        res.render('admin/editcoupons', { coupon,coupons,msg:false});
    } catch (error) {
        res.redirect('/admin/error')
    }
};


const updateCoupon = async (req,res)=>{
    try {
        const couponId = req.body.couponId
        let status=req.body.status;

        if(status=='Active'){
            status=true;
        }else{
            status=false;
        }
        const couponUpdate = {
            couponcode: req.body.code.toUpperCase(),
            expiryDate:req.body.expirydate,
            status:status,
            discount: req.body.discount,
            limit: req.body.limit,
            description:req.body.description
        };
        

       const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, couponUpdate, { new: true });
      if(updatedCoupon){
        res.redirect('/admin/coupons?msg=false')
      }else{
        res.redirect('/admin/error')
      }
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const loadBrands = async(req,res)=>{
    try {
        const brands = await Brand.find({})
        res.render('admin/brands',{brands})
    } catch (error) {
        res.redirect('/admin/error')
    }
}
const addBrand = async(req,res)=>{
    try {
        const name = req.body.name;
        let status= req.body.status;
        const image= req.files.map(file => file.path)
        const description = req.body.description
        if(status=='Active'){
            status=true
        }else{
            status=false
        }
        console.log(image);
        const newBrand = new Brand({
            name: name,
            status: status,
            image: image[0], // Assigning the images array to the 'images' property
            description: description
        });

        // Save the Brand document to the database
        const savedBrand = await newBrand.save();
        const brands = await Brand.find({})
        res.render('admin/brands',{brands})
        
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const brandAction = async (req,res)=>{
    try {
        const act = req.query.act;
        const id = req.query.id
        const brand = await Brand.findById({_id:id})
        if(act==0){
            await Product.updateMany({Brand:brand.name},{brandstatus:false})
         await Brand.findByIdAndUpdate({_id:id},{$set:{status:false}})
        }else{
            await Product.updateMany({Brand:brand.name},{brandstatus:true})
            await Brand.findByIdAndUpdate({_id:id},{$set:{status:true}})
        }
        
       
        res.redirect('/admin/brands')

    } catch (error) {
        res.redirect('/admin/error')
    }
}

const loadCatOffer= async(req,res)=>{
    try {
        const category=await Category.find({})
        res.render('admin/catoffer',{category,offcat:''})
    } catch (error) {
        res.redirect('/admin/error')
    }
}
const addCatOffer = async(req,res)=>{
    try {
        const catname = req.body.catname;
        const discount = parseInt(req.body.discount);
        let expiryDate = req.body.expirydate;
        const catId      =req.body.catId
        let status    = req.body.status;
        status = status === 'Active';
        if(expiryDate==''){
            expiryDate=Date.now()
          
        }
        await Category.updateOne({_id:catId},{$set:{discount:discount,expiryDate:expiryDate,offerstatus:status}})
        const products = await Product.find({ category: catId }).populate('category');
        
    for (const product of products) {
      if (product.category && product.category.expiryDate > new Date() && product.category.offerstatus==true) {
        const discountedPrice = product.salePrice - (product.salePrice * (product.category.discount || 0)) / 100;
        console.log(`Product: ${product.productName}, Discounted Price: ${discountedPrice}`);

        const updatedProduct = await Product.findByIdAndUpdate(
          product._id,
          { discountedPrice: discountedPrice },
          { new: true }
        );
       
      } else {
        const discountedPrice = product.salePrice - (product.salePrice * (product.category.discount || 0)) / 100;
        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            { $set: { discountedPrice: 0 } },
            { new: true }
        );
        
        console.log(`Product: ${product.productName}, Price: ${product.salePrice},discountedPrice:${discountedPrice}`);  
       
      }
    }
    res.redirect('/admin/catoffer')
  } catch (error) {
    res.redirect('/admin/error')
  }
};

const banners = async(req,res)=>{
    try {
        const banner = await Banner.find({})
        res.render('admin/banner',{banner})
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const addbanner = async(req,res)=>{
    try {
       
        const name = req.body.name;
        const image= req.files.map(file => file.path)
        const title1= req.body.title1;
        const title2 = req.body.title2;
        const title3 = req.body.title3;
        const title4 = req.body.title4;
        const newBanner = new Banner({
            name: name,
            image: image[0], // Assigning the images array to the 'images' property
            title1:title1,
            title2:title2,
            title3:title3,
            title4:title4
        });

        // Save the Brand document to the database
        const savedBanner = await newBanner.save()
        res.redirect('/admin/banner')
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const loadEditbanner=async(req,res)=>{
    try {
        const bannerId = req.query.bannerId;
        const editbanner = await Banner.findById(bannerId);
        const banners    = await Banner.find({})
        res.render('admin/editbanner',{banner:editbanner,banners})
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const updateBanner = async(req,res)=>{
    try {
        const bannerId = req.body.Id
        const name = req.body.name;
        const image= req.files.map(file => file.path)
        const title1= req.body.title1;
        const title2 = req.body.title2;
        const title3 = req.body.title3;
        const title4 = req.body.title4;
        const updatedBannerData = {
            name: name,
            title1: title1,
            title2: title2,
            title3: title3,
            title4: title4,
            image: image[0], // Update image path if needed
        };
        await Banner.findByIdAndUpdate(bannerId,updatedBannerData)
        res.redirect('/admin/banner')
    } catch (error) {
       
        res.redirect('/admin/error')
    }
}

const loadusermsg =async(req,res)=>{
    try {

        const msgs = await Usermsg.find({}) 
        res.render('admin/usermsg',{msgs})

    } catch (error) {
        res.redirect('/admin/error');
    }
}

const deleteMsg= async(req,res)=>{
    try {
        
        const Id = req.query.Id;
        await Usermsg.findByIdAndDelete(Id)

        res.redirect('/admin/usermsgs')
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const loadSettings = async(req,res)=>{
    try {
        const msg = req.query.msg
        const admin = await Admin.findOne({})
        if(msg){
            res.render('admin/settings',{admin,msg:msg})
        }else{
            res.render('admin/settings',{admin,msg:''})
        }
      
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const saveChanges = async(req,res)=>{
    try {
        const id = req.body.Id;
        const updatedFields = {
            name: req.body.name,
            DOB: req.body.DOB,
            email: req.body.email,
            phone: req.body.phone
           
        };

      
        const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedAdmin) {
            return res.status(404).send('Admin not found');
        }

    
        res.redirect('/admin/settings?msg=Password Changed'); 
        

    } catch (error) {
        res.redirect('/admin/error')
    }
}

const error = async(req,res)=>{
    try {
        res.render('admin/404')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    adminLogin,
    adminLogout,
    loadUserList,
    loadProductForm,
    addProduct,
    loadProductlist,
    userAction,
    productAction,
    loadEditProduct,
    updateProduct,
    loadCategories,
    addCategories,
    categoriestAction,
    deleteImage,
    editCategoryLoad,
    updateCategory,
    loadSalesReport,
    salesSearch,
    loadCoupons,
    addCoupon,
    loadEditCoupon,
    updateCoupon,
    loadBrands,
    addBrand,
    brandAction,
    loadCatOffer,
    addCatOffer,
    banners,
    addbanner,
    loadEditbanner,
    updateBanner,
    loadusermsg,
    deleteMsg,
    forgotStep1,
     sendOtp,
     verifyOTP,
     changePass,
     loadSettings,
     saveChanges,
     error

   
}