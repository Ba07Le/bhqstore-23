require("dotenv").config();
const express=require('express')
const cors=require('cors')
const morgan=require("morgan")
const cookieParser=require("cookie-parser")
const authRoutes=require("./routes/Auth")
const productRoutes=require("./routes/Product")
const orderRoutes=require("./routes/Order")
const cartRoutes=require("./routes/Cart")
const brandRoutes=require("./routes/Brand")
const categoryRoutes=require("./routes/Category")
const userRoutes=require("./routes/User")
const addressRoutes=require('./routes/Address')
const reviewRoutes=require("./routes/Review")
const wishlistRoutes=require("./routes/Wishlist")
const { connectToDB } = require("./database/db")
const path = require("path") 
const chatRoutes = require("./routes/Chat")
const host = process.env.HOST || "0.0.0.0"
const port = Number(process.env.PORT || 8000)
const allowedOrigins = (process.env.ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)




// server init
const server=express()
server.set("trust proxy", 1)


// expose uploads folder
server.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


// database connection
connectToDB()


// middlewares
console.log("Allowed Origins Array:", allowedOrigins);
server.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error("Not allowed by CORS"))
    },
    credentials:true,
    exposedHeaders:['X-Total-Count'],
    methods:['GET','POST','PATCH','DELETE']
  })
)
server.use(express.json())
server.use(cookieParser())
server.use(morgan("tiny"))





// routeMiddleware
server.use("/auth",authRoutes)
server.use("/users",userRoutes)
server.use("/products",productRoutes)
server.use("/orders",orderRoutes)
server.use("/cart",cartRoutes)
server.use("/brands",brandRoutes)
server.use("/categories",categoryRoutes)
server.use("/address",addressRoutes)
server.use("/reviews",reviewRoutes)
server.use("/wishlist",wishlistRoutes)
server.use("/api/chat",chatRoutes)

server.get("/",(req,res)=>{
    res.status(200).json({message:'running'})
})

server.listen(port, host, ()=>{
    console.log(`server [STARTED] ~ http://${host}:${port}`);
})
