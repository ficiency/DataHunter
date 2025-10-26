<div align="center">
  <h1>
    <img src="docs/gh_logo.png" alt="DataHunter Logo" width="40" style="vertical-align: middle;"/> 
    DataHunter
  </h1>
  
  <h3>Data Discovery & Privacy Scanner</h3>
</div>

A scalable, production-ready web scraping system that discovers personal information across multiple data broker websites. Built with Node.js, Puppeteer, RabbitMQ, PostgreSQL, Docker and React.

## 🎬 Demo

![DataHunter Demo](docs/datahunter_demo.gif)

*Real-time scanning across 40 data broker websites with live progress tracking. Watch the <a href="https://drive.google.com/file/d/1yJ2oA-KiKrYSYo9zTFQMe1h2R0OpaJt5/view?usp=sharing" target="_blank" rel="noopener noreferrer">full quality video here</a>.*

---

## 📖 What is a Scan?

A **scan** is a complete search operation for one person (e.g., "John Doe") across all 40 configured data broker websites. Each scan:
- Uses 15 concurrent browser tabs
- Searches across 40 different websites
- Completes in approximately 30 seconds
- Returns all discovered PII (emails, phones, addresses)

**Example:** If you run 3 scans simultaneously, you're searching for 3 different people at the same time.

---

## 🎯 Key Features

- **Production-Grade Concurrency** - Puppeteer Cluster with persistent browser instances (15 concurrent tabs per worker)
- **Distributed Architecture** - RabbitMQ-based job queue enabling horizontal scaling and fault tolerance across multiple workers
- **Enterprise Security** - AES-256-GCM encryption at rest, PII masking in logs, secure screenshot storage
- **Real-time Updates** - Live scan progress with per-website processing metrics and completion status
- **Anti-Bot Evasion** - Stealth mode with puppeteer-extra-plugin, realistic browser fingerprints

---

## 📊 Architecture & Technical Decisions

### **System Flow**

```
User Input → API → RabbitMQ Queue → Worker Pool → Puppeteer Cluster (15 tabs) → PostgreSQL
                        ↓
                   Job Distribution & Fault Tolerance
```

### **Why RabbitMQ?**

Asynchronous job queue with RabbitMQ provides:
- **Decoupling** - API responds instantly, heavy lifting happens in background
- **Horizontal Scaling** - Add workers on-demand without code changes
- **Fault Tolerance** - Failed jobs auto-retry, no data loss
- **Load Balancing** - Prefetch mechanism (`prefetch=5`) enables 15 people searches simultaneously with 3 workers (600 website searches)

### **Why Puppeteer Cluster?**

Puppeteer Cluster with persistent browsers:
- **Concurrency** - 15 parallel browser tabs per worker, processing 40 sites per person in ~30 seconds
- **Resource Efficiency** - Single browser process per worker (~800MB vs 8GB+ for individual instances)
- **Stability** - Auto-restarts crashed tabs, maintains cluster health
- **Real-time Metrics** - Per-website processing time tracking for performance monitoring

### **Core Architecture Components**

**1. API Layer (`server.js`)** - Express 5.1 with Helmet security, CORS, rate limiting (100 req/15min), and static screenshot serving

**2. Queue System (`rabbitmq-queue.js`)** - Singleton pattern with persistent connection, priority queuing (1-10), prefetch control for concurrency, and ACK/NACK for fault tolerance

**3. Worker Pool (`scan-worker.js`)** - Event-driven workers with graceful lifecycle (SIGTERM/SIGINT), persistent cluster initialization, and automatic reconnection on failures

**4. Crawler Service (`crawler-service.js`)** - Persistent Puppeteer Cluster with `CONCURRENCY_PAGE` (isolated contexts), resource blocking (images/fonts/media), and `networkidle2` navigation strategy

**5. Data Extraction (`data-extractor.js`)** - Regex-based PII parsing with validation pipeline (email/phone format checks, deduplication, length constraints)

**6. Security Layer** - AES-256-GCM encryption with unique IV per record and auth tags, PII masking in all logs, parameterized SQL queries, connection pooling (2-10 connections)

**7. Sites Config (`sites-config.js`)** - Strategy pattern with 40 site-specific URL builders, state normalization (handles "CA" or "California"), and priority-based scanning

---

## 🔒 Security Features

### **1. Encryption at Rest**
- All PII encrypted with AES-256-GCM before storage (industry standard: TLS 1.3, AWS, GCP)
- Unique IV (Initialization Vector) per record prevents replay attacks
- Authentication tags enable tamper detection (AEAD - Authenticated Encryption with Associated Data)
- Format: `iv:authTag:encrypted` stored as single DB column

### **2. PII Masking in Logs**
- Email: `j***e@g***.com` (first + last char of user/domain)
- Phone: `***-***-1234` (last 4 digits only)
- Name: `J*** D***` (first char of each word)
- Prevents accidental PII exposure in plain-text logs, GDPR/CCPA compliant

### **3. Input Validation & Protection**
- Parameterized SQL queries (`$1`, `$2`) prevent injection attacks
- Helmet middleware blocks XSS, clickjacking, MIME sniffing
- Rate limiting (100 req/15min) prevents DoS and API abuse
- Connection pooling (2-10) prevents connection exhaustion

---

## 📈 Performance Metrics

### **Current Performance (1 scan = 1 person across 40 websites)**
- **Scan Time:** ~30 seconds per person (15 concurrent tabs)
- **Memory:** ~800MB per worker
- **Concurrent Capacity:** 5 people simultaneously = 200 website searches in parallel
- **Success Rate:** ~32/40 websites (80%) - Some have stronger anti-bot measures
- **Processing Time/Site:** 1-15 seconds average

### **Scalability**
| Workers | Concurrent Scans (people) | Website Searches | Total Throughput |
|---------|---------------------------|------------------|------------------|
| 1       | 5                         | 200 in parallel  | ~10/min          |
| 3       | 15                        | 600 in parallel  | ~30/min          |
| 5       | 25                        | 1,000 in parallel| ~50/min          |

### **Resource Optimization**
- **Persistent Browser Instances** - Reuse across scans (~10x throughput improvement, no cold start penalty)
- **`networkidle2` Strategy** - Waits for AJAX content without getting stuck on persistent connections (sweet spot between `domcontentloaded` and `networkidle0`)
- **Resource Blocking** - Blocks images/fonts/media (60-70% faster page loads, 50% less bandwidth)
- **Parallel Processing** - 15 concurrent tabs processing 40 sites per person in ~30s (vs 20+ min sequential)

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
│   │   │   ├── ResultsView.jsx      # Real-time results with status
│   │   │   ├── MetricsCard.jsx      # Scan metrics & duration
│   │   │   ├── FindingCard.jsx
│   │   │   └── NetworkBackground.jsx # Animated canvas
│   │   ├── App.jsx          # Main app with scan polling
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/
│   │   └── logo.png         # DataHunter logo
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

With 3 workers and `prefetch=5`, you can process **15 scans simultaneously** (15 people × 40 sites = 600 website searches in parallel).

---

## 🧪 Testing

### **Test Database Connection**

Verifies PostgreSQL connection, pool configuration, and schema initialization.

```bash
cd backend
node scripts/test-db.js
```

### **Test RabbitMQ Flow**

Simulates 9 concurrent users creating scans, monitors queue processing, and validates worker distribution with real-time progress tracking.

```bash
node scripts/test-rabbitmq-flow.js
```

### **Manual Scan**

Creates a single scan via API and returns scan ID for monitoring.

```bash
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "target_name": "John Doe", "state": "CA"}'
```

---

## 🌐 Supported Data Brokers (40 Sites)

<details>
<summary><b>View Full List</b></summary>

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
16. BeenVerified
17. Intelius
18. InstantCheckmate
19. FamilyTreeNow
20. PublicRecordsNow
21. NeighborWho
22. PeopleSearchNow
23. AdvancedBackgroundChecks
24. CheckPeople
25. USSearch
26. Nuwber
27. SearchPeopleFree
28. Privateeye
29. InfoTracer
30. AddressSearch
31. TrueCaller
32. PeopleSmart
33. Yasni
34. Classmates
35. PhoneOwner
36. ReversePhoneLookup
37. PublicDataUSA
38. PeopleBackgroundCheck
39. VitalRec
40. CyberBackgroundChecks

</details>

*Average success rate: 80% (32/40 sites). Some sites have stronger anti-bot protections.*

---

## 🚧 Next Steps & Production Roadmap

### **1. Advanced Anti-Bot Evasion**

**Current Challenge:** ~20% of sites (8/40) have strong protections (Cloudflare, reCAPTCHA, fingerprinting).

**Proposed Solutions:**
- **Residential Proxy Rotation** - Rotate IPs across scans to avoid rate limits
- **Browser Fingerprint Randomization** - Randomize canvas, WebGL, audio fingerprints per session
- **Captcha Solving Integration** - 2Captcha/Anti-Captcha API for automated solving
- **Smart Retry Logic** - Exponential backoff with jitter, session persistence across retries

**Impact:** Could improve success rate from 80% → 95%+

### **2. Redis Caching Layer**

**Use Cases:**
- **Scan Results Cache** - Cache completed scans for 24h (reduce DB load by ~60%)
- **Rate Limit Tracking** - Track per-IP request counts to avoid bans
- **Session Management** - Store active scan states for real-time UI updates
- **Hot Data** - Cache frequently accessed website configurations

**Expected Benefits:**
- 3x faster repeat lookups
- Reduced database queries by 60%
- Better rate limit management

### **3. AI-Powered Features**

**A) Intelligent Data Analysis**
- **LLM-based Result Summarization** - GPT-4 to generate privacy risk scores and actionable insights
- **Anomaly Detection** - ML model to flag unusual data exposure patterns
- **Confidence Scoring** - AI to validate extracted PII accuracy

**B) Automated Opt-Out**
- **GPT-4V** - Vision model to navigate opt-out forms automatically
- **Multi-step Form Automation** - Handle complex opt-out workflows (email verification, captchas)
- **Success Tracking** - Monitor opt-out request status across sites


### **4. Kubernetes Deployment**

**Why Kubernetes?**
- **Auto-scaling** - Scale workers based on queue depth (HPA on RabbitMQ metrics)
- **High Availability** - Multi-node deployment with pod auto-restart
- **Resource Efficiency** - Better bin-packing, CPU/memory limits per worker

**Architecture:**
```yaml
- API Deployment (3 replicas, auto-scale 1-10)
- Worker StatefulSet (5 replicas, auto-scale 3-50)
- RabbitMQ StatefulSet (3-node cluster)
- PostgreSQL StatefulSet (primary + read replicas)
- Redis Deployment (cluster mode)
```

**Expected Improvements:**
- 10x throughput capacity (5 → 50+ workers)
- 99.9% uptime with rolling updates
- Cost optimization with spot instances

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

**Luis Chapa Morin**

---

**⭐ Built for scale, designed for production, ready for next-level enhancements.**

