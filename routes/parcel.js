const express = require("express");
const {
  bookParcel,
  getMyParcels,
  getParcelById,
} = require("../controllers/parcelController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/book", authMiddleware, bookParcel);
router.get("/booking/history", authMiddleware, getMyParcels);
router.get("/single/booking/history/:id", authMiddleware, getParcelById);
module.exports = router;
