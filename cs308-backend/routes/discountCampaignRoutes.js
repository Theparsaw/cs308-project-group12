const express = require("express");

const router = express.Router();

const {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deactivateCampaign,
} = require("../controllers/discountCampaignController");

const {
  authMiddleware,
  authorize,
} = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.use(authorize("sales_manager"));

router.route("/")
  .get(getCampaigns)
  .post(createCampaign);

router.route("/:id")
  .put(updateCampaign);

router.route("/:id/deactivate")
  .patch(deactivateCampaign);

module.exports = router;