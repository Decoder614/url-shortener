# 🔗 URL Shortener API

A production-ready URL Shortener backend built with **Node.js**, **Express.js**, and **PostgreSQL**. This project is inspired by services like **Bit.ly** and is designed to demonstrate backend engineering skills including REST API development, database design, authentication, caching, analytics, rate limiting, and scalable architecture.

---

# 📖 Table of Contents

- Overview
- Features
- Tech Stack
- System Architecture
- Project Structure
- API Endpoints
- Database Schema
- Installation
- Environment Variables
- Running the Project
- Future Improvements
- Learning Goals
- License

---

# 🚀 Overview

This project allows users to convert long URLs into short, shareable links.

Example:

```
Original URL
https://www.google.com/search?q=nodejs+express+tutorial

↓

Short URL
https://short.ly/aB39Kd
```

When someone opens the short URL, the server redirects them to the original destination while recording analytics.

The goal of this project is not just to shorten URLs, but to build it the way a real backend engineer would.

---

# ✨ Features

## Core Features

- Create short URLs
- Redirect to original URLs
- Custom alias support
- URL validation
- Expiration date support
- Enable/Disable links
- Delete links
- Update destination URL

---

## Analytics

- Total clicks
- Unique visitors
- Referrer tracking
- Browser
- Operating System
- Country
- Device Type
- Click history
- Daily analytics

---

## Security

- Helmet
- CORS
- Rate Limiting
- Input Validation
- SQL Injection Protection
- XSS Protection

---

## Performance

- Redis Caching
- Database Indexing
- Compression
- Efficient Queries

---

## Authentication (Optional)

- JWT Authentication
- User Registration
- Login
- Refresh Tokens

Users can manage their own URLs after login.

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js

## Database

- PostgreSQL

## Cache

- Redis

## ORM

Choose one:

- Prisma (Recommended)
- Drizzle ORM
- Sequelize

---

## Validation

- Zod

---

## Authentication

- JWT
- bcrypt

---

## Logging

- Pino

---

## Testing

- Jest
- Supertest

---

## Documentation

- Swagger/OpenAPI

---

# 🏗 System Architecture

```
                Client
                  │
                  │
             Express API
                  │
        ┌─────────┴─────────┐
        │                   │
    Redis Cache       PostgreSQL
        │                   │
        └─────────┬─────────┘
                  │
             Analytics Queue
                  │
             Background Jobs
```

---

# 📂 Project Structure

```
src/
│
├── config/
│   ├── db.js
│   ├── redis.js
│   └── env.js
│
├── routes/
│   ├── url.routes.js
│   ├── auth.routes.js
│   └── analytics.routes.js
│
├── controllers/
│   ├── url.controller.js
│   ├── auth.controller.js
│   └── analytics.controller.js
│
├── services/
│   ├── url.service.js
│   ├── analytics.service.js
│   └── auth.service.js
│
├── repositories/
│   ├── url.repository.js
│   └── user.repository.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   ├── rateLimit.middleware.js
│   └── error.middleware.js
│
├── validators/
│
├── utils/
│   ├── base62.js
│   ├── hash.js
│   └── logger.js
│
├── jobs/
│
├── queues/
│
├── app.js
└── server.js
```

---

# 🔄 URL Shortening Flow

```
POST /api/v1/urls

↓

Validate URL

↓

Generate Unique Short Code

↓

Check Collision

↓

Store in Database

↓

Return Short URL
```

---

# 🔄 Redirect Flow

```
GET /:shortCode

↓

Check Redis Cache

↓

Found?

YES
↓

Redirect

NO
↓

Read Database

↓

Update Cache

↓

Increment Analytics

↓

Redirect
```

---

# 🌐 API Endpoints

## URL

### Create URL

```
POST /api/v1/urls
```

Request

```json
{
    "originalUrl":"https://google.com",
    "customAlias":"google",
    "expiresAt":"2027-01-01"
}
```

Response

```json
{
    "id":1,
    "shortCode":"google",
    "shortUrl":"http://localhost:3000/google"
}
```

---

### Redirect

```
GET /:shortCode
```

Returns HTTP 302 Redirect.

---

### Get URL Details

```
GET /api/v1/urls/:id
```

---

### Update URL

```
PUT /api/v1/urls/:id
```

---

### Delete URL

```
DELETE /api/v1/urls/:id
```

---

### Analytics

```
GET /api/v1/analytics/:shortCode
```

---

# 🗄 Database Schema

## users

| Column | Type |
|---------|------|
| id | UUID |
| name | VARCHAR |
| email | VARCHAR |
| password | TEXT |
| created_at | TIMESTAMP |

---

## urls

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| original_url | TEXT |
| short_code | VARCHAR |
| is_custom | BOOLEAN |
| expires_at | TIMESTAMP |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |

---

## clicks

| Column | Type |
|---------|------|
| id | BIGINT |
| url_id | UUID |
| ip_address | TEXT |
| country | TEXT |
| city | TEXT |
| browser | TEXT |
| os | TEXT |
| device | TEXT |
| referrer | TEXT |
| clicked_at | TIMESTAMP |

---

# 🔡 Short Code Generation

We'll use **Base62 Encoding**.

Characters:

```
0-9
a-z
A-Z
```

Example

```
1

↓

Base62

↓

b
```

Example

```
999999

↓

4gfK
```

Advantages

- Short URLs
- URL Safe
- No special characters
- Easy decoding

---

# ⚠ Collision Handling

If generated code already exists:

```
Generate Again

↓

Exists?

Yes

↓

Retry

↓

Store
```

Alternative strategies:

- Random Base62
- UUID + Base62
- Auto Increment + Base62 (Recommended)

---

# 🚀 Redis Cache

Before reading PostgreSQL:

```
GET shortCode

↓

Redis

↓

Found

↓

Redirect

↓

Not Found

↓

Database

↓

Save to Redis
```

This significantly reduces database reads for popular links.

---

# 📈 Scaling Considerations

Current architecture supports:

- Thousands of requests/sec

Future improvements:

- Horizontal Scaling
- Load Balancer
- Read Replicas
- CDN
- Kafka
- RabbitMQ
- Background Workers
- Redis Cluster
- Sharding
- Multi-region Deployment

---

# 🔒 Rate Limiting

Example:

```
100 requests / minute / IP
```

Prevent abuse and spam.

---

# 🧪 Testing

```
npm test
```

Tests include:

- URL creation
- Invalid URLs
- Redirect
- Analytics
- Authentication
- Rate limiting

---

# ⚙ Environment Variables

Create a `.env` file.

```env
PORT=3000

NODE_ENV=development

DATABASE_URL=

REDIS_URL=

JWT_SECRET=

JWT_EXPIRES_IN=7d

BASE_URL=http://localhost:3000
```

---

# 📦 Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Start PostgreSQL

Start Redis

Run migrations

```bash
npm run migrate
```

Run server

```bash
npm run dev
```

---

# 🎯 Learning Goals

This project demonstrates:

- REST API Design
- Express.js Best Practices
- PostgreSQL Schema Design
- Redis Caching
- Authentication
- Repository Pattern
- Service Layer Architecture
- Validation
- Error Handling
- Logging
- Security
- Performance Optimization
- Rate Limiting
- Analytics Collection
- Production-ready Folder Structure
- Scalable Backend Design

---

# 🗺 Roadmap

## Phase 1

- URL Shortening
- Redirect
- PostgreSQL

---

## Phase 2

- Authentication
- User Dashboard
- CRUD

---

## Phase 3

- Analytics
- Click Tracking
- Redis Cache

---

## Phase 4

- Rate Limiting
- Swagger
- Docker
- Unit Testing

---

## Phase 5

- Background Workers
- Kafka/RabbitMQ
- Horizontal Scaling
- Monitoring
- CI/CD

---

# 💡 System Design Topics Covered

- Database Design
- Base62 Encoding
- Hashing
- Collision Resolution
- Read-heavy Systems
- Redis Caching
- Database Indexing
- Rate Limiting
- Analytics Pipeline
- Background Jobs
- Horizontal Scaling
- API Design
- Repository Pattern
- Service Layer
- Security Best Practices

---

# 📜 License

This project is licensed under the MIT License.

---

## ⭐ Why this project?

This project is an excellent backend portfolio piece because it demonstrates many real-world engineering concepts beyond basic CRUD APIs. It covers scalable API design, caching strategies, database optimization, security, analytics, clean architecture, and production-ready development practices commonly discussed in backend interviews and system design rounds.