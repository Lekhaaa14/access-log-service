const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user_id:   { type: String, required: true, index: true },
  role:      { type: String, required: true },
  resource:  { type: String, required: true },
  action:    { type: String, enum: ["READ", "WRITE"], required: true },
  timestamp: { type: Date,   default: Date.now, index: true },
  source:    { type: String, enum: ["DB", "API", "VENDOR"], required: true },
  anomaly_flag: { type: Boolean, default: false }
});

module.exports = mongoose.model("Log", logSchema);