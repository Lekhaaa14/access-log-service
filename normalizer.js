function normalizeLog(rawLog) {
  return {
    user_id:   String(rawLog.user_id || ""),
    role:      String(rawLog.role || ""),
    resource:  String(rawLog.resource || ""),
    action:    rawLog.action === "WRITE" ? "WRITE" : "READ",
    timestamp: rawLog.timestamp ? new Date(rawLog.timestamp) : new Date(),
    source:    ["DB", "API", "VENDOR"].includes(rawLog.source) ? rawLog.source : "API",
    anomaly_flag: false
  };
}

module.exports = { normalizeLog };
