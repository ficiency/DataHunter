<div align="center">
  <img src="docs/gh_logo.png" alt="DataHunter Logo" width="80" style="vertical-align: middle;"/> <h1 style="display: inline;">DataHunter</h1>
  
  ### Data Discovery & Privacy Scanner
  
  A scalable, production-ready web scraping system that discovers personal information across multiple data broker websites. Built with Node.js, Puppeteer, RabbitMQ, and React.
</div>

## 🎬 Demo

![DataHunter Demo](docs/datahunt_demo.gif)

*Real-time scanning across 15+ data broker websites with live progress tracking*

---

## 🎯 Features

- **Concurrent Web Scraping** - Scan 15+ websites simultaneously using Puppeteer Cluster
- **Asynchronous Queue System** - RabbitMQ for efficient job processing and load balancing
- **Data Security** - AES-256-GCM encryption for PII at rest + sanitized logging
- **Scalable Architecture** - Support for multiple workers and horizontal scaling
- **Anti-Bot Evasion** - Stealth mode, realistic headers, human-like behavior
- **Real-time Progress** - WebSocket-like polling for live scan updates
- **Modern UI** - React + Vite + TailwindCSS with smooth animations

---

## 📁 Project Structure

```
datahunter/                   # Root directory
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── api/             # REST API (Express)
│   │   │   ├── controllers/ # Request handlers
│   │   │   ├── routes/      # Express routes
│   │   │   └── server.js    # Express setup
│   │   ├── crawler/         # Web scraping logic
│   │   │   ├── crawler-service.js
│   │   │   ├── data-extractor.js
│   │   │   ├── screenshot-handler.js
│   │   │   └── sites-config.js
│   │   ├── database/        # PostgreSQL integration
│   │   │   ├── postgres.js
│   │   │   └── schema.sql
│   │   ├── queue/           # RabbitMQ integration
│   │   │   └── rabbitmq-queue.js
│   │   ├── utils/           # Encryption & PII masking
│   │   │   ├── encryption.js
│   │   │   └── pii-mask.js
│   │   ├── workers/         # Background job workers
│   │   │   └── scan-worker.js
│   │   ├── config.js        # Configuration
│   │   └── index.js         # Entry point
│   ├── scripts/             # Test scripts
│   ├── package.json
│   └── .env
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── InputForm.jsx
│   │   │   ├── ScanningView.jsx
│   │   │   ├── ResultsView.jsx
│   │   │   ├── MetricsCard.jsx
│   │   │   ├── FindingCard.jsx
│   │   │   └── NetworkBackground.jsx
│   │   ├── App.jsx          # Main app
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── uploads/                  # Screenshots storage (shared)
│   └── screenshots/
├── docker-compose.yml        # PostgreSQL + RabbitMQ
├── .gitignore               # Git ignore rules
└── README.md
```

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### **1. Start Infrastructure**

```bash
docker compose up -d
```

This starts:
- PostgreSQL (port 5432)
- RabbitMQ (port 5672, management UI: 15672)

### **2. Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5432/data_discovery
DB_POOL_MIN=2
DB_POOL_MAX=10
PORT=3000
NODE_ENV=development
ENCRYPTION_KEY=3f96c2b7561f759982563e23e59d98865e63c969503e2949188c905490d56781
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000
LOG_LEVEL=info
EOF

# Start API server
npm start
```

### **3. Start Worker**

Open a new terminal:

```bash
cd backend
node src/workers/scan-worker.js
```

### **4. Start Frontend**

Open another terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🔧 Configuration

### **Backend (.env)**

```bash
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/data_discovery
DB_POOL_MIN=2
DB_POOL_MAX=10

# API
PORT=3000
NODE_ENV=development

# Security
ENCRYPTION_KEY=<64-char-hex-key>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000

# Logging
LOG_LEVEL=info
```

### **Scaling Workers**

Run multiple workers for better performance:

```bash
cd backend

# Terminal 1
node src/workers/scan-worker.js

# Terminal 2
node src/workers/scan-worker.js

# Terminal 3
node src/workers/scan-worker.js
```

With 3 workers and `prefetch=5`, you can process **15 scans simultaneously**.

---

## 📊 Architecture

### **System Flow**

```
User Input → API → RabbitMQ → Worker → Puppeteer Cluster → Database
                        ↓
                   PostgreSQL
```

### **Key Components**

1. **API Server** (`src/api/server.js`)
   - REST endpoints for scan creation/retrieval
   - Enqueues jobs to RabbitMQ
   - Returns encrypted PII (decrypted on read)

2. **RabbitMQ Queue** (`src/queue/rabbitmq-queue.js`)
   - Job distribution across workers
   - Automatic retries on failure
   - Prefetch for concurrent processing

3. **Scan Worker** (`src/workers/scan-worker.js`)
   - Consumes jobs from queue
   - Manages persistent Puppeteer cluster
   - Processes multiple scans concurrently

4. **Crawler Service** (`src/crawler/crawler-service.js`)
   - Orchestrates Puppeteer cluster (15 concurrent tabs)
   - Anti-bot evasion techniques
   - Data extraction and storage

5. **Data Extractor** (`src/crawler/data-extractor.js`)
   - Regex-based PII extraction
   - Validates emails, phones, names

---

## 🔒 Security Features

### **1. Encryption at Rest**
- All PII encrypted with AES-256-GCM before storage
- Unique IV per record
- Authentication tags for tamper detection

### **2. PII Masking in Logs**
- Email: `j***n@g***.com`
- Phone: `***-***-1234`
- Name: `J*** D***`

### **3. Input Validation**
- SQL injection prevention
- XSS protection
- Request rate limiting

---

## 📈 Performance

### **Metrics (15 websites, 1 worker)**
- Scan time: ~20-30 seconds
- Concurrent tabs: 15
- Memory: ~800MB per worker

### **Scalability**
- **1 Worker:** 5 concurrent scans
- **3 Workers:** 15 concurrent scans
- **5 Workers:** 25 concurrent scans

### **Resource Usage**
- CPU: ~30-50% per worker
- RAM: ~800MB per worker
- Disk: Minimal (screenshots are JPEG compressed)

---

## 🧪 Testing

### **Test Database Connection**

```bash
cd backend
node scripts/test-db.js
```

### **Test RabbitMQ Flow**

```bash
node scripts/test-rabbitmq-flow.js
```

### **Manual Scan**

```bash
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"targetName": "John Doe", "state": "CA"}'
```

---

## 🌐 Supported Data Brokers

1. Addresses.com
2. 411.com
3. Wikipedia
4. TruePeopleSearch
5. FastPeopleSearch
6. WhitePages
7. AnyWho
8. PeekYou
9. Radaris
10. ThatsThem
11. USPhoneBook
12. Webmii
13. Zabasearch
14. PeopleFinders
15. Spokeo

*Note: Some sites have aggressive anti-bot measures. Success rates may vary.*

---

## 🐛 Troubleshooting

### **Worker not processing jobs**

```bash
# Restart worker
pkill -f scan-worker
node src/workers/scan-worker.js
```

### **Database connection issues**

```bash
# Check PostgreSQL
docker ps | grep postgres

# Restart PostgreSQL
docker compose restart postgres
```

### **Clear database**

```bash
docker exec -it dds-postgres psql -U postgres -d data_discovery -c "TRUNCATE TABLE findings, scans CASCADE;"
```

### **RabbitMQ queue stuck**

```bash
# Access management UI
open http://localhost:15672
# Login: admin / admin123
# Go to Queues tab → Purge messages
```

---

## 📝 API Documentation

### **Create Scan**

```http
POST /api/scans
Content-Type: application/json

{
  "targetName": "John Doe",
  "state": "CA"
}
```

**Response:**
```json
{
  "scanId": "uuid",
  "status": "processing",
  "message": "Scan queued successfully"
}
```

### **Get Scan Results**

```http
GET /api/scans/:id
```

**Response:**
```json
{
  "scan": {
    "id": "uuid",
    "target_name": "John Doe",
    "status": "completed",
    "created_at": "2025-10-26T...",
    "completed_at": "2025-10-26T..."
  },
  "findings": [
    {
      "id": 1,
      "website_url": "https://...",
      "data_type": "email",
      "found_value": "john@example.com",
      "found_at": "2025-10-26T..."
    }
  ]
}
```

---

## 🤝 Contributing

This is a technical challenge project. Not accepting contributions.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👤 Author

**Luis Chapa**

---

## 🙏 Acknowledgments

- Built with modern best practices for scalability and security
- Uses battle-tested libraries: Puppeteer, RabbitMQ, PostgreSQL

---

**⭐ If you're reviewing this for a technical interview, thank you for your time!**

