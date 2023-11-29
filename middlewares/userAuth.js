const User = require('../models/userModel');
const Swal = require('sweetalert2')

const isBlocked = async(req,res,next)=>{
    try {
    if(req.session.userId){  
        const user = await User.findById(req.session.userId)
        if(user.is_active){
            
            next();
           
        }else{
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/login'); // Redirect to a different route after destroying the session
                }})
              

            
        }
    }else{
        next()

    }     
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home');
            return;
        }
        next()
     
    } catch (error) {
        console.log(error.message);
    }
}

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.userId){
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}




module.exports={
    isBlocked,
    isLogout,
    isLogin
    
}