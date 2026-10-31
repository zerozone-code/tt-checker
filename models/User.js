const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, sparse: true, default: null },
    phone: { type: String, sparse: true, default: null },
    password: { type: String, required: true }, // Plain text as requested
    otp: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
