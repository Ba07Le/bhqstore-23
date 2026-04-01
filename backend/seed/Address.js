const Address = require("../models/Address");
const User = require("../models/User");

exports.seedAddress = async () => {
  try {
    await Address.deleteMany({});

    const users = await User.find().sort({ isAdmin: 1, createdAt: 1 });
    const normalUser = users.find((user) => !user.isAdmin);

    if (!normalUser) {
      console.log("Address seed skipped because no normal user was found");
      return;
    }

    const addresses = [
      {
        user: normalUser._id,
        street: "12 Nguyen Hue",
        city: "Ho Chi Minh",
        phoneNumber: "0901234567",
        postalCode: "700000",
        country: "Viet Nam",
        type: "Nha rieng",
      },
      {
        user: normalUser._id,
        street: "89 Le Loi",
        city: "Da Nang",
        phoneNumber: "0912345678",
        postalCode: "550000",
        country: "Viet Nam",
        type: "Van phong",
      },
    ];

    await Address.insertMany(addresses);
    console.log(`Address seeded successfully (${addresses.length} items)`);
  } catch (error) {
    console.log(error);
  }
};
