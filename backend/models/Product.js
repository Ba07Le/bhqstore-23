const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    stockQuantity: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    images: { type: [String], required: true },
    isDeleted: { type: Boolean, default: false },
    // Trường vector để AI tìm kiếm (Vector Search)
    description_vector: { type: [Number], default: [] }
}, { 
    timestamps: true, 
    versionKey: false,
    toJSON: { virtuals: true }, // Cho phép hiển thị virtuals khi chuyển sang JSON
    toObject: { virtuals: true }
});

// Kết nối ảo tới collection Review
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product'
});

module.exports = mongoose.model('Product', productSchema);