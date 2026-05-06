const DiscountCampaign = require("../models/DiscountCampaign");
const Product = require("../models/Product");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const Wishlist = require("../models/Wishlist");
const Notification = require("../models/Notification");


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
  for (const productId of campaign.productIds) {

    const product = await Product.findOne({
      productId,
    });

    const wishlists = await Wishlist.find({
      "items.productId": productId,
    });

    for (const wishlist of wishlists) {

      await Notification.findOneAndUpdate(
        {
          userId: String(wishlist.userId),
          productId,
          campaignId: String(campaign._id),
        },
        {
          userId: String(wishlist.userId),
          productId,
          campaignId: String(campaign._id),

          productName:
            product?.model ||
            product?.name ||
            "Product",

          discountPercentage:
            campaign.discountPercentage,

          message:
            `${product?.model || "A wishlisted product"} is now ${campaign.discountPercentage}% off.`,

          isRead: false,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }
  }

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