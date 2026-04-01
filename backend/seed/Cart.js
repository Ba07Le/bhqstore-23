const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

exports.seedCart = async () => {
  try {
    await Cart.deleteMany({});

    const user = await User.findOne({ isAdmin: false });
    const products = await Product.find({ isDeleted: false }).limit(2);

    if (!user || products.length < 2) {
      console.log("Cart seed skipped because required user/products are missing");
      return;
    }

    const cartItems = [
      { user: user._id, product: products[0]._id, quantity: 1 },
      { user: user._id, product: products[1]._id, quantity: 2 },
    ];

    await Cart.insertMany(cartItems);
    console.log(`Cart seeded successfully (${cartItems.length} items)`);
  } catch (error) {
    console.error("Cart seed error:", error);
  }
};
