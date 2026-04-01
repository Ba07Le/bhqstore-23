const mongoose=require("mongoose")
const {Schema}=mongoose

const orderSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:false // 🛠️ CHỈNH SỬA: Cho phép null để khách vãng lai đặt hàng
    },
    item:{
        type:[Schema.Types.Mixed],
        required:true
    },
    address:{
        type:Schema.Types.Mixed, // 🛠️ CHỈNH SỬA: Bỏ dấu [] để nhận 1 Object địa chỉ (nhập tay hoặc từ list)
        required:true
    },
    status:{
        type:String,
        enum:['Đang chờ xử lý', 'Đã gửi', 'Đang giao hàng', 'Đã giao', 'Đã hủy'],
        default:'Đang chờ xử lý'
    },
    paymentMode:{
        type:String,
        enum:['COD','UPI','CARD','MOMO','VNPAY'],
        required:true
    },
    paymentStatus:{
        type:String,
        enum:['pending','paid','failed','cancelled','cod_pending'],
        default:function(){
            return this.paymentMode === 'COD' ? 'cod_pending' : 'pending'
        }
    },
    paymentTransactionId:{
        type:String,
        required:false
    },
    paymentMeta:{
        type:Schema.Types.Mixed,
        required:false,
        default:{}
    },
    paidAt:{
        type:Date,
        required:false
    },
    total:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
},{versionKey:false})

module.exports=mongoose.model("Order",orderSchema)
