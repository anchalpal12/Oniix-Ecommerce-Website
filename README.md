# Onix — MERN E-Commerce Platform

Full-stack e-commerce application for industrial smart mining glasses. Built with **MongoDB, Express, React, and Node.js**.

## Features

- **Customer:** Product catalog with search & pagination, cart, checkout, coupon codes, newsletter signup
- **Admin:** Dashboard stats, product CRUD, order management with status workflow, user management
- **Security:** JWT auth, bcrypt passwords, protected admin APIs, rate limiting, Helmet headers
- **Architecture:** React SPA + REST API, reusable contexts (Auth, Cart), centralized API client

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Real-time | Socket.io (user count) |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend setup
```bash
cd Onix/my-backend
cp .env.example .env
npm install
npm run reset-admin   # creates admin@onix.com / Admin@123456
```

### 2. Run development (API + React)
```bash
npm run dev
```
- API: http://localhost:5000
- React app: http://localhost:5173

### 3. Production build
```bash
npm run build
npm start
```
Serves React build from Express at http://localhost:5000





## Admin Access

```bash
npm run reset-admin
```


## API Overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/users/signup` | Public |
| POST | `/api/users/login` | Public |
| GET | `/api/products` | Public (paginated) |
| POST | `/api/orders/place-order` | Public |
| GET | `/api/orders/all` | Admin |
| POST | `/api/products` | Admin |

Full health check: `GET /api/health`

## Production Engineering

| Capability | Details |
|------------|---------|
| **Testing** | Jest + Supertest + in-memory MongoDB (`npm test`) |
| **Linting** | ESLint + Prettier (`npm run lint`, `npm run format:check`) |
| **CI** | GitHub Actions — lint, test, build on every PR |
| **Docker** | Multi-stage Dockerfile + `docker-compose up` |
| **Observability** | Structured logging (Pino), request IDs, liveness/readiness probes |
| **Security** | Input validation, env validation, rate limits, graceful shutdown |

### Run tests
```bash
npm test
```

### Docker (production)
```bash
docker compose up --build
```

### Health probes
- `GET /api/health/live` — liveness
- `GET /api/health/ready` — readiness (DB connected)
- `GET /api/health` — full status

## Project Structure

```
my-backend/
├── app.js           # Express app (testable)
├── server.js        # HTTP server + Socket.io bootstrap
├── client/          # React frontend (Vite)
├── config/          # Validated environment config
├── controllers/     # Route handlers
├── middleware/      # Auth, validation, error handling
├── models/          # Mongoose schemas
├── routes/          # Express routes
├── tests/           # Jest integration tests
├── validators/      # express-validator schemas
├── public/          # Static assets (images)
├── scripts/         # Admin reset utility
└── CHANGELOG.md
```

## License

ISC
