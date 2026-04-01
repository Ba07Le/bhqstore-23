const User = require("../models/User");
const bcrypt=require('bcryptjs');
const { sendMail } = require("../utils/Emails");
const { generateOTP } = require("../utils/GenerateOtp");
const Otp = require("../models/OTP");
const { sanitizeUser } = require("../utils/SanitizeUser");
const { generateToken } = require("../utils/GenerateToken");
const PasswordResetToken = require("../models/PasswordResetToken");
const frontendBaseUrl = process.env.FRONTEND_URL || process.env.ORIGIN || "";

exports.signup=async(req,res)=>{
    try {
        const existingUser=await User.findOne({email:req.body.email})
        
       
        if(existingUser){
            return res.status(400).json({"message":"Người dùng đã tồn tại"})
        }

        
        const hashedPassword=await bcrypt.hash(req.body.password,10)
        req.body.password=hashedPassword

        
        const createdUser=new User(req.body)
        await createdUser.save()

        
        const secureInfo=sanitizeUser(createdUser)

        
        const token=generateToken(secureInfo)

        
        res.cookie('token',token,{
            sameSite:process.env.PRODUCTION==='true'?"None":'Lax',
            maxAge:new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000))),
            httpOnly:true,
            secure:process.env.PRODUCTION==='true'?true:false
        })

        res.status(201).json(sanitizeUser(createdUser))

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Đã xảy ra lỗi trong quá trình đăng ký, vui lòng thử lại sau."})
    }
}

exports.login=async(req,res)=>{
    try {
        
        const existingUser=await User.findOne({email:req.body.email})

        
        if(existingUser && (await bcrypt.compare(req.body.password,existingUser.password))){

            
            const secureInfo=sanitizeUser(existingUser)

            
            const token=generateToken(secureInfo)

            res.cookie('token',token,{
                sameSite:process.env.PRODUCTION==='true'?"None":'Lax',
                maxAge:new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000))),
                httpOnly:true,
                secure:process.env.PRODUCTION==='true'?true:false
            })
            return res.status(200).json(sanitizeUser(existingUser))
        }

        res.clearCookie('token');
        return res.status(404).json({message:"Mật khẩu hoặc email sai"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Đã xảy ra lỗi trong quá trình đăng nhập, vui lòng thử lại sau.'})
    }
}

exports.verifyOtp=async(req,res)=>{
    try {
        
        const isValidUserId=await User.findById(req.body.userId)

        
        if(!isValidUserId){
            return res.status(404).json({message:'Không tìm thấy người dùng, mã OTP đã được tạo.'})
        }

    
        const isOtpExisting=await Otp.findOne({user:isValidUserId._id})

     
        if(!isOtpExisting){
            return res.status(404).json({message:'OTP không được tìm thấy'})
        }

      
        if(isOtpExisting.expiresAt < new Date()){
            await Otp.findByIdAndDelete(isOtpExisting._id)
            return res.status(400).json({message:"OTP đã hết hạn"})
        }
        
        
        if(isOtpExisting && (await bcrypt.compare(req.body.otp,isOtpExisting.otp))){
            await Otp.findByIdAndDelete(isOtpExisting._id)
            const verifiedUser=await User.findByIdAndUpdate(isValidUserId._id,{isVerified:true},{new:true})
            return res.status(200).json(sanitizeUser(verifiedUser))
        }

       
        return res.status(400).json({message:'Mã OTP không hợp lệ hoặc đã hết hạn'})


    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Một vài lỗi đã xảy ra"})
    }
}

exports.resendOtp=async(req,res)=>{
    try {

        const existingUser=await User.findById(req.body.user)

        if(!existingUser){
            return res.status(404).json({"message":"Người dùng không được tìm thấy"})
        }

        await Otp.deleteMany({user:existingUser._id})

        const otp=generateOTP()
        const hashedOtp=await bcrypt.hash(otp,10)

        const newOtp=new Otp({user:req.body.user,otp:hashedOtp,expiresAt:Date.now()+parseInt(process.env.OTP_EXPIRATION_TIME)})
        await newOtp.save()

        await sendMail(existingUser.email,`OTP Verification for Your MERN-AUTH-REDUX-TOOLKIT Account`,`Your One-Time Password (OTP) for account verification is: <b>${otp}</b>.</br>Do not share this OTP with anyone for security reasons`)

        res.status(201).json({'message':"Đã gửi mã OTP"})
    } catch (error) {
        res.status(500).json({'message':"Đã xảy ra lỗi khi gửi lại mã OTP, vui lòng thử lại sau."})
        console.log(error);
    }
}

exports.forgotPassword=async(req,res)=>{
    let newToken;
    try {
        
        const isExistingUser=await User.findOne({email:req.body.email})

       
        if(!isExistingUser){
            return res.status(404).json({message:"Địa chỉ email được cung cấp không tồn tại."})
        }

        await PasswordResetToken.deleteMany({user:isExistingUser._id})

        
        const passwordResetToken=generateToken(sanitizeUser(isExistingUser),true)

        
        const hashedToken=await bcrypt.hash(passwordResetToken,10)

         
        newToken=new PasswordResetToken({user:isExistingUser._id,token:hashedToken,expiresAt:Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME)})
        await newToken.save()

         
        await sendMail(isExistingUser.email,'Link đặt lại mật khẩu cho tài khoản BHQ Store của bạn',`<p>Gửi đến ${isExistingUser.name},

        Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản BHQ Store của bạn. Nếu bạn là người gửi yêu cầu này, vui lòng sử dụng liên kết sau để đặt lại mật khẩu:</p>
        
        <p><a href=${frontendBaseUrl}/reset-password/${isExistingUser._id}/${passwordResetToken} target="_blank">Reset Password</a></p>
        
        <p>Liên kết này chỉ có hiệu lực trong thời gian giới hạn. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Bảo mật tài khoản của bạn rất quan trọng đối với chúng tôi.
        
        Nhóm 2 TTTN Khóa 23 xin cảm ơn.</p>`)

        res.status(200).json({message:`Link reset mật khẩu được gửi đến ${isExistingUser.email}`})

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Đã xảy ra lỗi khi gửi email đặt lại mật khẩu.'})
    }
}

exports.resetPassword=async(req,res)=>{
    try {

        
        const isExistingUser=await User.findById(req.body.userId)

    
        if(!isExistingUser){
            return res.status(404).json({message:"Người dùng không tồn tại"})
        }

         
        const isResetTokenExisting=await PasswordResetToken.findOne({user:isExistingUser._id})

       
         if(!isResetTokenExisting){
            return res.status(404).json({message:"Link reset không khả dụng"})
        }

       
        if(isResetTokenExisting.expiresAt < new Date()){
            await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id)
            return res.status(404).json({message:"Link reset đã hết hạn"})
        }

      
        if(isResetTokenExisting && isResetTokenExisting.expiresAt>new Date() && (await bcrypt.compare(req.body.token,isResetTokenExisting.token))){
 
            await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id)
 
            await User.findByIdAndUpdate(isExistingUser._id,{password:await bcrypt.hash(req.body.password,10)})
            return res.status(200).json({message:"Password được cập nhật thành công"})
        }

        return res.status(404).json({message:"Link reset đã hết hạn"})

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Đã xảy ra lỗi khi đặt lại mật khẩu, vui lòng thử lại sau."})
    }
}

exports.logout=async(req,res)=>{
    try {
        res.cookie('token',{
            maxAge:0,
            sameSite:process.env.PRODUCTION==='true'?"None":'Lax',
            httpOnly:true,
            secure:process.env.PRODUCTION==='true'?true:false
        })
        res.status(200).json({message:'Đăng xuất thành công'})
    } catch (error) {
        console.log(error);
    }
}

exports.checkAuth=async(req,res)=>{
    try {
        if(req.user){
            const user=await User.findById(req.user._id)
            return res.status(200).json(sanitizeUser(user))
        }
        res.sendStatus(401)
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
}
