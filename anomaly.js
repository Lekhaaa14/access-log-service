const requestTracker = {};

function checkAnomaly(log) {
  // Rule (a): timestamp hour is before 9 or after 18
  const hour = new Date(log.timestamp).getHours();
  if (hour < 9 || hour > 18) {
    return true;
  }

  // Rule (b): same user_id made more than 10 requests in the last 60 seconds
  const userId = log.user_id;
  const now = Date.now();
  const windowStart = now - 60000; // 60 seconds ago

  // Initialize tracker for this user if needed
  if (!requestTracker[userId]) {
    requestTracker[userId] = [];
  }

  // Add current request timestamp
  requestTracker[userId].push(now);

  // Remove requests older than 60 seconds
  requestTracker[userId] = requestTracker[userId].filter(ts => ts > windowStart);

  // Check if more than 10 requests in the last 60 seconds
  if (requestTracker[userId].length > 10) {
    return true;
  }

  // Rule (c): role is "vendor" and resource is "/api/admin" or "/db/payments"
  if (log.role === "vendor" && (log.resource === "/api/admin" || log.resource === "/db/payments")) {
    return true;
  }

  return false;
}

module.exports = { checkAnomaly };
