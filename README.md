# Technical Challenge - Data Discovery & Removal Automation

## Job Context

**Optery** is hiring a Full Stack Developer for their data discovery and removal automation team. The company builds crawlers and automated workflows that find and remove personal information from data broker websites.

## Required Tech Stack

### Core Requirements
- **Node.js** - Primary backend
- **Asynchronous Programming** - Event-driven architecture
- **Web Scraping & Crawlers** - Automated data extraction
- **Databases** - PostgreSQL (relational), Redis (cache), MongoDB/Elasticsearch (NoSQL)
- **REST APIs** - Third-party service integration
- **Security** - Best practices for handling sensitive data
- **HTML/CSS** - Basic front-end

### Bonus Skills
- **Puppeteer** - Web automation and scraping
- **Generative AI** - Enhance automation workflows
- **Python/Django** - Integration with other services
- **RabbitMQ/Kafka** - Event brokers for queues
- **Kubernetes/AWS/GCP** - Deployment and scalability

---

## The Challenge: Personal Data Discovery System

Build an automated data discovery system that simulates Optery's core functionality.

### Objective

Create a system that:
1. **Crawls data** from multiple simulated/real websites using Puppeteer
2. **Processes information** asynchronously using queues (RabbitMQ or similar)
3. **Stores results** in PostgreSQL with Redis cache
4. **Exposes a REST API** to query and manage scans
5. **Uses generative AI** (optional) to improve data extraction
6. **Implements security** to protect sensitive data

---

## Functional Requirements

### 1. Web Crawler Service (Node.js + Puppeteer)

Implement a crawler that:
- Receives a list of target URLs and search criteria (name, email, phone, address)
- Uses Puppeteer to navigate and extract data in headless mode
- Handles multiple pages concurrently (rate limiting)
- Captures screenshots as evidence
- Handles errors (timeouts, CAPTCHAs, blocked pages)
- Emits events during the process (progress, found_data, error, completed)

**Tech Stack:** Node.js, Puppeteer, EventEmitter

### 2. Queue System (RabbitMQ or Bull)

Implement a queue system to:
- Enqueue crawling tasks
- Process multiple jobs in parallel with workers
- Retry failed tasks (retry logic)
- Prioritize certain scans (priority queue)
- Track job status (pending, processing, completed, failed)

**Tech Stack:** RabbitMQ/Bull (Redis), Event-driven architecture

### 3. Database Layer

**PostgreSQL:**
- `scans` - Information for each requested scan
- `findings` - Personal data found (encrypted)
- `websites` - Catalog of sites to crawl
- `screenshots` - Visual evidence

**Redis:**
- Cache for frequent results
- Session management
- Rate limiting per IP/user

**Suggested structure:**
```sql
-- Scan requests
CREATE TABLE scans (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  target_name VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Personal data findings
CREATE TABLE findings (
  id UUID PRIMARY KEY,
  scan_id UUID REFERENCES scans(id),
  website_url VARCHAR(255),
  data_type VARCHAR(50), -- email, phone, address
  encrypted_value TEXT,
  screenshot_url TEXT,
  found_at TIMESTAMP
);
```

### 4. REST API (Express.js)

Required endpoints:

```
POST   /api/scans              - Create new scan
GET    /api/scans/:id          - Get status and results
GET    /api/scans/:id/findings - List found data
DELETE /api/findings/:id       - Request removal (mark for removal)
GET    /api/stats              - Statistics (total scans, findings, etc.)
```

### 5. Security Implementation

- Encrypt sensitive data (AES-256) before storing
- Implement rate limiting (express-rate-limit)
- Validate and sanitize inputs
- Use environment variables for secrets
- Implement basic authentication (JWT or API keys)
- Logs without exposing sensitive information

### 6. AI Integration (Bonus)

Use an AI API (OpenAI, Anthropic, etc.) to:
- Detect personal information in unstructured text
- Generate intelligent CSS/XPath selectors when site structure changes
- Classify confidence of found data
- Suggest related sites to crawl

---

## Deliverables

### Minimum Viable (Core Requirements)

1. **Basic crawler** with Puppeteer that extracts data from at least 3 sites
2. **RabbitMQ/Bull Queue** - Fully functional queue system with workers
3. **PostgreSQL database** with complete schema and connection pooling
4. **Redis cache** - For results caching and rate limiting
5. **REST API** with the 5 main endpoints
6. **Encryption** of sensitive data (AES-256)
7. **AI integration** - Basic usage for data extraction or classification
8. **Monitoring & Alerting** - Structured logs, health checks, basic metrics
9. **Graceful Shutdown** - Workers finish current jobs before stopping
10. **Tests** (Jest) with coverage >60%
11. **Simple front-end** - Basic UI to visualize scans and results
12. **Technical README** with setup instructions and production considerations

### Advanced (Bonus Points)

**Critical for Production (highly recommended):**

13. **Circuit Breakers** - Prevent cascading failures when sites are down (use `opossum` library)
14. **Dead Letter Queue** - Handle jobs that fail repeatedly after retries
15. **Horizontal Scaling** - Docker Compose with multiple worker instances
16. **Distributed Tracing** - Track requests across services (OpenTelemetry or similar)
17. **Backpressure Handling** - Gracefully handle queue saturation
18. **Idempotent Operations** - Ensure duplicate jobs don't cause issues

**Nice to Have:**

19. **Kafka** - Alternative event streaming platform
20. **Advanced AI** - Self-healing crawlers that adapt to site changes
21. **Comprehensive Tests** - Coverage >80%, integration tests, load tests
22. **Advanced Monitoring** - Prometheus + Grafana dashboards
23. **Database Sharding** - Strategy for horizontal database scaling
24. **CDN Integration** - For storing and serving screenshots at scale

---

## Production Readiness Considerations

Include a section in your README discussing how you would handle production scale (100K+ scans/day). Address:

### Scalability

**Current Bottlenecks:**
- How many concurrent crawls can your system handle?
- What happens when queue has 10K pending jobs?
- Database query performance with millions of records?

**Scaling Strategy:**
- How would you scale to 10x, 100x traffic?
- When do you need to shard/partition the database?
- How do you distribute crawler workers across multiple machines?
- CDN strategy for storing millions of screenshots

### Reliability

**Failure Scenarios:**
- What happens if a worker crashes mid-job?
- How do you prevent data loss?
- What's your disaster recovery plan?
- How do you handle partial failures (some sites work, others don't)?

**Monitoring:**
- What metrics would you track? (queue depth, job success rate, crawl duration, API latency)
- What alerts would you set up?
- How do you know the system is healthy?

### Performance Optimization

- Database indexes needed for your queries
- Connection pooling configuration
- Memory management for Puppeteer instances
- Optimal worker count per machine
- When to use Redis cache vs database

### Cost Optimization

- How do you prevent abuse (rate limiting, authentication)?
- Puppeteer resource usage (memory, CPU)
- Database storage growth over time
- Queue infrastructure costs at scale

**Document your decisions and trade-offs.** Optery processes data for hundreds of thousands of users - show you understand production systems.

---

## Evaluation

Your solution will be evaluated on:

1. **Architecture** - Event-driven, scalable, modular, production-ready thinking
2. **Asynchronous code** - Proper handling of Promises, async/await, events
3. **Performance** - Efficient crawling, cache, optimized queries
4. **Security** - Encryption, validation, best practices
5. **Error handling** - Resilience, retries, circuit breakers, graceful degradation
6. **Scalability awareness** - Understanding of bottlenecks and scaling strategies
7. **Code quality** - Clean code, separation of concerns, DRY
8. **Documentation** - Clear README, production considerations, useful comments

---

## Suggested Setup

```bash
# Project structure
data-discovery-system/
├── src/
│   ├── crawler/
│   │   ├── puppeteer-crawler.js
│   │   └── data-extractor.js
│   ├── queue/
│   │   ├── job-queue.js
│   │   └── workers.js
│   ├── database/
│   │   ├── postgres.js
│   │   ├── redis.js
│   │   └── models/
│   ├── api/
│   │   ├── routes/
│   │   └── controllers/
│   ├── security/
│   │   └── encryption.js
│   └── ai/ (bonus)
│       └── ai-extractor.js
├── tests/
├── docker-compose.yml
├── package.json
└── .env.example
```

---

## Estimated Time

- **Minimum Viable (Core Requirements):** 25-35 hours
- **Production-ready (Core + critical patterns):** 35-45 hours
- **Complete version (everything):** 50-60 hours

**Recommendation for interview:** Complete the full Minimum Viable version (25-35h) - it demonstrates production-level thinking

---

## Preparation Resources

### Core Technologies
- **Puppeteer Docs:** https://pptr.dev/
- **RabbitMQ Tutorial:** https://www.rabbitmq.com/getstarted.html
- **Bull Queue:** https://github.com/OptimalBits/bull
- **Node.js Crypto:** https://nodejs.org/api/crypto.html
- **PostgreSQL with Node:** https://node-postgres.com/

### Advanced Patterns
- **Circuit Breaker (Opossum):** https://nodeshift.dev/opossum/
- **OpenTelemetry:** https://opentelemetry.io/docs/instrumentation/js/
- **Graceful Shutdown:** https://nodejs.org/api/process.html#process_signal_events
- **Docker Compose Scaling:** https://docs.docker.com/compose/compose-file/deploy/

---

## Implementation Roadmap

### Week 1: Core Infrastructure (Days 1-3)

**Day 1: Foundation**
1. Setup project structure with Docker Compose
2. Configure PostgreSQL with connection pooling
3. Setup Redis for caching
4. Create database schema and migrations
5. **Goal:** Database infrastructure ready

**Day 2: Crawler & Queue**
6. Implement Puppeteer crawler with error handling
7. Setup RabbitMQ/Bull queue system
8. Create worker processes
9. Implement retry logic
10. **Goal:** Crawling pipeline functional

**Day 3: API & Security**
11. Build REST API with Express
12. Implement AES-256 encryption for sensitive data
13. Add rate limiting and input validation
14. Create authentication layer (JWT/API keys)
15. **Goal:** Secure API ready

### Week 2: Production Features (Days 4-5)

**Day 4: Monitoring & Reliability**
16. Add structured logging (Winston/Pino)
17. Implement health check endpoints
18. Add graceful shutdown handlers
19. Create basic metrics collection
20. Setup error alerting
21. **Goal:** Observable and resilient system

**Day 5: AI, Testing & UI**
22. Integrate AI API for data extraction
23. Write unit and integration tests (Jest)
24. Build simple front-end (React/Vue/vanilla JS)
25. Write comprehensive README with production considerations
26. Document architecture and trade-offs
27. **Goal:** Complete minimum viable solution

### Week 3 (Optional): Advanced Patterns

**For production-ready version, add:**
- Circuit Breakers (Day 6)
- Dead Letter Queue (Day 6)
- Horizontal Scaling with Docker (Day 7)
- Distributed Tracing (Day 7)
- Backpressure Handling (Day 8)
- Idempotent Operations (Day 8)

---

## Important Notes

- You can use public test sites (quotes.toscrape.com, books.toscrape.com)
- If using AI APIs, include rate limiting to avoid spending credits
- Document architecture decisions and trade-offs
- Code should be ready for code review
- **Focus on 2-3 patterns done well over many done poorly**

---

## Interview Tips

When presenting this project:

1. **Start with the architecture diagram** - Show how components interact
2. **Explain trade-offs** - Why you chose Bull vs RabbitMQ, PostgreSQL vs MongoDB, etc.
3. **Discuss failures** - What would break at 1M requests/day? How would you fix it?
4. **Show metrics awareness** - What would you monitor in production?
5. **Talk about real Optery challenges** - CAPTCHA handling, site structure changes, data accuracy
6. **Be honest about limitations** - "This works for 10K/day, but at 100K/day we'd need X"

**Good luck!** This challenge reflects the real work you'll do at Optery.

