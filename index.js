const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://athultv702:Athul123@cluster0.z0i1vts.mongodb.net/test");
const express=require("express")
const path =require('path')
const app =  express();
require('dotenv').config();

const discountExpiryCron = require('./others/discountExpiryCron');
// twilio settings for otp
// const accountSid = 'ACb052f7e19184a10faa884455b275a779';
// const authToken = '1ea28cd24c8846f6755234f40fdd620c';
// const twilio = require('twilio')(accountSid, authToken);
const session=require('express-session')
app.use(express.static(path.join(__dirname,'public')));

// multer settings
const multer = require('multer');
app.use("/uploads",express.static('uploads'));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);                          //updation required  == add date.........
  },
});
const upload=multer({storage:storage})
//for control the back button working
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

//session middleware
app.use(session({
    secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true
}));


//The route settings of user & admin
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)


const PORT = process.env.PORT || 7000

// The port listening
app.listen(PORT,()=>{
    console.log(`server is rinnung on the port ${process.env.PORT}`);
});