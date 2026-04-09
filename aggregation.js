const cron = require("node-cron");
const mongoose = require("mongoose");
const Log = require("./models/Log");

// Define UserStat schema and model
const userStatSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true, index: true },
  total_access: { type: Number, default: 0 },
  unique_resources: { type: Number, default: 0 },
  last_access: { type: Date },
  resource_counts: { type: Map, of: Number, default: new Map() },
  hourly_activity: { type: Map, of: Number, default: new Map() },
  updated_at: { type: Date, default: Date.now }
});

const UserStat = mongoose.model("UserStat", userStatSchema);

// Async function to run aggregation
async function runAggregation() {
  try {
    const results = await Log.aggregate([
      {
        $group: {
          _id: "$user_id",
          total_access: { $sum: 1 },
          unique_resources: {
            $addToSet: "$resource"
          },
          last_access: { $max: "$timestamp" },
          resources: { $push: "$resource" },
          timestamps: { $push: "$timestamp" }
        }
      }
    ]);

    // Process each user's aggregated data
    for (const result of results) {
      // Count unique resources
      const uniqueResourceCount = result.unique_resources.length;

      // Build resource_counts object
      const resourceCounts = {};
      result.resources.forEach(resource => {
        resourceCounts[resource] = (resourceCounts[resource] || 0) + 1;
      });

      // Build hourly_activity object
      const hourlyActivity = {};
      result.timestamps.forEach(timestamp => {
        const hour = String(timestamp.getHours()).padStart(2, "0");
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
      });

      // Save or update UserStat
      await UserStat.findOneAndUpdate(
        { user_id: result._id },
        {
          user_id: result._id,
          total_access: result.total_access,
          unique_resources: uniqueResourceCount,
          last_access: result.last_access,
          resource_counts: resourceCounts,
          hourly_activity: hourlyActivity,
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );
    }

    console.log(`Aggregation ran at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Aggregation error:", error);
  }
}

// Schedule aggregation to run every minute
cron.schedule("* * * * *", runAggregation);

// Run aggregation immediately when file is loaded
runAggregation();

// Export UserStat model and runAggregation function
module.exports = { UserStat, runAggregation };
