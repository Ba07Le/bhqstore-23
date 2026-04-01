require('dotenv').config()
const jwt=require('jsonwebtoken')
const { sanitizeUser } = require('../utils/SanitizeUser')

exports.verifyToken=async(req,res,next)=>{
    try {
       
        const {token}=req.cookies

        
        if(!token){
            return res.status(401).json({message:"Mã đăng nhập bị thiếu, vui lòng đăng nhập lại."})
        }

         
        const decodedInfo=jwt.verify(token,process.env.SECRET_KEY)

        
        if(decodedInfo && decodedInfo._id && decodedInfo.email){
            req.user=decodedInfo
            next()
        }

        // if token is invalid then sends the response accordingly
        else{
            return res.status(401).json({message:"Mã đăng nhập không hợp lệ, vui lòng đăng nhập lại."})
        }
        
    } catch (error) {

        console.log(error);
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Mã đăng nhập đã hết hạn, vui lòng đăng nhập lại." });
        } 
        else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Mã đăng nhập không hợp lệ, vui lòng đăng nhập lại." });
        } 
        else {
            return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
        }
    }
}