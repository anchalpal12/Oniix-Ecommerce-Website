# Changelog

All notable changes to the Onix project are documented here.

---

## [2.3.0] — 2026-05-30

### Added — Production engineering (FAANG-grade infrastructure)
- **Test suite** — Jest + Supertest + MongoDB Memory Server (11 tests: health + auth)
- **CI pipeline** — GitHub Actions (lint, test, client build on every PR)
- **Docker** — multi-stage Dockerfile + `docker-compose.yml` with health checks
- **Structured logging** — Pino with request correlation IDs (`X-Request-Id`)
- **Env validation** — fail-fast config in `config/env.js` (production requires JWT_SECRET ≥ 32 chars)
- **Input validation** — express-validator on signup/login (8+ char passwords with letter + number)
- **Health probes** — `/api/health/live`, `/api/health/ready`, enhanced `/api/health`
- **Graceful shutdown** — SIGTERM/SIGINT handling with DB connection cleanup
- **App/server split** — `app.js` (testable) + `server.js` (bootstrap)
- **ESLint + Prettier** — backend and client lint scripts

### Changed
- Signup password minimum raised from 6 → 8 characters (with complexity rules)
- Error responses include `requestId` for distributed tracing

---

## [2.2.0] — 2026-05-30

### Added — Production e-commerce features
- **Product detail page** (`/shop/:id`) with gallery, quantity selector, reviews, related products
- **Reviews API** — star ratings, authenticated review submission, aggregate scores
- **Wishlist** — persistent localStorage wishlist with heart toggle on product cards
- **Account page** — order history, wishlist tab, profile (`/account`)
- **Order success page** with receipt (guest + logged-in checkout)
- **Enhanced checkout** — phone, payment methods (COD / Card / UPI), shipping fee, order summary sidebar, simulated card payment
- **Shop filters** — category, sort (price, name), search with pagination
- **Cart improvements** — quantity controls, merge duplicate items, sticky summary panel
- **Toast notifications** for cart, wishlist, and checkout feedback
- **Stock validation** — inventory check and decrement on order placement
- **Lazy-loaded routes** for faster initial load

### Backend
- `Review` model and `/api/reviews` routes
- `GET /api/orders/mine` for authenticated order history
- `GET /api/orders/:id` for order details
- Order fields: `phone`, `paymentMethod`, `paymentStatus`, `shippingFee`
- Product sort query params: `price_asc`, `price_desc`, `name`
- Categories endpoint via reviews controller

---

## [2.1.0] — 2026-05-30

### Added — Premium UI / FAANG-level frontend
- **Framer Motion** animations: hero entrance, scroll reveals, testimonial carousel, product hover
- **12+ home page sections:** Hero, stats counter, featured products, features grid, about preview, how-it-works, services, image gallery marquee, testimonials, comparison table, newsletter, CTA banner
- **Announcement bar** with animated scrolling promo
- **Discount popup** (session-aware, 5s delay) with coupon integration
- **Animated stat counters** (12,000+ miners, 340+ sites, 98% satisfaction, 28 countries)
- **Page hero banners** for Shop and About pages
- **Product skeleton loaders** on shop page
- **Low-stock badges** on product cards
- **About page:** timeline, values cards, mission section with images
- **`premium.css`** design system: gradients, glass buttons, Ken Burns hero, gallery marquee
- Reused **20+ project images** from `/public/images`

### Dependencies
- `framer-motion` added to client

---

## [2.0.0] — 2026-05-30

### Added — MERN React Frontend
- **React 19 SPA** (`client/`) with Vite, React Router, and component-based architecture
- Pages: Home, Shop, Cart, Checkout, Login, Signup, About, Contact
- Admin pages: Dashboard, Products, Orders, Users with protected routes
- `AuthContext` — JWT session, login/logout, admin detection
- `CartContext` — persistent cart via localStorage
- Centralized `api/client.js` with auth header injection
- Responsive design system (Inter font, mobile nav, CSS variables)
- Product search, pagination, lazy-loaded images
- Coupon validation & application at checkout (50% off)
- Order status workflow (pending → confirmed → shipped → delivered → cancelled)

### Added — Backend Improvements
- `GET /api/health` health check endpoint
- `GET /api/users/me` — current user profile
- `GET /api/orders/validate-coupon/:code` — coupon validation
- `PATCH /api/orders/:id/status` — admin order status updates
- Product pagination & search (`?page=&limit=&search=&category=`)
- `productController.js` — extracted from inline routes
- `utils/apiResponse.js` — standardized `{ success, message, data }` responses
- Global error handler middleware
- Rate limiting on auth routes and general API
- Helmet security headers
- CORS configured for React dev server (`CLIENT_URL`)
- Production: Express serves React `client/dist` build

### Security (Critical)
- **JWT auth middleware applied** to all admin/sensitive routes
- Public signup **forces `role: user`** — admin role removed from signup form
- Admin-only: user list/update/delete, product write, order list/delete, newsletter list, discount list
- Login rate limit (20 req / 15 min), signup rate limit (10 req / 15 min)
- JWT includes email for authorization checks; 7-day expiry
- Admin cannot delete own account
- Password minimum 6 characters on signup
- Rejects oversized base64 product images at upload

### Database
- **Order schema** — typed `items[]` subdocuments, `status` enum, indexes on email+date
- **Product schema** — required fields, `stock` field, text search index
- **User schema** — lowercase email, timestamps

### DevOps / DX
- `npm run dev` — runs API + React concurrently
- `npm run build` — builds React for production
- `npm run reset-admin` — reset admin credentials script
- `.env.example` updated
- `README.md` with setup instructions

### Changed
- API product list returns `{ products, pagination }` (React client)
- Order model uses `items` instead of untyped `cart` array (legacy orders still readable)
- Server loads `dotenv` before all imports
- Removed unused route imports from `server.js`

### Deprecated
- Legacy HTML pages in `public/` remain for reference; **React app is the primary UI**

---

## [1.1.0] — 2026-05-30

### Fixed
- Server crash on missing Resend API key (lazy Resend initialization)
- Circular dependency in `emitUserCount` → moved to `utils/socketEvents.js`
- Responsive CSS across customer and admin HTML pages
- Mobile navigation hamburger menu
- Admin login returns `_id` in response
- Hardcoded `localhost:5000` URLs → relative `/api` paths

### Added
- `scripts/resetAdmin.js` for password recovery
- `.env.example`

---

## [1.0.0] — Initial

- Vanilla HTML/CSS/JS storefront
- Express + MongoDB backend
- User auth, products, orders, newsletter, discount coupons
- Admin HTML dashboard with Chart.js
- Socket.io user count
