# CS308 Store

A full-stack e-commerce platform developed for the CS308 course project. The application provides a customer-facing storefront, role-based management panels, product and category administration, checkout and payment flows, delivery tracking, review moderation, invoices, returns, wishlists, and automated backend tests.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Available Scripts](#available-scripts)
- [Default Application URLs](#default-application-urls)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Development Notes](#development-notes)
- [License](#license)

## Overview

CS308 Store is organized as a two-part web application:

- `cs308-backend`: Node.js, Express, and MongoDB REST API.
- `cs308-frontend`: Vue 3 and Vite single-page application.

The backend exposes protected and public API endpoints for products, authentication, carts, orders, payments, deliveries, invoices, reviews, returns, wishlists, and categories. The frontend consumes those APIs through Axios and provides both customer workflows and restricted admin workflows.

## Features

### Customer Experience

- Product catalog with search and sorting.
- Product detail pages with approved customer reviews.
- User registration, login, profile management, and profile photo upload.
- Authenticated cart, checkout, payment, order, and invoice workflows.
- Wishlist management.
- Return request creation and tracking.
- Session handling with automatic redirect on expired or invalid tokens.

### Product Management

- Product creation, editing, deletion, stock updates, and category assignment.
- Category creation, editing, and deletion.
- Review moderation workflow for approving or rejecting submitted reviews.
- Product popularity calculation based on paid order quantities.

### Sales Management

- Delivery list and delivery status management.
- Order and payment related operational views.
- Invoice generation and download support.

### Backend Reliability

- Centralized authentication and role authorization middleware.
- Centralized error handling.
- Encrypted sensitive user fields for tax ID and address.
- PDF invoice generation.
- SMTP-backed invoice email support when mail settings are configured.
- Jest and Supertest coverage for API, model, and controller behavior.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Vue 3, Vite, Vue Router, Axios, Tailwind CSS, Vitest |
| Backend | Node.js, Express 5, Mongoose, JWT, bcrypt, multer |
| Database | MongoDB |
| Documents and Email | PDFKit, Nodemailer |
| Testing | Jest, Supertest, Vitest |

## Project Structure

```text
.
+-- API.md
+-- README.md
+-- cs308-backend
|   +-- config
|   +-- controllers
|   +-- middleware
|   +-- models
|   +-- routes
|   +-- seed
|   +-- tests
|   +-- utils
|   +-- package.json
|   +-- server.js
+-- cs308-frontend
    +-- public
    +-- src
    |   +-- api
    |   +-- components
    |   +-- data
    |   +-- pages
    |   +-- router
    |   +-- store
    +-- package.json
    +-- vite.config.js
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cs308-project-group12
```

### 2. Install Backend Dependencies

```bash
cd cs308-backend
npm install
```

### 3. Configure Backend Environment

Create a `.env` file inside `cs308-backend`:

```env
PORT=5001
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
SENSITIVE_DATA_KEY=<optional-sensitive-data-encryption-key>

# Optional SMTP settings for invoice emails
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
SMTP_FROM="CS308 Store <noreply@cs308store.com>"
```

### 4. Seed Initial Data

Run the product and user seeders from the backend directory:

```bash
node seed/seedProducts.js
node seed/seedUsers.js
```

### 5. Start the Backend

```bash
npm run dev
```

The API runs at `http://localhost:5001`.

### 6. Install Frontend Dependencies

Open a second terminal:

```bash
cd cs308-frontend
npm install
```

### 7. Start the Frontend

```bash
npm run dev
```

The application runs at `http://localhost:5173`.

## Environment Variables

The backend reads environment variables from `cs308-backend/.env`.

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `5001`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Recommended | Secret used for signing JWTs. A development fallback exists, but production-like runs should set this explicitly. |
| `JWT_EXPIRES_IN` | No | JWT lifetime. Defaults to `7d`. |
| `SENSITIVE_DATA_KEY` | Recommended | Key used to encrypt sensitive profile fields. Falls back to `JWT_SECRET` when omitted. |
| `SMTP_HOST` | No | SMTP host for sending invoice emails. |
| `SMTP_PORT` | No | SMTP port. Defaults to `587`. |
| `SMTP_USER` | No | SMTP username. |
| `SMTP_PASS` | No | SMTP password. |
| `SMTP_SECURE` | No | Set to `true` for secure SMTP connections. |
| `SMTP_FROM` | No | Sender address for invoice emails. |

Do not commit `.env` files. They are ignored by `.gitignore`.

## Database Seeding

The backend includes seed scripts for common development data:

```bash
cd cs308-backend
node seed/seedProducts.js
node seed/seedUsers.js
```

`seedUsers.js` creates two default manager accounts:

| Role | Email | Password |
| --- | --- | --- |
| Sales Manager | `salesmanager@store.com` | `sales123` |
| Product Manager | `productmanager@store.com` | `product123` |

These credentials are intended for local development and demonstration only.

## Available Scripts

### Backend

Run these commands from `cs308-backend`:

| Command | Description |
| --- | --- |
| `npm start` | Starts the Express server with Node. |
| `npm run dev` | Starts the Express server with Nodemon. |
| `npm test` | Runs backend Jest tests serially. |

### Frontend

Run these commands from `cs308-frontend`:

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the frontend for production. |
| `npm run preview` | Serves the production build locally. |
| `npm test` | Runs frontend Vitest tests. |

## Default Application URLs

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5001` |
| API Base Path | `http://localhost:5001/api` |
| Uploaded Assets | `http://localhost:5001/uploads` |

## User Roles

The application uses JWT authentication and role-based authorization.

| Role | Capabilities |
| --- | --- |
| `customer` | Browse products, manage profile, cart, checkout, payments, orders, invoices, wishlists, reviews, and returns. |
| `product_manager` | Manage products, categories, stock, dashboard views, and review moderation. |
| `sales_manager` | Manage sales and delivery workflows. |

Frontend route guards restrict admin screens by role, and backend middleware enforces authorization on protected API endpoints.

## API Overview

The backend exposes the following API groups:

| Resource | Base Route | Purpose |
| --- | --- | --- |
| Authentication | `/api/auth` | Register, login, read and update current user profile. |
| Products | `/api/products` | Product listing, search, sorting, details, create, update, delete. |
| Categories | `/api/categories` | Category listing and product-manager category administration. |
| Cart | `/api/cart` | Authenticated cart retrieval and item quantity management. |
| Checkout | `/api/checkout` | Checkout validation and order creation from a cart. |
| Payments | `/api/payments` | Payment preparation and processing for orders. |
| Orders | `/api/orders` | Customer order history and order cancellation. |
| Deliveries | `/api/deliveries` | Sales-manager delivery listing and status updates. |
| Reviews | `/api/reviews` | Customer review creation and product review listing. |
| Moderation | `/api/moderation` | Product-manager review approval and rejection. |
| Invoices | `/api/invoices` | Invoice listing and PDF download. |
| Returns | `/api/returns` | Customer return request creation and tracking. |
| Wishlist | `/api/wishlist` | Customer wishlist retrieval and item updates. |

See [`API.md`](./API.md) for additional endpoint notes.

## Testing

Run backend tests:

```bash
cd cs308-backend
npm test
```

Run frontend tests:

```bash
cd cs308-frontend
npm test
```

The backend test suite includes coverage for authentication, products, categories, cart, checkout, orders, deliveries, payments, invoices, reviews, moderation, returns, wishlist models, and security flows.

## Development Notes

- Run backend and frontend in separate terminals during development.
- The frontend currently points to `http://localhost:5001/api` in its Axios clients.
- Product IDs use the project-level `productId` field instead of MongoDB `_id` in product routes.
- Product search supports text matching across product fields.
- Product sorting supports price ascending, price descending, and popularity.
- Popularity is calculated from paid orders by summing sold quantities per product.
- Uploaded profile images are served from the backend `/uploads` path.
- Keep generated files, `.env`, and `node_modules` out of version control.

## License

This project is licensed under the [MIT License](./LICENSE).
