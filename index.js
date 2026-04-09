require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Log = require("./models/Log");
const { normalizeLog } = require("./normalizer");
const { checkAnomaly } = require("./anomaly");
const { UserStat } = require("./aggregation");

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB Error:", err));

// POST /logs - normalize, check anomaly, save
app.post("/logs", async (req, res) => {
  try {
    const normalized = normalizeLog(req.body);
    
    // Check for anomaly
    const hasAnomaly = checkAnomaly(normalized);
    normalized.anomaly_flag = hasAnomaly;
    
    // Save to MongoDB
    const log = new Log(normalized);
    const saved = await log.save();
    
    res.json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /logs - filter and paginate
app.get("/logs", async (req, res) => {
  try {
    const { user_id, start, end, action, source, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (user_id) filter.user_id = user_id;
    if (action) filter.action = action;
    if (source) filter.source = source;
    
    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = new Date(start);
      if (end) filter.timestamp.$lte = new Date(end);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Log.countDocuments(filter);
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({ total, logs });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /anomalies - last 50 anomalous logs
app.get("/anomalies", async (req, res) => {
  try {
    const logs = await Log.find({ anomaly_flag: true })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(logs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /vendor-access - last 50 vendor logs
app.get("/vendor-access", async (req, res) => {
  try {
    const logs = await Log.find({ role: "vendor" })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(logs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /top-users - top 10 users by access count using aggregation
app.get("/top-users", async (req, res) => {
  try {
    const topUsers = await Log.aggregate([
      {
        $group: {
          _id: "$user_id",
          total_access: { $sum: 1 },
          last_access: { $max: "$timestamp" }
        }
      },
      {
        $sort: { total_access: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.json(topUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /stats/:user_id - stats for a specific user
app.get("/stats/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const logs = await Log.find({ user_id });
    
    if (logs.length === 0) {
      return res.json({
        user_id,
        total_access: 0,
        unique_resources: 0,
        last_access: null
      });
    }
    
    const resources = new Set(logs.map(log => log.resource));
    const lastAccess = new Date(Math.max(...logs.map(log => log.timestamp)));
    
    res.json({
      user_id,
      total_access: logs.length,
      unique_resources: resources.size,
      last_access: lastAccess
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /resource-stats - all UserStat documents sorted by total_access descending
app.get("/resource-stats", async (req, res) => {
  try {
    const stats = await UserStat.find()
      .sort({ total_access: -1 });
    
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /hourly-activity/:user_id - hourly activity for a specific user
app.get("/hourly-activity/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const userStat = await UserStat.findOne({ user_id });
    
    if (!userStat) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      user_id,
      hourly_activity: Object.fromEntries(userStat.hourly_activity)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /aggregation/:user_id - full UserStat document for a specific user
app.get("/aggregation/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const userStat = await UserStat.findOne({ user_id });
    
    if (!userStat) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      user_id: userStat.user_id,
      total_access: userStat.total_access,
      unique_resources: userStat.unique_resources,
      last_access: userStat.last_access,
      resource_counts: Object.fromEntries(userStat.resource_counts),
      hourly_activity: Object.fromEntries(userStat.hourly_activity)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
