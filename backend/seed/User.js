const bcrypt = require("bcryptjs");
const User = require("../models/User");

const users = [
  {
    _id: "65b8e564ea5ce114184ccb96",
    name: "leducbao",
    email: "leducbao2005@gmail.com",
    password: bcrypt.hashSync("leducbao2005", 10),
    isVerified: true,
    isAdmin: false,
  },
  {
    _id: "65c2526fdcd9253acfbaa731",
    name: "bhqtttn",
    email: "bhqtttn2023@gmail.com",
    password: bcrypt.hashSync("bhqtttn2023", 10),
    isVerified: true,
    isAdmin: true, 
  },
];                                

exports.seedUser = async () => {
  try {
    await User.deleteMany();  
    await User.insertMany(users);
    console.log("User seeded successfully");
  } catch (error) {
    console.log(error);
  }
};
