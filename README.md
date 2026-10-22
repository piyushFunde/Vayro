

# Vayro — Enterprise Ride-Hailing Platform

**A production-grade, full-stack cab booking application built with Spring Boot 3 and React.**  
Real-time driver tracking, live map routing, JWT authentication, WebSocket communications, and Stripe payment simulation — all deployed and accessible live.


</div>

---

##  Live Deployment

| Service | URL | Platform |
|:--------|:----|:---------|
| **Frontend** | [https://vayro-frontend.onrender.com](https://vayro-frontend.onrender.com/) | Render Static Site |
---

##  Features

### Rider Experience
- **Interactive Live Map** — CartoDB Voyager & Dark Matter tile modes, real road routing via OSRM, live driver marker with pulsing animation
- **Autocomplete Location Search** — Nominatim-powered search with real address suggestions as you type
- **GPS "Locate Me"** — One-tap GPS detection to auto-fill your pickup location
- **Multi-Tier Vehicle Selection** — Auto, Mini, Sedan, SUV with real-time INR fare calculation
- **Live Ride Tracking** — Real-time driver position updates via WebSocket STOMP, full turn-by-turn driver animation
- **OTP Verification** — Auto-generated 4-digit PIN for secure ride start verification
- **Trip History** — Full ride history with timestamps, fares, and driver details
- **Cashless Payment** — Stripe SDK payment intent simulation with card entry
- **Tax Invoice PDF** — Official GST-compliant invoice generated with iText 8 and downloadable on demand
- **Driver Rating** — 5-star rating and feedback system post-trip

### Driver Experience
- **Online / Offline Toggle** — Broadcast availability to the dispatch system instantly
- **Live Incoming Offer Banner** — Real-time ride offer with countdown timer and Accept / Decline controls
- **Full Trip State Machine** — `ASSIGNED` → `ARRIVED` → PIN Verification → `IN_PROGRESS` → `COMPLETED`
- **Earnings Dashboard** — Live trip count, rolling average rating, and total earnings tracker
- **Location Broadcasting** — Continuous heading-aware GPS updates pushed to the backend and riders

###  Security & Backend
- **Stateless JWT Authentication** — JJWT 0.12.x with BCrypt password hashing, 24-hour access tokens
- **Role-Based Access Control** — `ROLE_RIDER`, `ROLE_DRIVER`, `ROLE_ADMIN` at controller and method level
- **Spring WebSocket (STOMP)** — Real-time bidirectional messaging over `/ws-cab` with JWT header auth
- **Dual Database Profiles** — H2 in-memory for zero-config dev, PostgreSQL for production
- **CORS Configuration** — Wildcard origin patterns for flexible deployment

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| Java | 17 | Language runtime |
| Spring Boot | 3.3.4 | Application framework |
| Spring Security | 6.x | Auth, JWT filter chain, RBAC |
| Spring WebSocket | 6.x | STOMP real-time messaging |
| Spring Data JPA | 3.x | ORM and database abstraction |
| H2 Database | Embedded | Zero-config local development |
| PostgreSQL | 16 | Production database |
| JJWT | 0.12.6 | JWT token creation and validation |
| Stripe SDK | 34.0.0 | Payment intent simulation |
| iText 8 | 8.0.4 | PDF tax invoice generation |
| Lombok | Latest | Boilerplate reduction |
| Docker | 24+ | Containerized deployment |

### Frontend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.9 | Build tooling and dev server |
| Tailwind CSS | 3.4.14 | Utility-first styling |
| Leaflet + React-Leaflet | 1.9 / 4.2 | Interactive map rendering |
| STOMP.js | 7.0.0 | WebSocket STOMP client |
| Axios | 1.7.7 | HTTP API client |
| Lucide React | 0.453 | Icon system |
| OSRM | Public API | Real road routing engine |
| Nominatim | Public API | Geocoding and search |
| CartoDB | Public Tiles | Professional map tile layers |

### Infrastructure
| Service | Role |
|:--------|:-----|
| **Render** | Backend Docker deployment + Frontend Static hosting |
| **GitHub** | Source control and CI/CD trigger |
| **Render Blueprint** | `render.yaml` Infrastructure as Code |

---

##  Project Structure

```
Vayro/
├── backend/                        # Spring Boot Application
│   ├── src/main/java/com/vayro/cabbooking/
│   │   ├── config/                 # Security, CORS, WebSocket, DataInitializer
│   │   ├── controller/             # REST endpoints (Auth, Ride, Driver, Payment, Rating)
│   │   ├── dto/                    # Request & Response DTOs
│   │   ├── entity/                 # JPA Entities (User, Driver, Ride, Payment, Rating, PromoCode)
│   │   ├── enums/                  # Role, DriverStatus, RideStatus, VehicleType
│   │   ├── exception/              # Global exception handler
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JWT provider, filter, UserPrincipal
│   │   ├── service/                # Business logic (Auth, Ride, Driver, Invoice)
│   │   └── util/                   # Helpers
│   ├── Dockerfile                  # Multi-stage Docker build (JDK 17 → JRE 17 alpine)
│   └── pom.xml
│
├── frontend/                       # React + Vite Application
│   ├── src/
│   │   ├── components/             # UI Components
│   │   │   ├── MapView.jsx         # Leaflet map with CartoDB tiles, markers, route
│   │   │   ├── VayroHero.jsx       # Hero section with booking form and map
│   │   │   ├── RideCategories.jsx  # Vehicle selection with custom SVG icons
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── DriverWidget.jsx    # Floating driver control panel
│   │   │   ├── RideTrackerModal.jsx # Rider active trip tracker
│   │   │   ├── PaymentModal.jsx    # Stripe payment and invoice UI
│   │   │   ├── HistoryModal.jsx    # Past rides list
│   │   │   └── AuthModal.jsx       # Login and Sign Up modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state and JWT management
│   │   ├── services/
│   │   │   ├── api.js              # Axios client with JWT interceptor
│   │   │   ├── websocket.js        # STOMP WebSocket service
│   │   │   ├── routing.js          # OSRM route fetching and Nominatim search
│   │   │   └── sound.js            # Web Audio API sound effects
│   │   └── App.jsx                 # Root component, state management
│   ├── index.html
│   └── vite.config.js
│
├── render.yaml                     # Render Blueprint (Backend + Frontend services)
├── docker-compose.yml              # Local full-stack Docker Compose
└── README.md
```

---

## Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- Maven (included via `mvnw`)

### 1. Start the Backend

```bash
cd backend
./mvnw spring-boot:run          # Linux/macOS
.\mvnw.cmd spring-boot:run      # Windows PowerShell
```

The Spring Boot server starts at `http://localhost:8080`.  
H2 Console available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:vayrodb`).

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The Vite dev server proxies `/api/*` to `localhost:8080` automatically.

### 3. Full Stack with Docker Compose

```bash
docker compose up --build
```

| Service | URL |
|:--------|:----|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8080` |
| PostgreSQL | `localhost:5432` (db: `vayro_db`) |

---

##  Deployment

The project deploys automatically to **Render** via the `render.yaml` Blueprint whenever changes are pushed to `main`.

| Service | Type | Runtime |
|:--------|:-----|:--------|
| `vayro-backend` | Web Service | Docker (JRE 17 Alpine) |
| `vayro-frontend` | Static Site | Node.js build → CDN |

The `VITE_API_BASE_URL` environment variable is automatically injected into the frontend build via Render's `fromService` blueprint wiring, ensuring the frontend always knows the correct backend URL without hardcoding.

---

## 📡 API Overview

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/v1/auth/register` | None | Register new user |
| `POST` | `/api/v1/auth/login` | None | Login, returns JWT |
| `GET` | `/api/v1/auth/me` | Bearer | Get current user profile |
| `POST` | `/api/v1/rides/request` | Rider | Request a new ride |
| `GET` | `/api/v1/rides/{id}` | Bearer | Get ride by ID |
| `GET` | `/api/v1/rides/history` | Rider | Get all past rides |
| `POST` | `/api/v1/rides/{id}/cancel` | Rider | Cancel an active ride |
| `GET` | `/api/v1/rides/{id}/invoice` | Rider | Download PDF tax invoice |
| `PATCH` | `/api/v1/drivers/status` | Driver | Toggle online/offline |
| `PATCH` | `/api/v1/drivers/location` | Driver | Update GPS position |
| `POST` | `/api/v1/drivers/rides/{id}/accept` | Driver | Accept incoming offer |
| `POST` | `/api/v1/drivers/rides/{id}/arrive` | Driver | Mark arrived at pickup |
| `POST` | `/api/v1/drivers/rides/{id}/start` | Driver | Start ride (OTP verify) |
| `POST` | `/api/v1/drivers/rides/{id}/complete` | Driver | Complete the trip |
| `POST` | `/api/v1/payments/create-intent` | Rider | Create Stripe payment intent |
| `POST` | `/api/v1/payments/confirm/{id}` | Rider | Confirm payment |
| `POST` | `/api/v1/ratings` | Rider | Submit driver rating |

### WebSocket Topics (STOMP)

| Topic | Direction | Payload |
|:------|:----------|:--------|
| `/topic/drivers/requests` | Server → Driver | New ride offer |
| `/topic/ride/{id}/status` | Server → All | Ride status update |
| `/topic/ride/{id}/location` | Server → Rider | Driver GPS coordinates |

---

##  Author

**Piyush Funde**  
Full-Stack Developer — Spring Boot · React · Cloud Deployment

[![GitHub](https://img.shields.io/badge/GitHub-piyushFunde-181717?style=flat-square&logo=github)](https://github.com/piyushFunde)

---

<div align="center">

Built with ❤️ using Spring Boot, React, and deployed on Render.

[🌐 Open Live App](https://vayro-frontend.onrender.com/) &nbsp;·&nbsp; [⭐ Star on GitHub](https://github.com/piyushFunde/Vayro)

</div>
