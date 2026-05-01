const mongoose = require("mongoose");

const { Schema } = mongoose;

const inventoryTransactionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
      trim: true,
    },
    changeType: {
      type: String,
      enum: ["import", "export", "adjustment"],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    nextStock: {
      type: Number,
      required: true,
    },
    importQuantity: {
      type: Number,
      default: 0,
    },
    exportQuantity: {
      type: Number,
      default: 0,
    },
    setStockQuantity: {
      type: Number,
      default: null,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      default: "excel",
      trim: true,
    },
    sourceFileName: {
      type: String,
      default: "",
      trim: true,
    },
    batchId: {
      type: String,
      required: true,
      trim: true,
    },
    actor: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      email: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);
