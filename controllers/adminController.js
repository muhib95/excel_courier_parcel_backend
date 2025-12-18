const { Parser } = require("json2csv");
const Parcel = require("../models/parcel");
const User = require("../models/user");
const PDFDocument = require("pdfkit");

const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({}, "-password"); // exclude password field
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const getAllBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const parcels = await Parcel.find({}, "-password").sort({ createdAt: -1 });
    res.json({ success: true, parcels });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const getSingleBooking = async (req, res) => {
  try {
    const parcelId = req.params.id;
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find parcel by ID
    const parcel = await Parcel.findById(parcelId)
      .populate("assignedAgent", "name phone")
      .populate("customer", "name phone");

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
const assignParcel = async (req, res) => {
  try {
    const io = req.app.get("io");
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { parcelId } = req.params;
    const { agentId } = req.body;

    // Validate agent exists and has role 'Delivery Agent'
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "agent") {
      return res.status(400).json({ message: "Invalid agent" });
    }
    // Find parcel and check if already assigned
    const existingParcel = await Parcel.findById(parcelId);
    if (!existingParcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (existingParcel.assignedAgent) {
      return res
        .status(400)
        .json({ message: "Parcel already assigned to an agent" });
    }
    // Assign agent to parcel
    const parcel = await Parcel.findByIdAndUpdate(
      parcelId,
      {
        assignedAgent: agentId,
        status: "Assigned",
      },
      { new: true }
    ).populate("assignedAgent", "name phone email");

    if (!parcel) {
      return res
        .status(404)
        .json({ success: false, message: "Parcel not found" });
    }
    io.emit("statusUpdated", {
      parcelId,
      status: parcel?.status,
    });

    res.json({ success: true, message: "Agent assigned successfully", parcel });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const getAgents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({ role: "agent" }, "-password"); // exclude password field
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const getDashboardMetrics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Daily Bookings (booked today)
    const dailyBookings = await Parcel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // 2. Failed Deliveries (status === "failed")
    const failedDeliveries = await Parcel.countDocuments({ status: "Failed" });

    // 3. Total COD Amounts for today (created today and has COD)
    const codResult = await Parcel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          paymentType: "COD", // Assuming you store this way
        },
      },
      {
        $group: {
          _id: null,
          totalCOD: { $sum: "$price" },
        },
      },
    ]);

    const totalCODAmount = codResult[0]?.totalCOD || 0;

    res.json({
      dailyBookings,
      failedDeliveries,
      totalCODAmount,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const exportParcelsPDF = async (req, res) => {
  try {
    const parcels = await Parcel.find().populate("customer assignedAgent");

    // Create the PDF document in memory
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    // Set proper headers BEFORE piping
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="parcels_report.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Parcels Report", { align: "center" });
    doc.moveDown();

    parcels.forEach((p, i) => {
      doc
        .fontSize(12)
        .text(`Tracking ID: ${p._id}`)
        .text(`Customer: ${p.customer?.name || "N/A"}`)
        .text(`Agent: ${p.assignedAgent?.name || "N/A"}`)
        .text(`Status: ${p.status}`)
        .text(`Price: ${p.price}`)
        .text(`Date: ${new Date(p.createdAt).toLocaleDateString()}`)
        .moveDown();
    });

    doc.end(); // End the PDF stream here
  } catch (err) {
    console.error(err);

    // Check if headers are already sent before responding
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
};

const exportParcelsCSV = async (req, res) => {
  try {
    const parcels = await Parcel.find().populate("customer assignedAgent");

    const fields = [
      { label: "Tracking ID", value: "_id" },
      { label: "Customer Name", value: "customer.name" },
      { label: "Agent Name", value: "assignedAgent.name" },
      { label: "Status", value: "status" },
      { label: "Price", value: "price" },
      { label: "Created At", value: "createdAt" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(parcels);

    res.header("Content-Type", "text/csv");
    res.attachment("parcels_report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};
module.exports = {
  getUsers,
  getAllBooking,
  getSingleBooking,
  assignParcel,
  getAgents,
  getDashboardMetrics,
  exportParcelsPDF,
  exportParcelsCSV,
};
