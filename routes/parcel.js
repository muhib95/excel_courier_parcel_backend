const express = require("express");
const { bookParcel } = require("../controllers/parcelController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/book", authMiddleware, bookParcel);
module.exports = router;
