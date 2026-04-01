const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const buildOrderItem = (product, quantity) => ({
  product: {
    _id: product._id,
    title: product.title,
    description: product.description,
    price: product.price,
    brand: {
      _id: product.brand?._id || product.brand,
      name: product.brand?.name || "",
    },
    thumbnail: product.thumbnail,
    images: product.images,
  },
  quantity,
});

exports.seedOrder = async () => {
  try {
    await Order.deleteMany({});

    const user = await User.findOne({ isAdmin: false });
    const products = await Product.find({ isDeleted: false })
      .populate("brand")
      .limit(4);

    if (!user || products.length < 4) {
      console.log("Order seed skipped because required user/products are missing");
      return;
    }

    const orders = [
      {
        user: user._id,
        item: [buildOrderItem(products[0], 1), buildOrderItem(products[1], 2)],
        address: {
          street: "12 Nguyen Hue",
          city: "Ho Chi Minh",
          state: "Quan 1",
          postalCode: "700000",
          country: "Viet Nam",
          phoneNumber: "0901234567",
          type: "Nha rieng",
        },
        paymentMode: "COD",
        total: products[0].price + products[1].price * 2,
        status: "Đang chờ xử lý",
        createdAt: new Date("2026-03-28T09:15:00.000Z"),
      },
      {
        user: user._id,
        item: [buildOrderItem(products[2], 1)],
        address: {
          street: "89 Le Loi",
          city: "Da Nang",
          state: "Hai Chau",
          postalCode: "550000",
          country: "Viet Nam",
          phoneNumber: "0912345678",
          type: "Van phong",
        },
        paymentMode: "CARD",
        total: products[2].price,
        status: "Đã giao",
        createdAt: new Date("2026-03-21T03:30:00.000Z"),
      },
      {
        user: user._id,
        item: [buildOrderItem(products[3], 1)],
        address: {
          street: "45 Tran Phu",
          city: "Nha Trang",
          state: "Loc Tho",
          postalCode: "650000",
          country: "Viet Nam",
          phoneNumber: "0988999777",
          type: "Nguoi than",
        },
        paymentMode: "COD",
        total: products[3].price,
        status: "Đang giao hàng",
        createdAt: new Date("2026-03-30T12:45:00.000Z"),
      },
    ];

    await Order.insertMany(orders);
    console.log(`Order seeded successfully (${orders.length} items)`);
  } catch (error) {
    console.log(error);
  }
};
