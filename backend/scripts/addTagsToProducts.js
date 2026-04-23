const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const tagKeywords = {
  gaming: ['gaming', 'game', 'razer', 'corsair', 'rog', 'msi', 'rgb pro', 'azoth'],
  office: ['office', 'work', 'ergo', 'mx master', 'productivity'],
  professional: ['professional', 'streamer', 'pro', 'studio', 'creator'],
  budget: ['budget', 'rẻ', 'giá rẻ', 'affordable', 'entry'],
  premium: ['premium', 'cao cấp', 'luxury', 'pro', 'elite', 'ultimate'],
  wireless: ['wireless', 'không dây', 'bluetooth', 'usb'],
  wired: ['wired', 'có dây'],
  rgb: ['rgb', 'led', 'light', 'rgb pro'],
  mechanical: ['cơ', 'mechanical', 'switch', 'custom'],
  'noise-cancelling': ['chống ồn', 'noise cancelling', 'anc', 'active noise'],
  portable: ['portable', 'dễ mang', 'earbuds', 'true wireless'],
  studio: ['studio', 'audio', 'professional', 'mixer']
};

const addTagsToProducts = async () => {
  try {
    console.log('Starting to add tags to products...\n');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to process\n`);

    for (const product of products) {
      const searchText = `${product.title} ${product.description}`.toLowerCase();
      const tags = [];

      for (const [tag, keywords] of Object.entries(tagKeywords)) {
        for (const keyword of keywords) {
          if (searchText.includes(keyword)) {
            if (!tags.includes(tag)) {
              tags.push(tag);
            }
            break;
          }
        }
      }

      await Product.findByIdAndUpdate(
        product._id,
        { tags: tags },
        { new: true }
      );

      console.log(`✓ ${product.title}`);
      console.log(`  Tags: ${tags.join(', ') || 'None'}\n`);
    }

    console.log('✅ Finished adding tags to all products');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addTagsToProducts();