// models/Parcel.js
const mongoose = require("mongoose");
const PRICING = {
  Small: 50,
  Medium: 100,
  Large: 150,
};
const parcelSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pickupAddress: { type: String, required: true },
  pickupLocation: {
    lat: Number,
    lng: Number,
  },
  deliveryAddress: { type: String, required: true },
  deliveryLocation: {
    lat: Number,
    lng: Number,
  },
  parcelType: {
    type: String,
    enum: ["Small", "Medium", "Large"],
    required: true,
  },
  price: { type: Number },
  paymentType: { type: String, enum: ["COD", "Prepaid"], required: true },
  status: {
    type: String,
    enum: [
      "Booked",
      "Assigned",
      "Picked Up",
      "In Transit",
      "Delivered",
      "Failed",
    ],
    default: "Booked",
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // user with role 'Delivery Agent'
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});
parcelSchema.pre("save", async function () {
  if (this.isModified("parcelType") || this.isNew) {
    this.price = PRICING[this.parcelType] || 0;
  }
});

module.exports = mongoose.model("Parcel", parcelSchema);
