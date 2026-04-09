function generateApiLog() {
  const users = ["u201", "u202", "u203"];
  const resources = ["/api/products", "/api/checkout", "/api/admin"];
  const roles = ["user", "vendor", "admin"];
  
  return {
    user_id:   users[Math.floor(Math.random() * users.length)],
    role:      roles[Math.floor(Math.random() * roles.length)],
    resource:  resources[Math.floor(Math.random() * resources.length)],
    action:    Math.random() > 0.5 ? "READ" : "WRITE",
    timestamp: new Date(),
    source:    "API"
  };
}

module.exports = { generateApiLog };
