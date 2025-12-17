// routes/parcels.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  assignParcel,
  getSingleBooking,
  updateStatus,
} = require("../controllers/agentController");

router.get("/view/assignParcel", authMiddleware, assignParcel);
router.get("/singleBooking/:id", authMiddleware, getSingleBooking);
router.patch("/updateStatus/:id", authMiddleware, updateStatus);

module.exports = router;
