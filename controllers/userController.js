const User = require('../models/userModel');
// const { render } = require('../routes/userRoute');
const Product = require('../models/productModel');
const validator = require('validator');
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');
const sweet = require('../public/assets/js/userValidate');
const Order = require('../models/orderModel')
const Brand = require('../models/BrandModel');
const nodemailer = require('nodemailer')
const Banner     = require('../models/bannerModel')
const Usermsg    = require('../models/usermsgModel');
// const { readInt16 } = require('pdfkit/js/data');
require('dotenv').config();

const ITEMS_PER_PAGE = 12;
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user:process.env.EMAIL,
        pass:process.env.PASS,
    },
});

// loading registration page
const loadRegister = async (req, res) => {
    try {

        res.render('users/page-login-register', { message: '' });

    } catch (error) {
        res.redirect('/error')
    }
}

// inserting new member function(we are not importing it)
const insertUser = async (req, res, name, email, phone, password) => {
    try {

        const lowerCaseEmail = email.toLowerCase();

        const user = new User({
            name,
            email: lowerCaseEmail, // Use the lowercase email
            phone,
            password
        });
        const userData = await user.save();

        // const newCart = await Cart.create({
        //     userId: userData._id
        //     // Add any necessary cart properties
        // });
        return userData; // Return the saved user data
    }

    catch (error) {
        res.redirect('/error');
    }
}


let isOtpVerified = true; // Initialize flag to false
const OTP_TIMEOUT = 60 * 1000;

const getSendOtp = async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email.toLowerCase()
        const phone = req.body.phone
        const password = req.body.password
        const user = await User.find({ email: email })
        const isValid = validator.isEmail(email);
        // const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|\w+\.\w+|com|in|org|gmail)$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

       

        if (isValid && email.match(emailRegex)) {
            if (user.length > 0 && user[0].email == email) {
                res.render('users/page-login-register', { message: '.' })
            } else {

                const randomOTP = Math.floor(1000 + Math.random() * 9000);
                

                const mailOptions = {
                    from: 'athultv702@gmail.com',
                    to: email,
                    subject: 'Hello,THE SHOE RACK!!',
                    text: `Your verification OTP is ${randomOTP}`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                       res.redirect('/error')(error);
                    } else {
                        console.log(`Email is send with verification code ${randomOTP}`, info.response);
                    }
                })
                req.session.OTP = randomOTP
                res.render('users/otp', { name, email, phone, password })
                console.log(req.session.OTP);
                setTimeout(() => {
                    if (isOtpVerified) {
                        req.session.OTP = null;
                        isOtpVerified = false;
                        console.log('time out over');
                    }
                }, OTP_TIMEOUT);
            }
        } else {
            res.render('users/page-login-register', { message: 'invalid email' })
        }
    } catch (err) {
        res.redirect('/error')
    }
};



// validating the otp and saving the person to database(using the insetUser method),rendering login page.
const verifyOTP = async (req, res) => {
    try {
        const otp = req.body.otp
        const phoneNumber = req.body.phone;
        const orginalOTP = req.session.OTP
       
        if (isOtpVerified) {
            if (otp == orginalOTP) {

                // Calling the insertUser function to save user data
                const userData = await insertUser(
                    req, res,
                    req.body.name,
                    req.body.email,
                    req.body.phone,
                    req.body.password
                );

                res.render('users/login', { message: '' });
            } else {
                res.render('users/page-login-register', { message: 'Registration failed' });
            }
        } else {
            isOtpVerified = false;
            res.render('users/page-login-register', { message: 'Invalid OTP' });

        }
    } catch (err) {
       
        res.render('users/page-login-register', { message: 'Error occurred during OTP verification' });
    }
}

//resending the otp 
const resendOTP = async (req, res) => {
    try {
        const phone = req.query.phone; // Assuming phone number is sent via query parameter
        const email = req.query.email;
        const name = req.query.name;
        const password = req.query.password;

        if (phone) {
            // Send a new OTP
            const randomOTP = Math.floor(1000 + Math.random() * 9000);

           

            const mailOptions = {
                from: 'athultv702@gmail.com',
                to: email,
                subject: 'Hello, THE SHOE RACK!!',
                text: `Your verification OTP is ${randomOTP}`
            };

            // Sending email asynchronously
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                   
                    res.status(500).send({ success: false, message: 'Error sending email' });
                } else {
                    console.log(`Email is sent with verification code ${randomOTP}`, info.response);

                    // Update session OTP
                    req.session.OTP = randomOTP;
                    console.log('re-randomOTP' + randomOTP);
                    isOtpVerified = true;
                    setTimeout(() => {
                        if (isOtpVerified) {
                            req.session.OTP = null;
                            isOtpVerified = false;
                            console.log('Timeout over');
                        }
                    }, OTP_TIMEOUT);

                    // Render OTP page after sending email and setting timeout
                    res.render('users/otp', { name, email, phone, password });
                }
            });
        } else {
            res.status(400).send({ success: false, message: 'Invalid phone number' });
        }
    } catch (error) {
        res.redirect('/error')
    }
};


//user login 
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const orgEmail = email.toLowerCase()
        const user = await User.findOne({ email: orgEmail });
        const categoryData = await Category.find({})
        const brands = await Brand.find({ status: true })
        const banner = await Banner.find({})
        if (!user) {
            res.render('users/login', { message: 'User not found' })
        } else {
            if (user.is_active) {

                if (user.password == password) {
                    req.session.userId = user._id;
                    const userId = user._id
                    const productsData = await Product.find({ brandstatus: true, is_active: true, catstatus: true }).populate('category').populate('Brand')
                    const userCart = await Cart.findOne({ userId: userId }).populate('productId');
                    res.render('users/home', { products: productsData, user: user, cart: userCart,banner, category: categoryData, brands, msg: '1' }
                    );
                } else {
                    res.render('users/login', { message: 'Invalid Password' })
                }

            } else {
                res.render('users/login', { message: 'Your Account Is Blocked' })
            }
        }
    } catch (error) {
        res.redirect('/error')
    }
}

//home loading function
const home = async (req, res) => {
    try {
        const userId = req.session.userId
        const user = await User.findById(req.session.userId);
        const productsData = await Product.find({ brandstatus: true, is_active: true, catstatus: true }).sort({ date: -1 }).populate('category')
        const categoryData = await Category.find({})
        const brands = await Brand.find({ status: true })
        const banner = await Banner.find({})
        const userCart = await Cart.findOne({ userId: userId }).populate('productId');
        if (userCart) {
            res.render('users/home', { brands, products: productsData, user: user, cart: userCart, category: categoryData,banner,msg: '1' })
        } else {
            const userCart = 0;
            res.render('users/home', { brands, products: productsData, user: user, cart: userCart, category: categoryData,banner, msg: '1' })
        }
    } catch (error) {
        res.redirect('/error')
    }
}

//The home load function  but its not exporiting (using inside userController)
const loadHome = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const productsData = (await Product.find({ brandstatus: true, is_active: true, catstatus: true })).populate('category')
        const categoryData = await Category.find({})
        const userId = req.session.userId
        const brands = await Brand.find({ status: true })
        const banner = await Banner.find({})
        if (user.is_active) {
            if (req.session.userId) {

                const userCart = await Cart.find({ userId: userId }).populate('productId');
                console.log(userCart);
                if (userCart) {
                    res.render('users/home', { brands, products: productsData, user: user, cart: userCart, category: categoryData,banner, msg: '1' })
                } else {
                    const userCart = 0;
                    res.render('users/home', { brands, products: productsData, user: user, cart: userCart, category: categoryData,banner, msg: '1' })
                }
            } else {
                // res.render('users/login',{message:''})


                res.render('users/home', { brands, products: productsData, user: user, category: categoryData,banner, msg: '1' })
            }
        } else {
            res.render('users/login', { message: 'Your Account Is Blocked' })
        }
    } catch (error) {
        res.redirect('/error')
    }
}


//The user loginform loading function
const loadLogin = async (req, res) => {
    try {
        
        if (req.session.userId) {
           
            home(req, res)
        } else {
            res.render('users/login', { message: '' })
        }
    } catch (error) {
        res.redirect('/error')
    }
}


//the user loagout function
const userLogout = async (req, res) => {
    try {

        if (req.session.userId) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/'); // Redirect to a different route after destroying the session
                }
            });
        } else {
            res.redirect('/');
        }

    } catch (error) {
        res.redirect('/error')
    }
}

//loadning the product details view function
const getProductDetails = async (req, res) => {
    try {
        const userId = req.session.userId
        const productId = req.params.productId;
        const products = await Product.findById(productId)
        .populate('category')
        .populate({
          path: 'reviews',
          populate: {
            path: 'customerId',
            model: 'User'
          }
        });
        let averageRating = 0;
        if (products.reviews.length > 0) {
            const totalRating = products.reviews.reduce((acc, review) => acc + review.rating, 0);
            averageRating = totalRating / products.reviews.length;
        }
        
        const brands = await Brand.find({ status: true })
        const user = await User.findById(req.session.userId)
        const cart = await Cart.findOne({ userId: userId }).populate('productId');
        const category = await Category.find({})
        const relatedProducts = await Product.find({ category: products.category })
        if (req.session.userId) {
            if (products) {
                res.render('users/productdetails', { avg:averageRating, products, user, cart, category, relProducts: relatedProducts, brands });
            } else {
                res.render('users/error', { message: 'Product not found' });
            }
        } else {
            res.render('users/productdetails', {avg:averageRating, products, user, cart, category, relProducts: relatedProducts, brands });
        }
    } catch (error) {
        res.redirect('/error')
    }
}

const loadAccount = async (req, res) => {
    try {
       
        const userId = req.session.userId
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('productId');
        const order = await Order.find({ userId: userId })
            .sort({ orderDate: -1 }) // Sort by orderDate in descending order for latest first
            .populate('products.productId');
       
            res.render('users/account', { user, category, cart, order, msg: false})
        
      

    } catch (error) {
        res.redirect('/error')
    }
}



const searchResults = async (req, res) => {
    try {
        const brands = await Brand.find({ status: true })
        const searchTerm = req.body.search;
        const cat = req.body.cat;
        const catId = await Category.findById(cat);
        const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive search
        const matchingProducts = await Product.find({ brandstatus: true, is_active: true, catstatus: true, productName: regex, category: catId._id })

        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        res.render('users/searchresults', { brands, products: matchingProducts, user, category, msg: searchTerm });


    } catch (error) {
        res.redirect('/error')
    }
}

const searchSorting = async (req, res) => {
    try {
        const by = req.query.by;
        const searchTerm = req.query.searchTerm;
        const cat = req.query.cat;
        const brands = await Brand.find({ status: true })
        const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive search

        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        if (by) {
            if (by > 0) {
                const matchingProducts = await Product.find({ brandstatus: true, brandstatus: true, is_active: true, catstatus: true, productName: regex, category: cat }).sort({ salePrice: 1 })
                res.render('users/searchresults', { brands, products: matchingProducts, user, category: category, msg: searchTerm });
            } else {
                const matchingProducts = await Product.find({ brandstatus: true, brandstatus: true, is_active: true, catstatus: true, productName: regex, category: cat }).sort({ salePrice: -1 })
                res.render('users/searchresults', { brands, products: matchingProducts, user, category: category, msg: searchTerm });
            }
        } else {

            res.render('users/searchresults', { brands, products: matchingProducts, user, category: cat, msg: searchTerm });
        }



    } catch (error) {
        res.redirect('/error')
    }
}

const brandSearch = async (req, res) => {
    try {
        const by = req.query.by
        const brands = await Brand.find({ status: true })
        const brand = req.query.brand
        console.log(brand);
        const products = await Product.find({ Brand: brand }).populate('category')
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})

        if (by) {
            if (by > 0) {
                const products = await Product.find({ brandstatus: true, is_active: true, catstatus: true, Brand: brand }).sort({ salePrice: 1 })
                res.render('users/searchresults', { brands, products: products, user, category, msg: 'frombrand' });
            } else {
                const products = await Product.find({ brandstatus: true, is_active: true, catstatus: true, Brand: brand }).sort({ salePrice: -1 })
                res.render('users/searchresults', { brands, products: products, user, category, msg: 'frombrand' });
            }
        } else {
            res.render('users/searchresults', { brands, products: products, user, category, msg: 'frombrand' });
        }


    } catch (error) {
        res.redirect('/error')
    }
}

const loadForgotPassword = async (req, res) => {
    try {

        res.render('users/forgotpass', { message: false });

    } catch (error) {
        res.redirect('/error')
    }
}


const sendForgotOTP = async (req, res) => {
    try {
        const email = req.body.email
        const emailExist = await User.find({ email: email })
        const phoneNumber = emailExist[0].phone
        if (emailExist.length > 0) {
            const randomOTP = Math.floor(1000 + Math.random() * 9000);

           

            const mailOptions = {
                from: 'athultv702@gmail.com',
                to: email,
                subject: 'Hello, THE SHOE RACK!!',
                text: `Your verification OTP is ${randomOTP}`
            };

            // Sending email asynchronously
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ success: false, message: 'Error sending email' });
                } else {
                    console.log(`Email is sent with verification code ${randomOTP}`, info.response);

                    // Update session OTP
                    req.session.OTP = randomOTP;
                    console.log('re-randomOTP' + randomOTP);
                    isOtpVerified = true;
                    setTimeout(() => {
                        if (isOtpVerified) {
                            req.session.OTP = null;
                            isOtpVerified = false;
                            console.log('Timeout over');
                        }
                    }, OTP_TIMEOUT);
                }
                // Render OTP page after sending email and setting timeout

                res.render('users/forgotpass2', { phone: phoneNumber, email: email, msg: false })
            })
        } else {
            console.log(emailExist);
            res.render('users/forgotpass', { message: true })
        }

    } catch (error) {

        res.render('users/forgotpass', { message: `Cant't send OTP right now try after some time` })
       
    }
}

const resendForgotOTP = async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.find({ email: email })
        const phone = user[0].phone
        if (phone) {
            // Send a new OTP
            const randomOTP = Math.floor(1000 + Math.random() * 9000);
            req.session.OTP = randomOTP;
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: "athultv702@gmail.com",
                    pass: "rqid jdxy kvmg irnq",
                },
            });
            console.log(email);
            const mailOptions = {
                from: 'athultv702@gmail.com',
                to: email,
                subject: 'Hello, THE SHOE RACK!!',
                text: `Your verification OTP is ${randomOTP}`
            };

            // Sending email asynchronously
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ success: false, message: 'Error sending email' });
                } else {
                    console.log('re-randomOTP' + randomOTP);
                    console.log(`resent with verification code ${randomOTP}`, info.response);

                    // Update session OTP

                    isOtpVerified = true;
                    setTimeout(() => {
                        if (isOtpVerified) {
                            req.session.OTP = null;
                            isOtpVerified = false;
                            console.log('Timeout over');
                        }
                    }, OTP_TIMEOUT);
                }
            })
            // res.send({ success: true, message: 'OTP resent successfully' });
            res.render('users/forgotpass2', { phone: phone, email: email, msg: false })
        } else {
            res.status(400).send({ success: false, message: 'Invalid phone number' });
        }

    } catch (error) {
        res.redirect('/error')
    }
}

const verifyResendOTP = async (req, res) => {
    try {

        const email = req.body.email
        const otp = req.body.otp;
        const phoneNumber = req.body.phone;
        const orginalOTP = req.session.OTP
        console.log(orginalOTP, otp, isOtpVerified);
        if (otp == orginalOTP && isOtpVerified) {
            isOtpVerified = true;
            // Calling the insertUser function to save user data
            const userData = await User.find({ email: email })

            console.log('good');
            if (userData) {
                res.render('users/changepass', { email: email });
            } else {
                res.render('users/forgotpass2', { phone: phoneNumber, email: email, msg: true })
            }
        } else {
            console.log('baad');
            isOtpVerified = false;
            res.render('users/forgotpass2', { phone: phoneNumber, email: email, msg: true });

        }
    } catch (error) {
        res.redirect('/error')
    }
}

const changePassword = async (req, res) => {
    try {
        const email = req.body.email;
        const newPassword = req.body.newPassword;
        const user = await User.findOne({ email: email });

        if (user) {
            console.log('hello');
            // Update the password field in the user document
            user.password = newPassword;

            // Save the updated user document
            await user.save();
            req.session.userId = user._id;
            if (req.session.userId) {
                res.redirect('/')
            } else {
                res.redirect('/login')
            }

        } else {
            res.send({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.redirect('/error')
    }
};


//cart works-----------------------------------------------

const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const quantity = req.body.selectedQuantity;
        const size = req.body.selectedSize;
        const productId = req.body.productId;
        
        const cartItem = {
            userId: userId,
            productId: productId,
            quantity: quantity,
            size: size
        };

        const cart = await Cart.create(cartItem);
        res.redirect('/shopcart');
    } catch (error) {
        res.redirect('/error')
    }
};

const loadCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findById(userId);
        const categoryData = await Category.find({});

        if (req.session.userId) {
            const userId = req.session.userId;

            // Assuming you have a function to fetch the cart for a specific user
            const userCart = await Cart.find({ userId:userId })
            .populate('productId')
            .populate({
                path: 'productId',
                populate: {
                    path: 'category',
                    model: 'Category'
                }
            });
          
            // Render the EJS template with the cart data
            res.render('users/shopcart', { user: userData, category: categoryData, cart: userCart });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        res.redirect('/error')
    }
};


const removeCartProduct = async (req, res) => {
    try {
        const cartId = req.query.productId;
        const userId = req.session.userId;
        const indexOfProduct = req.query.index;

        const userCart = await Cart.findByIdAndDelete(cartId);

        res.redirect('/shopcart');
    } catch (error) {
        res.redirect('/error')
    }
}

const getAddressForm = async (req, res) => {
    try {


        res.render('users/addressform')


    } catch (error) {
        res.redirect('/error')
    }
}

const addAddress = async (req, res) => {
    try {
        const from   = req.query.from;
        const userId = req.session.userId
        const addressname = req.body.addressname
        const name = req.body.name
        const lname = req.body.lname
        const phone = req.body.phone
        const city = req.body.city
        const pincode = req.body.pincode
        const landmark = req.body.landmark
        const house = req.body.house
        const road = req.body.road
        const description = req.body.description
        const country = req.body.country
        const user = await User.findById(userId);
        if (user) {

            const newAddress = {
                addressName: addressname,
                fname: name,
                lname: lname,
                phone: phone,
                city: city,
                pincode: pincode,
                landmark: landmark,
                house: house,
                road: road,
                country: country,
                description: description
            };
            user.address.push(newAddress);

            await user.save();
            if(from=='checkout'){
                res.redirect('/checkout')
            }else{
                res.redirect('/useraccount')
            }
           

        }
    } catch (error) {
        res.redirect('/error')
    }
}

const loadEditAddress = async (req, res) => {
    try {
        const i = req.query.i
        const act = req.query.act;
        const userId = req.session.userId
        const user = await User.findById(userId)
        if (act == 0) {
            user.address.splice(i, 1);
            await user.save();
            res.redirect('/useraccount')
        } else {
            res.render('users/editaddress', { user: user, i })
        }
    } catch (error) {
        res.redirect('/error')
    }
}

const updateAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const i = req.body.i; // Index of the address
        const user = await User.findById(userId);
        console.log(i);
        if (user) {
            const updatedAddress = {
                addressName: req.body.addressname,
                fname: req.body.name,
                lname: req.body.lname,
                phone: req.body.phone,
                city: req.body.city,
                pincode: req.body.pincode,
                landmark: req.body.landmark,
                house: req.body.house,
                road: req.body.road,
                country: req.body.country,
                description: req.body.description
            };
            user.address[i] = updatedAddress; // Update the address at index i
            await user.save();
            res.redirect('/useraccount');
        }
    } catch (error) {
        res.redirect('/error')
    }
}

const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.userId
        const productId = req.query.productId
        const wishItem = { productId: productId };
        const userWishlist = await Wishlist.findOne({ userId: userId });
        const user = User.findById(userId)
        const brands = await Brand.find({ status: true })
        const banner = await Banner.find({})
        if (userWishlist && userWishlist.products.some(item => item.productId.toString() === productId.toString())) {



            const user = await User.findById(req.session.userId);
            const productsData = await Product.find({}).populate('category')
            const categoryData = await Category.find({})
            const userId = req.session.userId
            const userCart = await Cart.findOne({ userId: userId }).populate('productId');
            res.render('users/home', { brands, products: productsData, user: user, cart: userCart, category: categoryData,banner, msg: '0' })
           

        } else {
            const wishlist = await Wishlist.findOneAndUpdate(
                { userId: userId },
                { $push: { products: wishItem } },
                { upsert: true, new: true }
            );

            res.redirect('/');
        }

    } catch (error) {
        res.redirect('/error')
    }
}

const loadWishlist = async (req, res) => {

    try {
        const userId = req.session.userId;
        const userData = await User.findById(userId)
        const categoryData = await Category.find({})
        if (req.session.userId) {
            const userId = req.session.userId;

            // Assuming you have a function to fetch the cart for a specific user
            const wishlist = await Wishlist.findOne({ userId: userId }).populate('products.productId')


            // Render the EJS template with the cart data

            res.render('users/wishlist', { user: userData, category: categoryData, wishlist })
        }

    } catch (error) {
        res.redirect('/error')
    }
}


const removeWishlistProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        const userId = req.session.userId;
        const indexOfProduct = req.query.index;

        const wishlist = await Wishlist.findOne({ userId: userId });

        // Find the index of the product in the cart
        if (indexOfProduct !== -1) {
            // Remove the product from the cart using the provided index
            wishlist.products.splice(indexOfProduct, 1);

            // Save the updated cart
            await wishlist.save();
        }

        // Redirect or send a response back as needed
        res.redirect('/wishlist');
    } catch (error) {
        res.redirect('/error')
    }
}
const categorySearch = async (req, res) => {
    try {
        const userId = req.session.userId
        const categoryName = req.query.catId;
        const by = req.query.by
        const products = await Product.find({ category: categoryName })
        const category = await Category.find({})
        const user = await User.findById(userId)
        
        const brands = await Brand.find({ status: true })
        if (by) {
            if (by > 0) {
                const products = await Product.find({ category: categoryName }).sort({ salePrice: 1 })
                res.render('users/searchresults', { brands, products: products, user, category, msg: 'fromcat' })
            } else {
                const products = await Product.find({ category: categoryName }).sort({ salePrice: -1 })
                res.render('users/searchresults', { brands, products: products, user, category, msg: 'fromcat' });
            }
        } else {
            res.render('users/searchresults', { brands, products: products, user, category, msg: 'fromcat' });
        }



    } catch (error) {
        res.redirect('/error')
    }
}


const sorting = async (req, res) => {
    try {
        const by = req.query.by
        const page = parseInt(req.query.page) || 1;
        const userId = req.session.userId
        const start = parseInt(req.query.start);
        const end = parseInt(req.query.end);
        const user = await User.findById(userId)
        const category = await Category.find({})
        const brands = await Brand.find({ status: true })


        if (by) {
            if (by > 0) {
                sortCriteria = { salePrice: 1 }; // Sort by salePrice in ascending order (low to high)
            } else if (by < 0) {
                sortCriteria = { salePrice: -1 }; // Sort by salePrice in descending order (high to low)
            }
            var products = await Product.find({ brandstatus: true, catstatus: true, is_active: true })
                .populate('category')
                .sort(sortCriteria)
                .skip((page - 1) * ITEMS_PER_PAGE) // Skip the specified number of documents based on the current page
                .limit(ITEMS_PER_PAGE); // Limit the number of documents retrieved per page
            const totalProductsCount = await Product.countDocuments({ is_active: true, catstatus: true, brandstatus: true });
            res.render('users/mainshop', {
                brands,
                products,
                user,
                category, msg: 'fromhome',
                currentPage: page,
                totalPages: Math.ceil(totalProductsCount / ITEMS_PER_PAGE)
            })
        } else {

            if (end != 0) {
                var products = await Product.aggregate([
                    {
                        $match: {
                            "salePrice": { $gte: start, $lte: end },
                            "is_active": { $eq: true },
                            "brandstatus": { $eq: true },
                            "catstatus": { $eq: true }
                        }
                    },
                    {
                        $sort: {
                            "salePrice": 1 // Sort by salePrice in ascending order
                        }
                    },
                    {
                        $skip: (page - 1) * ITEMS_PER_PAGE // Skip documents based on the current page
                    },
                    {
                        $limit: ITEMS_PER_PAGE // Limit the number of documents retrieved per page
                    }
                ])
                res.render('users/mainshop', {
                    brands,
                    products: products,
                    user,
                    category,
                    msg: 'fromhome',
                    currentPage: page,
                    // Calculate totalPages based on the total count of matched products within the price range
                    totalPages: Math.ceil(products.length / ITEMS_PER_PAGE)
                })
            } else {
                var products = await Product.find({ salePrice: { $gt: start }, brandstatus: true, catstatus: true, is_active: true })
                    .skip((page - 1) * ITEMS_PER_PAGE) // Skip the specified number of documents based on the current page
                    .limit(ITEMS_PER_PAGE); // Limit the number of documents retrieved per page
                res.render('users/mainshop', {
                    brands, products: products, user, category, msg: 'fromhome',
                    currentPage: page,
                    // Calculate totalPages based on the total count of matched products within the price range
                    totalPages: Math.ceil(products.length / ITEMS_PER_PAGE)
                })
            }
        }

    } catch (error) {
        res.redirect('/error')
    }
}

const updateQuantity = async (req, res) => {
    try {
        const cartId = req.body.cartId;
        const newQuantity = req.body.newQuantity;
       
        // Update the quantity based on productId and userId (if applicable)
        const updatedCart = await Cart.findOneAndUpdate(
            {
                _id: cartId
            },
            { quantity: newQuantity }, // Update the quantity field
            { new: true }
        );
        res.redirect('/shopcart')
    } catch (error) {
        res.redirect('/error')
    }
}



const pagination = async (req, res) => {
    try {
        const brands = await Brand.find({ status: true })
        const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
        const userId = req.session.userId;
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const products = await Product.find({ brandstatus: true, is_active: true, catstatus: true })
            .populate('category')
            .skip((page - 1) * ITEMS_PER_PAGE) // Skip the specified number of documents based on the current page
            .limit(ITEMS_PER_PAGE); // Limit the number of documents retrieved per page

        const totalProductsCount = await Product.countDocuments({ is_active: true, catstatus: true, brandstatus: true }); // Total number of products

        res.render('users/mainshop', {
            products: products,
            currentPage: page,
            brands,
            user, category, msg: '',
            totalPages: Math.ceil(totalProductsCount / ITEMS_PER_PAGE)
        });
    } catch (error) {
        res.redirect('/error')
        

    }
};

//add product review......
const addReview = async (req, res) => {
    try {
        const userId    = req.session.userId
        const productId = req.params.productId;
        const comment    = req.body.comment;
        const rating    = req.body.rating;
        
        const newReview = {
            comment: comment,
            rating: rating,
            customerId: userId
          };
      
       
          const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $push: { reviews: newReview } },
            { new: true } 
          );
        const product = await Product.findById(productId);
        const reviews = product.reviews;
        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRatings / reviews.length;

        // Update the product's avgrating field
        await Product.findByIdAndUpdate(
            productId,
            { $set: { avgrating: averageRating } }
        );
          res.redirect(`/productdetails/${productId}`)
      
    } catch (error) {
        res.redirect('/error')
    }
}

const PageNotFound = async(req,res)=>{
    try {
        const msg= req.query.msg

        if(msg){
            res.render('users/404',{msg:true})
        }else{
            res.render('users/404',{msg:false})
        }
       
    } catch (error) {
        res.render('users/404')
    }
}

const uploadUserImg = async(req,res)=>{
    try {
        
        const image= req.files.map(file => file.path)
        const userId = req.session.userId
        await User.findByIdAndUpdate(userId,{$set:{image:image[0]}})
        
        res.redirect('/useraccount')
    } catch (error) {
        console.log(error.message);
        res.redirect('/error')
    }
}

const loadContact = async(req,res)=>{
    try {
        res.render('users/contact')
    } catch (error) {
        res.redirect('/error')
    }
}

const addMsg = async(req,res)=>{
    try {
        
        const userId=req.session.userId
        const email =req.body.email;
        const phone =req.body.phone;
        const name  =req.body.name;
        const msg   =req.body.msg;
        const sub   =req.body.sub
        
        const newUserMsg = new Usermsg({
            userId: userId, 
            email: email,
            phone: phone,
            name: name,
            msg: msg,
            sub: sub
        });

        console.log(msg);
    
        
        await newUserMsg.save();
        
        res.redirect('/contact')
       
    } catch (error) {
        res.redirect('/error')
    }
}

const loadGuide = async(req,res)=>{
    try {
        const userId = req.session.userId
        const user   = await User.findById(userId)
        const category = await Category.find({})
        res.render('users/purchaseguide',{user,category})
    } catch (error) {
        res.redirect('/error')
    }
}

const loadAbout = async(req,res)=>{
    try {
        const brands= await Brand.find({status:true})
        const user = await User.findById(req.session.userId)
        const category = await Category.find({status:true})
        const banner = await Banner.find({}).skip(7)
        res.render('users/about',{banner,user,category,brands})
    } catch (error) {
        res.redirect('/error')
    }
}
const updateUser = async(req,res)=>{
    try {
        const userId = req.session.userId
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const user = await User.findById(userId); // Replace 'User' with your actual User model

       

       
        user.name = req.body.name;
        user.email = req.body.email;
        user.phone = req.body.phone;

        
        await user.save();

        
        res.redirect('/useraccount');

    } catch (error) {
        res.redirect('/error')
    }
}

const changePass = async (req, res) => {
    try {
        const userId = req.session.userId;
        const oldPass = req.body.oldpass;
        const newPass = req.body.newpass;
        const user = await User.findById(userId);

        if (user.password === oldPass) {
            user.password = newPass;
            await user.save();
            res.redirect('/useraccount');
        } else {
            // If the old password is incorrect, redirect with an error message
            res.redirect('/error?msg=IncorrectOldPassword');
        }
    } catch (error) {
        res.redirect('/error');
    }
};

const loadPolicy = async(req,res)=>{
    try {
        const banner = await Banner.find({}).skip(7)
        const category = await Category.find({status:true})
        const user = await User.findById(req.session.userId)
        res.render('users/policy',{user,category,banner})

    } catch (error) {
        res.redirect('/error')
    }
}

const loadTerms = async(req,res)=>{
    try {
        const banner = await Banner.find({}).skip(7)
        const category = await Category.find({status:true})
        const user = await User.findById(req.session.userId)
        res.render('users/terms',{user,category,banner})

    } catch (error) {
        res.redirect('/error')
    }
}

module.exports = {
    loadRegister,
    getSendOtp,
    verifyOTP,
    userLogin,
    loadLogin,
    userLogout,
    getProductDetails,
    loadHome,
    home,
    resendOTP,
    loadAccount,
    searchResults,
    brandSearch,
    loadForgotPassword,
    sendForgotOTP,
    resendForgotOTP,
    verifyResendOTP,
    changePassword,
    loadCart,
    addToCart,
    removeCartProduct,
    getAddressForm,
    addAddress,
    loadEditAddress,
    updateAddress,
    addToWishlist,
    loadWishlist,
    removeWishlistProduct,
    categorySearch,
    sorting,
    searchSorting,
    updateQuantity,
    pagination,
    addReview,
    PageNotFound,
    uploadUserImg,
    loadContact,
    addMsg,
    loadGuide,
    loadAbout,
    updateUser,
    changePass,
    loadPolicy,
    loadTerms
}