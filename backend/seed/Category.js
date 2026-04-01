const Category = require("../models/Category");

const categories = [
  { name: "Chuột" },
  { name: "Tai nghe" },
  { name: "Bàn phím" },
];

exports.seedCategory = async () => {
  try {
    await Category.deleteMany({}); 
    await Category.insertMany(categories);
    console.log("Category seeded successfully");
  } catch (error) {
    console.log(error);
  }
};
