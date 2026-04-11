const Organization = require('../models/Organization');

// @desc   Get org settings
// @route  GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const org = req.user.organization;
    res.json({
      success: true,
      settings: {
        organizationName: org.name,
        defaultLowStockThreshold: org.defaultLowStockThreshold,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Update org settings
// @route  PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const { organizationName, defaultLowStockThreshold } = req.body;

    const org = await Organization.findById(req.user.organization._id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    if (organizationName) org.name = organizationName;
    if (defaultLowStockThreshold !== undefined) org.defaultLowStockThreshold = defaultLowStockThreshold;

    await org.save();

    res.json({
      success: true,
      settings: {
        organizationName: org.name,
        defaultLowStockThreshold: org.defaultLowStockThreshold,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};