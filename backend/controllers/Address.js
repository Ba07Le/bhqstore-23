const Address = require("../models/Address")

exports.create=async(req,res)=>{
    try {
        const created=new Address(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Lỗi khi thêm đại chỉ, vui lòng thử lại sau'})
    }
}

exports.getByUserId = async (req, res) => {
    try {
        const {id}=req.params
        const results=await Address.find({user:id})
        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Lỗi khi truy xuất địa chỉ, vui lòng thử lại sau'})
    }
};

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Address.findByIdAndUpdate(id,req.body,{new:true})
        console.log(updated);
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Lỗi khi cập nhật địa chỉ, vui lòng thử lại sau'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Address.findByIdAndDelete(id)
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Lỗi khi xóa đại chỉ, vui lòng thử lại sau'})
    }
}


