const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const User = require("../models/User");

exports.seedWishlist = async () => {
  try {
    await Wishlist.deleteMany({});

    const user = await User.findOne({ isAdmin: false });
    const products = await Product.find({ isDeleted: false }).skip(2).limit(2);

    if (!user || products.length < 2) {
      console.log(
        "Wishlist seed skipped because required user/products are missing"
      );
      return;
    }

    const wishlistItems = [
      {
        user: user._id,
        product: products[0]._id,
        note: "Mua vao dot sale tiep theo",
      },
      {
        user: user._id,
        product: products[1]._id,
        note: "Can doi gia them",
      },
    ];

    await Wishlist.insertMany(wishlistItems);
    console.log(
      `Wishlist seeded successfully (${wishlistItems.length} items)`
    );
  } catch (error) {
    console.error("Wishlist seed error:", error);
  }
};
