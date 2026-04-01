const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

exports.seedReview = async () => {
  try {
    await Review.deleteMany({});

    const user = await User.findOne({ isAdmin: false });
    const products = await Product.find({ isDeleted: false }).limit(3);

    if (!user || products.length < 3) {
      console.log("Review seed skipped because required user/products are missing");
      return;
    }

    const reviews = [
      {
        user: user._id,
        product: products[0]._id,
        rating: 5,
        comment: "Cam giac cam rat tot, tracking on dinh va rat de lam quen.",
      },
      {
        user: user._id,
        product: products[1]._id,
        rating: 4,
        comment: "Chat am tot, deo lau kha em tai, microphone ro rang.",
      },
      {
        user: user._id,
        product: products[2]._id,
        rating: 5,
        comment: "Hoan thien dep, go suong tay, rat hop de choi game va lam viec.",
      },
    ];

    await Review.insertMany(reviews);
    console.log(`Review seeded successfully (${reviews.length} items)`);
  } catch (error) {
    console.log(error);
  }
};
