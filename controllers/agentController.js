const Parcel = require("../models/parcel");

const assignParcel = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Access denied" });
    }
    const agentId = req.user.id;

    const parcels = await Parcel.find({ assignedAgent: agentId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, parcels });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const getSingleBooking = async (req, res) => {
  try {
    const parcelId = req.params.id;
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find parcel by ID
    const parcel = await Parcel.findById(parcelId).populate(
      "customer",
      "name phone"
    );

    if (!parcel) {
      return res
        .status(404)
        .json({ success: false, message: "Parcel not found" });
    }
    res.json({ success: true, parcel });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateStatus = async (req, res) => {
  const { status, pickupLocation } = req.body;
  const parcelId = req.params.id;

  const io = req.app.get("io");

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const updatedParcel = await Parcel.findByIdAndUpdate(
      parcelId,
      { status, pickupLocation },
      { new: true } // returns updated document
    );

    if (!updatedParcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // ✅ Emit to all connected clients
    io.emit("statusUpdated", {
      parcelId,
      status: updatedParcel?.status,
    });

    res.json({
      message: "Parcel status updated",
      parcel: updatedParcel,
    });
  } catch (error) {
    console.error("Error updating parcel:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { assignParcel, getSingleBooking, updateStatus };
