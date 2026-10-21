# 🚖 Vayro — Enterprise Cab Booking Platform

> Industry-grade full-stack ride-hailing and fleet management platform built with **Java 17+, Spring Boot 3, Spring Security (JWT + RBAC), PostgreSQL / H2, Spring WebSockets (STOMP), Stripe SDK, iText 7, and React (Vite + Tailwind CSS + Leaflet)**.

---

## 📌 Architecture & Features

- **Rider Workflow:**
  - Interactive Leaflet Map with dark-themed tiles, pickup/drop pins, and live route polyline.
  - Multi-tier vehicle selection (`Moto`, `Auto`, `Sedan`, `SUV`, `Luxury`) with real-time fare estimates.
  - Promo discount engine (`VAYRO50`, `WELCOME20`).
  - Automated 4-digit PIN / OTP generation for ride verification.
  - Cashless Stripe checkout simulation.
  - One-click official Tax Invoice PDF generation and download powered by **iText 7**.
  - Post-trip 5-star driver review and rating system.

- **Driver Workflow:**
  - Online / Offline toggle with visual radar broadcast.
  - Incoming ride offer banner with 15-second countdown timer and Accept/Decline actions.
  - Turn-by-turn ride management: `DRIVER_ASSIGNED` ➔ `DRIVER_ARRIVED` ➔ Verify Rider PIN ➔ `IN_PROGRESS` ➔ `COMPLETED`.
  - Earnings tracker, trip counter, and rolling rating average calculation.

- **Enterprise Backend:**
  - Java 17 + Spring Boot 3.3.4 with clean layered architecture (`controller`, `service`, `repository`, `entity`, `dto`, `security`, `config`, `util`).
  - Stateless Spring Security filter chain with JJWT 0.12.x tokens and BCrypt password encryption.
  - Dual-mode database support: zero-config in-memory H2 for instant local development, and PostgreSQL 16 for production.
  - Real-time STOMP messaging over WebSockets (`/ws-cab`) with fallback.
  - Complete REST APIs and CORS setup.

---

## ⚡ Quick Start

### 1. Run the Spring Boot Backend

The backend is configured to run out-of-the-box in `dev` profile using an in-memory database pre-seeded with test accounts:

```powershell
cd backend
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17' # If not already in environment
.\mvnw.cmd spring-boot:run
```

The REST API and WebSocket server will start on `http://localhost:808

---

### 2. Run the React Frontend

In a separate terminal:

```powershell
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173`.

---

### 3. Run with Docker Compose (Full Production Stack)

To run PostgreSQL 16, Redis, Spring Boot Backend, and Nginx Frontend in isolated containers:

```powershell
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432` (database: `vayro_db`)
- Redis: `localhost:6379`
