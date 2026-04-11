const Product = require('../models/Product');
const Organization = require('../models/Organization');

// @desc   Get all products for org
// @route  GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    const orgId = req.user.organization._id;

    let query = { organization: orgId, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Get single product
// @route  GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      organization: req.user.organization._id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Create product
// @route  POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;

    const existing = await Product.findOne({
      organization: req.user.organization._id,
      sku: sku?.toUpperCase(),
      isDeleted: false,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'SKU already exists in your organization' });
    }

    const product = await Product.create({
      organization: req.user.organization._id,
      name,
      sku,
      description,
      quantityOnHand: quantityOnHand || 0,
      costPrice: costPrice || null,
      sellingPrice: sellingPrice || null,
      lowStockThreshold: lowStockThreshold || null,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SKU already exists in your organization' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold, lastUpdatedNote } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      organization: req.user.organization._id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check SKU conflict if changing
    if (sku && sku.toUpperCase() !== product.sku) {
      const skuExists = await Product.findOne({
        organization: req.user.organization._id,
        sku: sku.toUpperCase(),
        isDeleted: false,
        _id: { $ne: product._id },
      });
      if (skuExists) {
        return res.status(400).json({ success: false, message: 'SKU already exists in your organization' });
      }
    }

    product.name = name ?? product.name;
    product.sku = sku ?? product.sku;
    product.description = description ?? product.description;
    product.quantityOnHand = quantityOnHand !== undefined ? quantityOnHand : product.quantityOnHand;
    product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
    product.sellingPrice = sellingPrice !== undefined ? sellingPrice : product.sellingPrice;
    product.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : product.lowStockThreshold;
    product.lastUpdatedNote = lastUpdatedNote ?? product.lastUpdatedNote;

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Adjust stock
// @route  PATCH /api/products/:id/adjust-stock
exports.adjustStock = async (req, res) => {
  try {
    const { adjustment, note } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      organization: req.user.organization._id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newQty = product.quantityOnHand + Number(adjustment);
    if (newQty < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot go below 0' });
    }

    product.quantityOnHand = newQty;
    product.lastUpdatedNote = note || '';
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Delete product (soft delete)
// @route  DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      organization: req.user.organization._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isDeleted = true;
    await product.save();

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Get dashboard stats
// @route  GET /api/products/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const defaultThreshold = req.user.organization.defaultLowStockThreshold || 5;

    const products = await Product.find({ organization: orgId, isDeleted: false });

    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

    const lowStockItems = products.filter((p) => {
      const threshold = p.lowStockThreshold !== null ? p.lowStockThreshold : defaultThreshold;
      return p.quantityOnHand <= threshold;
    });

    res.json({
      success: true,
      dashboard: {
        totalProducts,
        totalQuantity,
        lowStockCount: lowStockItems.length,
        lowStockItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};