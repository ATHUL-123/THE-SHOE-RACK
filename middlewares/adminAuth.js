const Admin = require('../models/adminModel');
const isLogin =async(req,res,next)=>{
    try {
        if(req.session.adminId){
            
            next();
        }else{
           
            res.redirect('/admin')
        }
       ;
    
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout=async(req,res,next)=>{
    try {
        if(req.session.adminId){
            res.redirect('/admin');
            
        }else{
            next();
        }
       
        
    } catch (error) {
        console.log(error.message);
    }
}



module.exports ={
    isLogin,
    isLogout
}