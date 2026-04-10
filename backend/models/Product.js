const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    quantityOnHand: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: null,
    },
    sellingPrice: {
      type: Number,
      default: null,
    },
    lowStockThreshold: {
      type: Number,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastUpdatedNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound unique index for SKU per organization among active (not soft-deleted) products.
productSchema.index(
  { organization: 1, sku: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model('Product', productSchema);