const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("DB connection error:", err));

app.get("/api", async (req, res) => {
  res.json({ ok: "success" });
});
// 1. Login API (Email/Phone + Password) -> Saves with null OTP
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (!email && !phone) {
      return res
        .status(400)
        .json({ error: "Either email or phone is required" });
    }

    const query = email ? { email } : { phone };

    await User.findOneAndUpdate(
      query,
      { email: email || null, phone: phone || null, password, otp: null },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({
      message: "Login successful, proceed to OTP",
      identifier: email || phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Update OTP API (Updates 6-digit OTP)
app.post("/api/auth/update-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ error: "Identifier and OTP are required" });
    }
    if (otp.length !== 6) {
      return res.status(400).json({ error: "OTP must be 6 digits" });
    }

    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { phone: identifier };

    await User.findOneAndUpdate(query, { otp });

    res.status(200).json({ message: "OTP saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
