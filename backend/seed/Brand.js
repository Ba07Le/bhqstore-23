const Brand = require("../models/Brand");

const brands = [
  { name: "Razer" },
  { name: "Logitech" },
  { name: "SteelSeries" },
  { name: "HyperX" },
  { name: "Corsair" },
  { name: "NZXT" },
  { name: "ASUS" },
  { name: "MSI" },
  { name: "Gigabyte" },
  { name: "Dell / Alienware" },
  { name: "LG" },
];

exports.seedBrand = async () => {
  try {
    await Brand.deleteMany({}); 
    await Brand.insertMany(brands);
    console.log("Brand seeded successfully");
  } catch (error) {
    console.log(error);
  }
};
