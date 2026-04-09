# Access Log Ingestion Service

A backend data engineering project that collects, normalizes, stores, and analyzes access logs from multiple sources.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- node-cron
- dotenv

## How to Run
1. Install dependencies:
   npm install
2. Make sure MongoDB is running
3. Start the server:
   node index.js
4. Server runs on http://localhost:3000

## Folder Structure
access-log-service/
├── models/
│   └── Log.js         → MongoDB schema with indexes
├── index.js           → all API endpoints
├── normalizer.js      → normalizes raw logs into standard schema
├── anomaly.js         → rule-based anomaly detection engine
├── aggregation.js     → cron job that runs every minute
├── dbConnector.js     → mock database log generator
├── apiConnector.js    → mock API log generator
├── db.js              → MongoDB connection
└── .env               → config (MongoDB URL, port)

## API Endpoints

### Log Ingestion
- POST /logs — save a log entry

### Query Layer
- GET /logs?user_id= — filter logs by user
- GET /logs?start=&end= — filter logs by time range
- GET /logs?action= — filter by READ or WRITE
- GET /logs?source= — filter by DB, API, or VENDOR

### Aggregation
- GET /stats/:user_id — total access, unique resources, last access
- GET /aggregation/:user_id — full aggregation with resource and hourly breakdown
- GET /resource-stats — all users ranked by access count
- GET /hourly-activity/:user_id — hour by hour activity for a user

### Dashboard APIs
- GET /top-users — top 10 users by access count
- GET /vendor-access — all vendor activity logs
- GET /anomalies — all flagged suspicious logs

## Anomaly Detection Rules
1. Access outside working hours (before 9am or after 6pm)
2. More than 10 requests from same user in 60 seconds
3. Vendor role accessing sensitive endpoints (/api/admin, /db/payments)

## Tasks Completed
- Task 1 — Log Ingestion Service with mock connectors and normalization
- Task 2 — Log Storage and Query Layer with filters and pagination
- Task 3 — Access Aggregation Engine with cron job running every minute
- Task 4 — Rule-Based Anomaly Detection tagging every log
- Task 5 — Dashboard Backend APIs for frontend integration