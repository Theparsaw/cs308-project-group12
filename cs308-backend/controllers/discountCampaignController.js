const DiscountCampaign = require("../models/DiscountCampaign");
const Product = require("../models/Product");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

// CREATE CAMPAIGN
const createCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    productIds,
    discountPercentage,
    startDate,
    endDate,
  } = req.body;

  if (!productIds || productIds.length === 0) {
    throw new AppError(
      "At least one product must be selected",
      400,
      "NO_PRODUCTS_SELECTED"
    );
  }

  // Verify products exist
  const products = await Product.find({
    productId: { $in: productIds },
  });

  if (products.length !== productIds.length) {
    throw new AppError(
      "One or more products do not exist",
      400,
      "INVALID_PRODUCTS"
    );
  }

  const campaign = await DiscountCampaign.create({
    name,
    productIds,
    discountPercentage,
    startDate,
    endDate,
  });

  res.status(201).json({
    message: "Discount campaign created successfully",
    campaign,
  });
});

// GET ALL CAMPAIGNS
const getCampaigns = asyncHandler(async (_req, res) => {
  const campaigns = await DiscountCampaign.find()
    .sort({ createdAt: -1 });

  res.status(200).json(campaigns);
});

// UPDATE CAMPAIGN
const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await DiscountCampaign.findById(req.params.id);

  if (!campaign) {
    throw new AppError(
      "Campaign not found",
      404,
      "CAMPAIGN_NOT_FOUND"
    );
  }

  const {
    name,
    productIds,
    discountPercentage,
    startDate,
    endDate,
    isActive,
  } = req.body;

  if (name !== undefined) campaign.name = name;
  if (productIds !== undefined) campaign.productIds = productIds;
  if (discountPercentage !== undefined) {
    campaign.discountPercentage = discountPercentage;
  }
  if (startDate !== undefined) campaign.startDate = startDate;
  if (endDate !== undefined) campaign.endDate = endDate;
  if (isActive !== undefined) campaign.isActive = isActive;

  await campaign.save();

  res.status(200).json({
    message: "Campaign updated successfully",
    campaign,
  });
});

// DEACTIVATE
const deactivateCampaign = asyncHandler(async (req, res) => {
  const campaign = await DiscountCampaign.findById(req.params.id);

  if (!campaign) {
    throw new AppError(
      "Campaign not found",
      404,
      "CAMPAIGN_NOT_FOUND"
    );
  }

  campaign.isActive = false;

  await campaign.save();

  res.status(200).json({
    message: "Campaign deactivated successfully",
  });
});

module.exports = {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deactivateCampaign,
};