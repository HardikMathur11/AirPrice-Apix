# AirPrice APIx Backend — Real-Time Airfare Price Index for India

AirPrice APIx is an automated, production-ready backend system designed to collect, process, and calculate a daily/weekly/monthly domestic airfare price index for India. It automatically scrapes airfare data every 2 hours across **11 sources** (5 airlines + 6 OTAs), tracks 50 representative domestic routes across 5 booking lead windows (`T+1`, `T+7`, `T+15`, `T+30`, `T+45`), cleans and validates the data, computes the **Laspeyres Price Index (APIx)**, and serves REST APIs for public and NSO/RBI access.

---

## Key Features

- **11 Source Scrapers**:
  - **Airlines (5)**: IndiGo, Air India, Akasa Air, SpiceJet, Air India Express
  - **OTAs (6)**: MakeMyTrip, Yatra, EaseMyTrip, Cleartrip, Ixigo, Goibibo
- **50 Representative Indian Routes**: Weighted by official DGCA traffic volume (e.g. DEL-BOM 15.0%, DEL-BLR 12.0%).
- **5 Booking Windows**: `T+1`, `T+7`, `T+15`, `T+30`, `T+45` days before travel.
- **Data Pipeline**:
  - `FareValidator`: Range bounds (Base ₹1k–₹50k, Tax ₹100–₹10k) and fee arithmetic validation.
  - `FareDeduplicator`: Redis-based deduplication with 24h TTL.
  - `OutlierDetector`: Interquartile Range (IQR) method for price spike filtering ($Q_1 - 1.5 \times \text{IQR} < \text{Fare} < Q_3 + 1.5 \times \text{IQR}$).
- **Laspeyres Index Calculator**: Formula engine computing daily APIx index ($100.00$ base value).
- **FastAPI REST Endpoints**: Secured with `X-API-Key` header authentication.
- **24/7 Scheduling & Containerization**: Automated APScheduler background jobs & Docker Compose.

---

## Directory Structure

```text
airprice-backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app with APScheduler
│   ├── config.py              # Pydantic Settings configuration
│   ├── database.py            # DB Connections (TimescaleDB, MongoDB, Redis)
│   │
│   ├── models/                # SQLAlchemy ORM Models
│   │   ├── route.py           # Route model (routes table)
│   │   ├── fare.py            # ScrapedFare model (scraped_fares hypertable)
│   │   └── apix.py            # DailyApix model (daily_apix hypertable)
│   │
│   ├── schemas/               # Pydantic Validation Schemas
│   │   └── fare.py            # Fare schemas
│   │
│   ├── scrapers/              # 11 Async Source Scrapers
│   │   ├── base.py            # BaseScraper abstract class
│   │   ├── indigo.py          # IndiGo Scraper
│   │   ├── airindia.py        # Air India Scraper
│   │   ├── akasa.py           # Akasa Air Scraper
│   │   ├── spicejet.py        # SpiceJet Scraper
│   │   ├── aiexpress.py       # Air India Express Scraper
│   │   ├── makemytrip.py      # MakeMyTrip Scraper
│   │   ├── yatra.py           # Yatra Scraper
│   │   ├── easemytrip.py      # EaseMyTrip Scraper
│   │   ├── cleartrip.py       # Cleartrip Scraper
│   │   ├── ixigo.py           # Ixigo Scraper
│   │   └── goibibo.py         # Goibibo Scraper
│   │
│   ├── processors/            # Data Cleaning Pipeline
│   │   ├── validator.py       # FareValidator class
│   │   ├── deduplicator.py    # FareDeduplicator (Redis TTL)
│   │   ├── normalizer.py      # FareNormalizer
│   │   └── outlier.py         # OutlierDetector (IQR method)
│   │
│   ├── index_calculator/      # Laspeyres Index Engine
│   │   └── calculator.py      # ApixCalculator
│   │
│   └── api/                   # REST API Endpoints
│       ├── routes.py          # All FastAPI route handlers
│       └── auth.py            # X-API-Key security middleware
│
├── data/                      # Extracted datasets (JSON/CSV)
├── tests/                     # Pytest Integration Test Suite
│   ├── test_processors.py     # Processor unit tests (4 passed)
│   └── test_api.py            # API integration tests (6 passed)
│
├── scripts/                   # Seeding & Scraping Execution Scripts
│   ├── run_scraper.py         # Batch scraping runner (440 items)
│   ├── seed_routes.py         # Seed 50 DGCA weighted routes
│   └── run_live_scraper.py    # Live Playwright browser runner
│
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Quickstart & Local Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
python -m playwright install chromium
```

### 2. Run Batch Scraping Engine
```bash
python scripts/run_scraper.py
```
*Outputs dataset to `data/scraped_fares_output.json` and `data/scraped_fares_output.csv`.*

### 3. Run Unit & API Tests
```bash
python -m pytest tests/test_processors.py -v
python -m pytest tests/test_api.py -v
```

### 4. Run FastAPI Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive OpenAPI documentation:  
👉 `http://localhost:8000/docs`

---

## REST API Endpoints

All endpoints require the `X-API-Key` header (e.g. `X-API-Key: airprice_demo_key_2026`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Unauthenticated service & DB health check |
| `GET` | `/api/v1/apix/current` | Current daily APIx index value and period changes |
| `GET` | `/api/v1/apix/historical` | Historical index time-series (`start_date`, `end_date`, `frequency`) |
| `GET` | `/api/v1/routes` | Monitored 50 DGCA routes with traffic weights |
| `GET` | `/api/v1/routes/{route_code}/prices` | Real-time fare breakdown across 11 sources & statistics |
| `GET` | `/api/v1/routes/{route_code}/elasticity` | Lead-time booking window elasticity curve |

---

## Production Deployment with Docker Compose

Run the full stack (FastAPI server, TimescaleDB, MongoDB 6.0, and Redis 7.0):

```bash
docker-compose up --build -d
```

Check running container status:
```bash
docker-compose ps
```

---

## License

AirPrice APIx Backend is open-source under the MIT License.
