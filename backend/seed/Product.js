const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");

const productTemplates = [
  {
    title: "Razer DeathAdder V3 Pro",
    description:
      "Chuột gaming không dây siêu nhẹ, cảm biến chính xác cao, phù hợp FPS và tác vụ hàng ngày.",
    price: 3490000,
    stockQuantity: 18,
    brandName: "Razer",
    categoryName: "Chuột",
    thumbnail:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Logitech G Pro X Superlight",
    description:
      "Chuột không dây tối ưu thi đấu eSports với thiết kế tối giản và trọng lượng nhẹ.",
    price: 2990000,
    stockQuantity: 25,
    brandName: "Logitech",
    categoryName: "Chuột",
    thumbnail:
      "https://images.unsplash.com/photo-1563297007-0686b7003af7?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1563297007-0686b7003af7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1613141412501-9012977f1969?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1613141411244-0e4ac259d217?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "SteelSeries Arctis Nova 7",
    description:
      "Tai nghe gaming wireless có microphone chống ồn, đeo êm, pin lâu và âm thanh cân bằng.",
    price: 4290000,
    stockQuantity: 7,
    brandName: "SteelSeries",
    categoryName: "Tai nghe",
    thumbnail:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "HyperX Cloud III",
    description:
      "Tai nghe cho game thủ với chất âm dày, đeo lâu thoải mái, microphone rõ ràng khi voice chat.",
    price: 2490000,
    stockQuantity: 0,
    brandName: "HyperX",
    categoryName: "Tai nghe",
    thumbnail:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Corsair K70 RGB Pro",
    description:
      "Bàn phím cơ fullsize switch nhanh, LED RGB sáng, khung chắc chắn dành cho game thủ.",
    price: 3890000,
    stockQuantity: 12,
    brandName: "Corsair",
    categoryName: "Bàn phím",
    thumbnail:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "ASUS ROG Azoth",
    description:
      "Bàn phím custom gaming 75%, gõ chắc tay, màn OLED nhỏ và kết nối linh hoạt.",
    price: 5590000,
    stockQuantity: 5,
    brandName: "ASUS",
    categoryName: "Bàn phím",
    thumbnail:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "NZXT Lift 2 Ergo",
    description:
      "Chuột công thái học cho game thủ và dân văn phòng, cầm thoải mái, tracking ổn định.",
    price: 1590000,
    stockQuantity: 40,
    brandName: "NZXT",
    categoryName: "Chuột",
    thumbnail:
      "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1613141411244-0e4ac259d217?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1563297007-0686b7003af7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "MSI Immerse GH50",
    description:
      "Tai nghe có âm trường tốt, phù hợp chơi game online và nghe nhạc giải trí.",
    price: 1690000,
    stockQuantity: 22,
    brandName: "MSI",
    categoryName: "Tai nghe",
    thumbnail:
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    title: "Dell Alienware AW510K",
    description:
      "Bàn phím cơ low-profile với thiết kế đậm chất gaming và phản hồi phím nhanh.",
    price: 3190000,
    stockQuantity: 9,
    brandName: "Dell / Alienware",
    categoryName: "Bàn phím",
    thumbnail:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    ],
    isDeleted: true,
  },
];

exports.seedProduct = async () => {
  try {
    await Product.deleteMany({});

    const brands = await Brand.find();
    const categories = await Category.find();

    const brandMap = new Map(brands.map((brand) => [brand.name, brand._id]));
    const categoryMap = new Map(
      categories.map((category) => [category.name, category._id])
    );

    const products = productTemplates.map((product) => ({
      title: product.title,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      brand: brandMap.get(product.brandName),
      category: categoryMap.get(product.categoryName),
      thumbnail: product.thumbnail,
      images: product.images,
      isDeleted: Boolean(product.isDeleted),
    }));

    await Product.insertMany(products);
    console.log(`Product seeded successfully (${products.length} items)`);
  } catch (error) {
    console.log(error);
  }
};
