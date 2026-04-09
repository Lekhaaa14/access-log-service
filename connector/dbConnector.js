function generateDbLog() {
  const users = ["u101", "u102", "u103"];
  const resources = ["/db/users", "/db/orders", "/db/payments"];
  return {
    user_id:   users[Math.floor(Math.random() * users.length)],
    role:      "admin",
    resource:  resources[Math.floor(Math.random() * resources.length)],
    action:    Math.random() > 0.5 ? "READ" : "WRITE",
    timestamp: new Date().toISOString(),
    source:    "DB"
  };
}

module.exports = { generateDbLog };