const express = require("express");
const {
  getUsers,
  getAllBooking,
  getSingleBooking,
  assignParcel,
  getAgents,
  getDashboardMetrics,
  exportParcelsPDF,
  exportParcelsCSV,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/allUser", authMiddleware, getUsers);
router.get("/allAgent", authMiddleware, getAgents);
router.get("/allBooking", authMiddleware, getAllBooking);
router.get("/getDashboardMetrics", authMiddleware, getDashboardMetrics);
router.get("/singleBooking/:id", authMiddleware, getSingleBooking);
router.get("/export/pdf/parcels", authMiddleware, exportParcelsPDF);
router.get("/export/csv/parcels", authMiddleware, exportParcelsCSV);
router.patch("/:parcelId/assignAgent", authMiddleware, assignParcel);

module.exports = router;
