const DiscountCampaign = require("../models/DiscountCampaign");

const getDiscountedPrice = async (product) => {
  const now = new Date();

  const campaign = await DiscountCampaign.findOne({
    isActive: true,
    productIds: product.productId,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!campaign) {
    return {
      originalPrice: product.price,
      discountedPrice: product.price,
      hasDiscount: false,
      discountPercentage: 0,
    };
  }

  const discountedPrice =
    product.price * (1 - campaign.discountPercentage / 100);

  return {
    originalPrice: product.price,
    discountedPrice: Number(discountedPrice.toFixed(2)),
    hasDiscount: true,
    discountPercentage: campaign.discountPercentage,
  };
};

module.exports = {
  getDiscountedPrice,
};