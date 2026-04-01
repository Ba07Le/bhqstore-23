const express=require('express')
const orderController=require("../controllers/Order")
const router=express.Router()


router
    .post("/",orderController.create)
    .post("/payment/create-session", orderController.createPaymentSession)
    .post("/payment/mock/complete", orderController.completeMockPayment)
    .post("/payment/verify", orderController.verifyPaymentReturn)
    .post("/payment/momo/ipn", orderController.handleMomoIpn)
    .get("/payment/vnpay/ipn", orderController.handleVnpayIpn)
    .get("/stats/overview",orderController.getOverview)
    .get("/",orderController.getAll)
    .get("/user/:id",orderController.getByUserId)
    .get("/:id", orderController.getById)
    .patch("/:id",orderController.updateById)


module.exports=router
