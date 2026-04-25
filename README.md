# SLP Management System Frontend

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.2-purple)](https://vitejs.dev/)

A modern **React frontend** built with **TypeScript** and **Vite** for the **SLP Management System**.  
It provides a clean admin interface to manage devotees, donations, expenses, dashboard analytics, exports, and batch operations while integrating with the backend microservices ecosystem.

---

# Table of Contents

- [Project Overview](#project-overview)
- [Frontend Scope](#frontend-scope)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Modules](#application-modules)
- [Authentication & Authorization](#authentication--authorization)
- [Pagination](#pagination)
- [API Integration](#api-integration)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Build for Production](#build-for-production)
- [Future Scope](#future-scope)

---

# Project Overview

The **SLP Management System Frontend** is the user interface layer of the system and works together with:

- **Devotee Management System Backend**
- **API Gateway**
- **Eureka Server**

This frontend allows authorized users to:

- View dashboard summaries
- Add and manage devotees
- Track donations
- Track expenses
- Trigger export jobs
- Trigger delete batch jobs

It is designed to work with secure backend APIs protected using JWT-based authentication.

---

# Frontend Scope

This repository contains the **client-side application only**.

The frontend is responsible for:

- Rendering the UI
- Calling backend APIs
- Managing login state
- Enforcing frontend-level access messaging for viewer users
- Displaying paginated records for large datasets

Backend business logic, persistence, filtering, and batch execution are handled by the backend services.

---

# Features

### Core Features

- **Login and Signup**
    - User authentication flow
    - Token-based session handling

- **Dashboard**
    - Summary cards for key metrics
    - Recent donations and expenses
    - Category breakdown charts
    - Monthly trend visualization

- **Devotee Management**
    - Add devotee records
    - View paginated devotee data
    - Delete devotee records

- **Donation Management**
    - View paginated donation records
    - Delete donation records

- **Expense Management**
    - Add expense records
    - Edit expense records
    - View paginated expense data
    - Delete expense records

---

### Operational Features

- **Export Trigger**
    - Trigger backend export job by donation type

- **Delete Batch Trigger**
    - Trigger backend delete-data batch job

- **Role-Based UI Restrictions**
    - Admin users can access protected actions
    - Viewer users receive access warning messages for restricted actions

---

### UX Features

- **Responsive Layout**
    - Works across desktop and mobile layouts

- **Paginated Tables**
    - Devotees, donations, and expenses are loaded page by page

- **Error Handling**
    - Clear API error messages shown in the UI

- **Charts & Visual Insights**
    - Donation and expense category charts
    - Monthly trend chart on dashboard

---

# Technology Stack

### Frontend
- React 18
- TypeScript
- Vite

### Styling
- Tailwind CSS
- Custom UI components
- Lucide React icons

### Routing
- React Router

### Data Visualization
- Recharts

### Build Tool
- Vite

---

# Application Modules

| Module | Description |
|--------|-------------|
| Login | Authenticates users and stores access token |
| Signup | Registers new users |
| Dashboard | Displays summary metrics, trends, and recent activity |
| Devotees | Create, list, and delete devotees |
| Donations | View and delete donation records |
| Expenses | Create, edit, list, and delete expenses |
| Export Data | Triggers backend export batch job |
| Delete Data Job | Triggers backend delete batch job |

---

# Authentication & Authorization

The frontend integrates with the backend authentication flow.

### Authentication Flow

1. User logs in with username and password.
2. Backend returns a JWT access token.
3. Frontend stores the token in local storage.
4. Protected API requests include the token in the `Authorization` header.

### Authorization

- Users with usernames **Ayush** and **Rajesh** are treated as admin users
- Other users are treated as viewer users in the UI flow
- Restricted actions show:

```text
You do not have access to this functionality.
```

---

# Pagination

The frontend implements **end-to-end pagination** for large datasets.

### Current Pagination Behavior

- Devotees page loads records in pages of **20**
- Donations page loads records in pages of **20**
- Expenses page loads records in pages of **20**

When a user changes the page from the UI:

1. The frontend sends the selected page number and page size to the backend
2. The backend returns only that page of records
3. The UI updates the table and pagination controls

This keeps list pages more scalable and reduces payload size.

---

# API Integration

The frontend communicates with backend APIs exposed through the **API Gateway**.

### Main API Areas Used

| Area | Endpoint Prefix |
|------|-----------------|
| Authentication | `/login`, `/api/user`, `/api/logout` |
| Dashboard | `/api/dashboard` |
| Devotees | `/api/devotees` |
| Donations | `/api/donation` |
| Expenses | `/api/expense` |
| Export Job | `/api/job/export-data` |
| Delete Batch Job | `/api/job/delete-data` |

---

# Project Structure

```text
src/
  app/
    components/     # Shared layout and UI components
    hooks/          # Reusable frontend hooks
    lib/            # API, auth, formatting, and utility logic
    pages/          # Route-level screens
    routes.tsx      # Router configuration
    types/          # Shared TypeScript DTOs and response types
  styles/           # Global styles, theme, and fonts
  main.tsx          # Application entry point
```

---

# Setup & Installation

### Clone the repository

```bash
git clone https://github.com/ayushraina123/slp-management-system-frontend.git
cd slp-management-system-frontend
```

---

## Install dependencies

```bash
npm install
```

---

## Run the development server

```bash
npm run dev
```

By default, Vite will start the app locally and the frontend will call backend routes configured through the current environment and gateway setup.

---

# Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

---

# Future Scope

- Add filtering and search on paginated tables
- Add global loading and toast feedback improvements
- Add dedicated frontend environment configuration for deployment
- Add screenshots and walkthrough documentation
- Improve dashboard backend aggregation for larger datasets
