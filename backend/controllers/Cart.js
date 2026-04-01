const Cart=require('../models/Cart')

exports.create=async(req,res)=>{
    try {
        const created=await new Cart(req.body).populate({path:"product",populate:{path:"brand"}});
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Lỗi khi thêm sản phẩm vô giỏ, vui lòng thử lại sau'})
    }
}

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        const result = await Cart.find({ user: id }).populate({path:"product",populate:{path:"brand"}});

        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Không thể tải các mặt hàng trong giỏ hàng, vui lòng thử lại sau.'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Cart.findByIdAndUpdate(id,req.body,{new:true}).populate({path:"product",populate:{path:"brand"}});
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Lỗi khi cập nhật các mặt hàng trong giỏ hàng, vui lòng thử lại sau.'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Cart.findByIdAndDelete(id)
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Không thể xóa sản phẩm trong giỏ hàng, vui lòng thử lại sau.'})
    }
}

exports.deleteByUserId=async(req,res)=>{

    try {
        const {id}=req.params
        await Cart.deleteMany({user:id})
        res.sendStatus(204)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Đã xảy ra lỗi trong quá trình đặt lại giỏ hàng của bạn"})
    }

}