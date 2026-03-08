# Wallet API

Node.js + Express backend with **password encryption (bcrypt)**, **JWT authentication**, and **logout** (token blacklist).

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm start
```

Server runs at **http://localhost:3000**. Set `PORT` or `JWT_SECRET` in the environment if needed.

## API

**Auth**
| Method | Endpoint    | Auth | Description                    |
|--------|-------------|------|--------------------------------|
| POST   | /api/signup | No   | Register (password hashed)     |
| POST   | /api/login  | No   | Login, returns JWT             |
| POST   | /api/logout | No*  | Logout (optional Bearer token) |
| GET    | /api/profile| Yes  | Current user (Bearer JWT)      |

**Expenses** (all require Bearer JWT)
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| POST   | /api/expense/add   | Add expense (amount, category, description?, date?) |
| GET    | /api/expense/list  | List current user’s expenses |
| PUT    | /api/expense/update| Update expense (id + fields) |
| DELETE | /api/expense/delete| Delete expense (id in body) |

**Budget** (all require Bearer JWT)
| Method | Endpoint            | Description |
|--------|---------------------|-------------|
| POST   | /api/budget/set    | Set category budget (body: category, amount, month?) |
| GET    | /api/budget/status | Spending vs budget (query: month?) |
| GET    | /api/budget/alerts | Exceeded / warning alerts (query: month?) |

**Reports** (all require Bearer JWT)
| Method | Endpoint              | Description |
|--------|------------------------|-------------|
| GET    | /api/reports/monthly  | Monthly totals for trend (query: year?) |
| GET    | /api/reports/category | Category totals for pie chart (query: month? or year?) |
| GET    | /api/reports/export   | Data for CSV/PDF export (query: from, to) |

**Admin** (requires Bearer JWT + admin email in `ADMIN_EMAILS`, default `admin@example.com`)
| Method | Endpoint                | Description |
|--------|--------------------------|-------------|
| GET    | /api/admin/users        | List all users |
| GET    | /api/admin/transactions | All expenses + summary + suspicious flags |
| DELETE | /api/admin/user/:id     | Delete user (and their expenses, budgets) |

*Send `Authorization: Bearer <token>` for logout so the token can be blacklisted.

## Frontend

Serve the project root (e.g. Live Server on port 5500) so `login.html`, `signup.html`, and `profile.html` can call `http://localhost:3000/api`. Token is stored in `localStorage` and sent as `Authorization: Bearer <token>` for protected requests.
