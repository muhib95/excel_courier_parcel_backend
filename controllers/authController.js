// controllers/authController.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

///Token create here
const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const register = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    const existing = await User.findOne({ phone });
    if (existing)
      return res
        .status(200)
        .json({ success: false, message: "Phone already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, phone, password: hashed, role });
    const token = createToken(user);
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: { name: user?.name, phone: user?.phone, role: user?.role },
      token: token,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user)
      return res.status(400).json({ message: "Invalid phone or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid phone or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "User login successfully",
      user: { name: user?.name, phone: user?.phone, role: user?.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  register,
  login,
};
