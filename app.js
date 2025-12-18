// app.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const parcelRoutes = require("./routes/parcel");
const agentRoutes = require("./routes/agent");
const adminRoutes = require("./routes/admin");
const authMiddleware = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.BASE_URL, // use your frontend URL
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

// ✅ Socket.IO Connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
// ✅ Make io available in routes
app.set("io", io);
// Routes
app.get("/", authMiddleware, (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/admin", adminRoutes);

module.exports = { app, server }; // Export the app instance
