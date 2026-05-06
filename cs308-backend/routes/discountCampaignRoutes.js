const express = require("express");

const router = express.Router();

const {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deactivateCampaign,
  reactivateCampaign,
  deleteCampaign,
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

router.route("/:id/reactivate")
  .patch(reactivateCampaign);

router.route("/:id")
  .delete(deleteCampaign);

module.exports = router;