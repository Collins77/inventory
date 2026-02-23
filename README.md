# Inventory Management System

This project is a full-stack inventory management system designed to manage **stores** and **products**, including filtering, pagination, and store-level inventory metrics. The implementation focuses on correctness, clarity, and maintainability, keeping the scope intentionally simple and easy to review.

The repository is structured as a small monorepo containing a backend API, a frontend web application, and Docker configuration to allow the entire system to be run locally in a reproducible manner.

---

## Repository Structure

.
├── server/                 Backend API (Node.js + TypeScript)  
│   ├── prisma/             Prisma schema and database artifacts  
│   ├── src/  
│   │   ├── routes/         API routes (stores, products)  
│   │   ├── validators/     Zod request validators  
│   │   ├── utils/          Shared utilities (errors, helpers)  
│   │   └── index.ts        Application entry point  
│   ├── prisma.config.ts    Prisma configuration (new-style)  
│   └── Dockerfile  
│  
├── web/                    Frontend (Vite + React)  
│   ├── src/  
│   │   ├── pages/          Dashboard, Stores, Products  
│   │   ├── components/     Reusable UI components  
│   │   ├── api/            API client wrappers  
│   │   └── utils/          Formatting & helpers  
│   └── Dockerfile  
│  
├── docker-compose.yml  
└── README.md  

---

## Run Instructions

The application can be run either **with Docker (recommended)** or **locally without Docker**.

### Option 1: Run with Docker (Recommended)

From the repository root, run:

docker compose up --build

This will build and start both services:
- Backend API available at http://localhost:4000
- Frontend Web UI available at http://localhost:8080

To stop the application:

docker compose down

---

### Option 2: Run Locally (Without Docker)

#### Backend (server)

Navigate to the server directory and install dependencies:

cd server  
npm install  

Generate the Prisma client and start the development server:

npx prisma generate --config prisma.config.ts  
npm run dev  

The API will run at:

http://localhost:4000

Create a `server/.env` file with the following variables:

PORT=4000  
DATABASE_URL=libsql://...  

The database URL may point to a libSQL/Turso database or any compatible setup being used.

---

#### Frontend (web)

Navigate to the web directory and install dependencies:

cd web  
npm install  

Start the development server:

npm run dev  

The frontend will run at:

http://localhost:5173

Create a `web/.env` file with:

VITE_API_URL=http://localhost:4000

Note that Vite requires environment variables to be prefixed with `VITE_`.

---

## API Sketch

The following endpoints represent the core API surface:

- GET /health – Service health check  
- GET /stores – List all stores  
- POST /stores – Create a new store  
- GET /stores/:id – Retrieve store details  
- GET /stores/:id/metrics – Store inventory metrics  
- GET /products – List products with filters and pagination  
- POST /products – Create a product  

All successful responses return a consistent structure:

{ "data": ... }

Paginated endpoints also include a `meta` object with pagination details.

---

## Decisions & Trade-offs

### Backend

A REST API was chosen instead of GraphQL to keep the interface explicit, predictable, and easy to debug. Given the limited scope and well-defined resources, REST provides sufficient flexibility without introducing unnecessary complexity.

Zod is used for request validation to ensure all incoming data is validated consistently and produces clean, predictable error messages. The trade-off is additional schema code, but this significantly reduces runtime errors and simplifies frontend error handling.

Prisma is used as the ORM to provide strong typing, clear data models, and safe database access. The newer Prisma configuration pattern was adopted to keep generated client code isolated from application logic. This introduces slightly more setup complexity but improves long-term maintainability.

### Frontend

The frontend is built with Vite and React to enable fast development and a minimal build pipeline. The trade-off is that environment variables are resolved at build time in production builds.

Tailwind CSS combined with shadcn/ui was chosen to provide flexible styling while maintaining accessible, composable UI components. This requires more explicit layout work compared to heavily abstracted UI libraries but results in clearer control over the UI.

### Docker

A single Docker Compose setup is used to keep the project easy to run and review locally. This approach prioritizes simplicity over advanced multi-environment or production-grade orchestration.

---

## Testing Approach

Given the scope of the project, testing focuses on functional correctness and user-visible behavior rather than comprehensive automation.

Backend testing consists of manual verification of validation rules, error responses, pagination metadata, and store metrics calculations.

Frontend testing consists of manual smoke testing to ensure that pages load correctly, data is displayed as expected, filters and pagination work, and empty or error states are handled cleanly.

With additional time, automated unit tests for validators and utilities, integration tests for API routes, and basic end-to-end UI tests would be added.

---

## If I Had More Time

- Add automated unit and integration tests for the backend API  
- Add runtime-configurable frontend environment variables without requiring rebuilds  
- Add authentication and role-based access control  

---

## Final Notes

This project intentionally prioritizes clarity over complexity, correctness over feature count, and maintainability over premature optimization. The codebase is structured to be straightforward to review and easy to extend while remaining intentionally minimal.