# Mang Ikong Foodhouse API

A REST API for **Mang Ikong Foodhouse**, a small Filipino restaurant. Customers can view the menu, place food orders and reserve tables. The admin manages the menu, updates order status and confirms reservations.

Built for **ITEC 116** with **NestJS**, **TypeORM**, **MySQL** and **JWT authentication**.

## Features

- Register and log in with **JWT** tokens; passwords are hashed with **bcrypt**
- **Role-based access**: `customer` and `admin`
- **Menu items**: public menu, admin-only add / edit / mark sold out / delete
- **Orders**: the server looks up real prices, calculates each subtotal and the total, and saves the order with its items in one transaction
- **Table reservations**: future dates only, and the same table can't be double-booked within 2 hours
- **Input validation** on every request with `class-validator` (400 Bad Request on invalid data)

## Tech stack

| Part | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | MySQL / MariaDB (XAMPP) |
| ORM | TypeORM |
| Authentication | Passport JWT, bcrypt |
| Validation | class-validator, class-transformer |
| API testing | Postman |

## Project structure

```
src/
├── auth/            # register, login, profile, JWT strategy, guards, decorators
├── users/           # User entity + admin user management
├── menu-items/      # MenuItem entity + menu CRUD
├── orders/          # Order and OrderItem entities + ordering logic
├── reservations/    # TableReservation entity + booking logic
├── common/          # shared helpers (decimal transformer)
├── app.module.ts    # loads .env and connects to MySQL
├── main.ts          # starts the app, global validation
└── seed.ts          # creates the admin account and sample menu
database/
└── mang_ikong_db.sql                          # database export (tables + sample data)
Postman/
└── Mang Ikong API.postman_collection.json     # all 28 requests
```

Each module follows the same layers: **Controller** (routes) → **Service** (business logic) → **Repository** (TypeORM, database).

## Setup

### Requirements

- Node.js 20 or newer
- XAMPP (MySQL running on port 3306)

### 1. Install packages

```bash
git clone https://github.com/buenahh12/mang-ikong-api.git
cd mang-ikong-api
npm install
```

### 2. Create the database

In XAMPP, start **MySQL**, open http://localhost/phpmyadmin and choose one:

- **Option A, empty database:** create a database named `mang_ikong_db`. The tables are created automatically when the app starts.
- **Option B, with sample data:** create `mang_ikong_db`, open it, go to **Import** and choose `database/mang_ikong_db.sql`.

### 3. Create the `.env` file

Copy `.env.example` to `.env` and set a `JWT_SECRET`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=mang_ikong_db
JWT_SECRET=any-long-random-text
JWT_EXPIRES_IN=1d
SEED_ADMIN_EMAIL=admin@mangikong.com
SEED_ADMIN_PASSWORD=
```

### 4. Create the admin account (skip if you imported the .sql file)

```bash
npm run seed
```

This creates the admin account and 8 sample menu items. It is safe to run more than once.

### 5. Start the server

```bash
npm run start:dev
```

The API runs at **http://localhost:3000**.

## Test accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@mangikong.com | Admin@12345 |
| Customer | juan@example.com | password123 |

The customer account comes from the `.sql` import. On an empty database, create one with `POST /auth/register`.

## Authentication

1. `POST /auth/login` returns an `accessToken`.
2. Send it on protected routes as a header: `Authorization: Bearer <accessToken>`.

| Status | Meaning |
|---|---|
| 401 Unauthorized | No token, or the token is invalid or expired |
| 403 Forbidden | Logged in, but not allowed (for example, a customer using an admin route) |

## API endpoints (27)

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a customer account |
| POST | `/auth/login` | Public | Log in and get a JWT |
| GET | `/auth/profile` | Logged in | Current user's profile |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| GET | `/users/:id` | Admin | Get one user |
| PATCH | `/users/:id` | Admin | Update name, email or role |
| DELETE | `/users/:id` | Admin | Delete a user (also deletes their orders and reservations) |

### Menu items

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/menu-items` | Public | List the menu (`?category=Rice`, `?available=true`) |
| GET | `/menu-items/:id` | Public | Get one dish |
| POST | `/menu-items` | Admin | Add a dish |
| PATCH | `/menu-items/:id` | Admin | Edit a dish (only the fields sent) |
| PATCH | `/menu-items/:id/availability` | Admin | Mark sold out or available |
| DELETE | `/menu-items/:id` | Admin | Delete a dish (409 if it is in an order) |

### Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/orders` | Logged in | Place an order |
| GET | `/orders/my` | Logged in | My orders |
| GET | `/orders/:id` | Owner or admin | One order with its items |
| GET | `/orders/:id/items` | Owner or admin | Items of an order |
| GET | `/orders` | Admin | All orders (`?status=received`) |
| PATCH | `/orders/:id/status` | Admin | `received` → `processing` → `completed` / `cancelled` |
| DELETE | `/orders/:id` | Admin | Delete an order |

Example request body for `POST /orders` (prices are never sent by the client):

```json
{
  "items": [
    { "itemId": 1, "quantity": 2 },
    { "itemId": 5, "quantity": 2 }
  ]
}
```

### Table reservations

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/reservations` | Logged in | Book a table |
| GET | `/reservations/my` | Logged in | My reservations |
| GET | `/reservations/:id` | Owner or admin | One reservation |
| PATCH | `/reservations/:id` | Owner (while pending) or admin | Change table, time or party size |
| GET | `/reservations` | Admin | All reservations (`?status=pending`) |
| PATCH | `/reservations/:id/status` | Admin | Set `confirmed` or `cancelled` |
| DELETE | `/reservations/:id` | Owner or admin | Delete a reservation |

Example request body for `POST /reservations`:

```json
{
  "tableNumber": 3,
  "reservationDate": "2026-12-24T18:00:00",
  "partySize": 4
}
```

Dates are returned in UTC, for example `2026-12-24T10:00:00.000Z` is 6:00 PM Philippine time.

## Database

| Table | Main columns | Relationship |
|---|---|---|
| `users` | user_id (PK), full_name, email (unique), password_hash, role, created_at | 1 user → many orders, many reservations |
| `menu_items` | item_id (PK), item_name, description, price, category, is_available | 1 menu item → many order_items |
| `orders` | order_id (PK), user_id (FK), order_date, total_amount, order_status | 1 order → many order_items |
| `order_items` | order_item_id (PK), order_id (FK), item_id (FK), quantity, subtotal | links orders and menu_items |
| `table_reservations` | reservation_id (PK), user_id (FK), table_number, reservation_date, party_size, status | many → 1 user |

## Testing with Postman

1. In Postman, click **Import** and choose `Postman/Mang Ikong API.postman_collection.json`.
2. Send **Admin Login** or **Login**. A script saves the token automatically.
3. Every other request uses that token (collection auth: Bearer `{{token}}`).

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Start the server and restart on file changes |
| `npm run build` | Compile to `dist/` |
| `npm run seed` | Create the admin account and sample menu |
| `npm run lint` | Check the code with oxlint |

## Author

Jhon Federico Buenavista, BSIT 4C, ITEC 116
