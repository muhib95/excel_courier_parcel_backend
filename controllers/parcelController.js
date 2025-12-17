const Parcel = require("../models/parcel");
const bookParcel = async (req, res) => {
  try {
    const {
      pickupAddress,
      pickupLocation,
      deliveryAddress,
      deliveryLocation,
      parcelType,
      paymentType,
    } = req.body || {};
    if (
      !pickupAddress ||
      !pickupLocation?.lat ||
      !pickupLocation?.lng ||
      !deliveryAddress ||
      !deliveryLocation?.lat ||
      !deliveryLocation?.lng ||
      !parcelType ||
      !paymentType
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing: {
          pickupAddress: !!pickupAddress,
          pickupLocation: pickupLocation?.lat && pickupLocation?.lng,
          deliveryAddress: !!deliveryAddress,
          deliveryLocation: deliveryLocation?.lat && deliveryLocation?.lng,
          parcelType: !!parcelType,
          paymentType: !!paymentType,
        },
      });
    }

    const customerId = req.user.id; // from JWT middleware

    const parcel = await Parcel.create({
      customer: customerId,
      pickupAddress,
      pickupLocation,
      deliveryAddress,
      deliveryLocation,
      parcelType,
      paymentType,
    });

    res.status(201).json({ success: true, parcel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Parcel booking failed" });
  }
};
const getMyParcels = async (req, res) => {
  try {
    const customerId = req.user.id; // from auth middleware

    const parcels = await Parcel.find({ customer: customerId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, parcels });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};
const getParcelById = async (req, res) => {
  try {
    const parcelId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find parcel by ID
    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res
        .status(404)
        .json({ success: false, message: "Parcel not found" });
    }

    // Authorization:
    // Customer can only view their own parcel
    // Agent/Admin can view all parcels
    if (userRole === "customer" && parcel.customer.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, parcel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to get parcel" });
  }
};
module.exports = { bookParcel, getMyParcels, getParcelById };
