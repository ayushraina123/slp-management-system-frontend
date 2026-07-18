# SLP Management System Frontend

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.2-purple)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)

The SLP Management System Frontend is a React, TypeScript, and Vite admin UI for managing devotees, donations, expenses, dashboard analytics, exports, and batch operations.

This repository contains the client application only. Backend APIs are served through the API Gateway.

---

## Table of Contents

- [Frontend Scope](#frontend-scope)
- [System Context](#system-context)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Modules](#application-modules)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Docker](#docker)
- [Future Scope](#future-scope)

---

## Frontend Scope

The frontend is responsible for:

- Rendering the admin UI
- Calling backend APIs through the gateway
- Managing login state and access tokens
- Displaying dashboard, devotee, donation, expense, export, and batch-job screens
- Showing viewer/admin access messaging in the UI
- Handling client-side routing with React Router

Backend business logic, persistence, filtering, authentication enforcement, and batch execution are handled by backend services.

---

## System Context

```text
Browser
  |
  v
Frontend container / Vite dev server
  |
  v
API Gateway
  |
  v
Devotee Service
  |
  v
PostgreSQL
```

In Docker, the frontend runs behind Nginx and proxies backend routes to the API Gateway container.

---

## Features

### Core Features

- Login and signup
- Dashboard summaries and charts
- Devotee creation, listing, pagination, and deletion
- Donation listing, pagination, and deletion
- Expense creation, editing, listing, pagination, and deletion
- Export job trigger by donation type
- Delete-data batch job trigger
- Admin/viewer UI access messaging

### UX Features

- Responsive layout
- Paginated tables for large datasets
- API error handling in the UI
- Donation and expense charts
- Monthly trend visualization

---

## Technology Stack

| Area | Technology |
|------|------------|
| UI | React 18, TypeScript |
| Build Tool | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS, custom UI components |
| Icons | Lucide React, MUI Icons |
| Charts | Recharts |
| State | Zustand |
| Production Server | Nginx |
| Containerization | Docker |

---

## Application Modules

| Module | Description |
|--------|-------------|
| Login | Authenticates users and stores access token |
| Signup | Registers new users |
| Dashboard | Displays summary metrics, trends, and recent activity |
| Devotees | Creates, lists, and deletes devotee records |
| Donations | Lists and deletes donation records |
| Expenses | Creates, edits, lists, and deletes expense records |
| Export Data | Triggers backend export batch job |
| Delete Data Job | Triggers backend delete-data batch job |

---

## Authentication

The frontend integrates with the backend JWT flow.

1. User logs in with username and password.
2. The backend returns an access token in the `Authorization` response header.
3. The frontend stores the access token and sends it on protected API requests.
4. The backend sets a refresh token in an HTTP-only cookie.
5. The frontend can call `/refresh-token` to receive a new access token when the refresh cookie is valid.
6. Logout clears the refresh token cookie.

Users named `Ayush` and `Rajesh` are treated as admin users by the frontend UI. Other users are treated as viewers in the UI flow.

Backend authorization is still enforced by the Devotee Service.

---

## API Integration

The frontend communicates with backend APIs exposed through the API Gateway.

| Area | Endpoint Prefix |
|------|-----------------|
| Authentication | `/login`, `/refresh-token`, `/api/user`, `/api/logout` |
| Dashboard | `/api/dashboard` |
| Devotees | `/api/devotees` |
| Donations | `/api/donation` |
| Expenses | `/api/expense` |
| Export Job | `/api/job/export-data` |
| Delete Batch Job | `/api/job/delete-data` |

### Docker/Nginx Proxying

The production container uses Nginx. The Nginx config proxies backend routes to the API Gateway service name:

```text
/api/          -> http://api-gateway:8080
/login         -> http://api-gateway:8080
/logout        -> http://api-gateway:8080
/refresh-token -> http://api-gateway:8080
```

All other routes fall back to `index.html` for client-side routing.

---

## Project Structure

```text
src/
  app/
    components/     # Shared layout and UI components
    lib/            # API, auth, formatting, and utility logic
    pages/          # Route-level screens
    store/          # Shared client state
    types/          # Shared TypeScript DTOs and response types
  styles/           # Global styles, theme, and fonts
  main.tsx          # Application entry point
```

---

## Local Development

### Prerequisites

- Node.js 22 or compatible current LTS
- npm
- API Gateway running locally on port `8080`
- Backend services registered and available through the gateway

### Install Dependencies

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Vite starts the app locally. Backend calls should be routed through the current frontend API configuration and the API Gateway.

---

## Production Build

```bash
npm run build
```

The optimized production build is written to:

```text
dist/
```

---

## Docker

### Build Image

```bash
docker build -t slp-frontend:local .
```

### Run Container

This example assumes an API Gateway container named `api-gateway` is reachable on the same Docker network.

```bash
docker run --rm \
  --name slp-frontend \
  -p 3000:80 \
  slp-frontend:local
```

The container serves the frontend on:

```text
http://localhost:3000
```

For the complete stack, use the Docker Compose setup in the **SLP Management System Deployment** folder.

---

## Future Scope

- Add filtering and search on paginated tables
- Add global loading and toast feedback improvements
- Improve dashboard aggregation behavior for larger datasets
