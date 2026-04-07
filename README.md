# EagleMart - Student Marketplace

**CSC 489 - Web Application Security | Spring 2026 | Team Cipher**

EagleMart is a full-stack campus marketplace web application where students can buy and sell items such as textbooks, electronics, furniture, and more. Built with intentional security vulnerabilities as part of the CSC 489 Capstone Project for educational penetration testing.

---

## Prerequisites

Make sure you have these installed before starting:

- **Node.js** v18 or higher — [download here](https://nodejs.org/)
- **Python** 3.8 or higher — [download here](https://www.python.org/downloads/)

Verify installation:
```bash
node --version    # should show v18+
python3 --version # should show 3.8+
```

---

## Getting Started

### Option 1: Start Everything (Recommended)

From the project root directory:

```bash
chmod +x start.sh   # only needed once
./start.sh
```

This single command will:
1. Create a Python virtual environment (if not exists)
2. Install backend dependencies
3. Initialize the database and seed it with sample data
4. Start the Flask backend on port 5000
5. Install frontend dependencies (if not exists)
6. Start the Next.js frontend on port 3000

Press `Ctrl+C` to stop both servers.

### Option 2: Start Manually

You need **two separate terminal windows**.

**Terminal 1 — Start the Backend:**
```bash
cd backend
python3 -m venv venv                # create virtual environment (first time only)
source venv/bin/activate             # activate it (macOS/Linux)
# OR: venv\Scripts\activate          # activate it (Windows)
pip install -r requirements.txt      # install dependencies (first time only)
python app.py                        # start the server
```
The backend will run on **http://localhost:5000**

**Terminal 2 — Start the Frontend:**
```bash
cd frontend
npm install          # install dependencies (first time only)
npm run dev          # start the dev server
```
The frontend will run on **http://localhost:3000**

### Open the App

Go to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Credentials

The database is automatically seeded with these test accounts on first start:

| Username | Password    | Role  |
|----------|-------------|-------|
| admin    | admin123    | admin |
| jsmith   | password123 | user  |
| emilyr   | password123 | user  |
| carlos99 | password123 | user  |
| priya_k  | password123 | user  |

12 sample listings are also created across categories: textbooks, electronics, furniture, clothing, and sports.

---

## Features

- **User Authentication** — Login and registration with session management
- **User Profiles** — View user details and their active listings
- **Marketplace Listings** — Browse, filter by category, view details
- **Create Listings** — Post items for sale with photo upload
- **Search** — Search across all listing titles and descriptions
- **Contact Seller** — Send messages to listing owners
- **Categories** — Textbooks, Electronics, Furniture, Clothing, Sports, Other

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | Next.js 14, React 18, Lucide Icons |
| Backend   | Flask 3.0, Python                  |
| Database  | SQLite 3                           |

---

## Project Structure

```
Team-Cipher/
│
├── start.sh                         # Start both servers with one command
├── README.md                        # This file
│
├── backend/
│   ├── app.py                       # Flask API — all endpoints
│   ├── requirements.txt             # Python dependencies
│   ├── uploads/                     # Uploaded listing images
│   └── README.md
│
├── database/
│   ├── schema.sql                   # Table definitions (users, listings, messages, etc.)
│   ├── db.py                        # Database functions (CRUD operations)
│   ├── seed.py                      # Seed script — populates sample data
│   ├── __init__.py                  # Package exports
│   └── team_cipher.db              # SQLite database file (auto-created)
│
└── frontend/
    ├── public/
    │   └── logo.svg                 # EagleMart eagle logo
    ├── app/
    │   ├── globals.css              # Global styles (black/white/gold theme)
    │   ├── layout.jsx               # Root layout
    │   ├── page.jsx                 # / — Landing page
    │   ├── login/page.jsx           # /login
    │   ├── register/page.jsx        # /register
    │   ├── listings/page.jsx        # /listings — Browse all
    │   ├── listings/[id]/page.jsx   # /listings/:id — Detail view
    │   ├── create-listing/page.jsx  # /create-listing
    │   ├── profile/[id]/page.jsx    # /profile/:id
    │   ├── search/page.jsx          # /search
    │   └── components/Navbar.jsx    # Navigation bar
    ├── package.json
    ├── next.config.js
    └── README.md
```

---

## API Endpoints

| Method | Endpoint              | Description                                       |
|--------|-----------------------|---------------------------------------------------|
| POST   | `/api/login`          | Authenticate user, returns user object + token     |
| POST   | `/api/register`       | Create new user account                            |
| GET    | `/api/profile/:id`    | Get user profile and their listings                |
| GET    | `/api/listings`       | Get all listings (supports `?category=` `?limit=`) |
| GET    | `/api/listings/:id`   | Get a single listing by ID                         |
| POST   | `/api/listings`       | Create a new listing (accepts FormData or JSON)    |
| GET    | `/api/search?q=`      | Search listings by title/description               |
| POST   | `/api/messages`       | Send a message to a listing's seller               |
| GET    | `/api/test`           | Health check — returns user/listing counts         |

---

## Frontend Pages

| Route              | Page            | Description                          |
|--------------------|-----------------|--------------------------------------|
| `/`                | Landing         | Hero section, categories, recent listings |
| `/login`           | Login           | Sign-in form                         |
| `/register`        | Register        | Account creation form                |
| `/listings`        | Browse          | All listings with category filters   |
| `/listings/[id]`   | Listing Detail  | Full listing info, contact seller    |
| `/create-listing`  | Create Listing  | Post a new item for sale             |
| `/profile/[id]`    | Profile         | User info and their listings         |
| `/search`          | Search          | Search with quick category filters   |

---

## Database Schema

```
users           listings            messages
─────           ────────            ────────
id              id                  id
username        user_id → users.id  sender_id → users.id
email           title               receiver_id → users.id
password        description         listing_id → listings.id
role            price               message
created_at      category            is_read
updated_at      image_url           created_at
                status
                created_at
```

---

## Reset Database

To wipe and re-seed the database with fresh sample data:

```bash
cd database
python3 seed.py --reset
```

Or simply delete the database file and restart the backend:

```bash
rm database/team_cipher.db
cd backend && source venv/bin/activate && python app.py
```

The backend will detect the empty database and auto-seed it.

---

## Troubleshooting

**"command not found: python3"**
- Make sure Python 3.8+ is installed and in your PATH

**"No module named flask"**
- You forgot to activate the virtual environment: `source backend/venv/bin/activate`

**Frontend won't start**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend won't start**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Port 5000 already in use (macOS)**
- macOS uses port 5000 for AirPlay Receiver. Disable it in System Settings > General > AirDrop & Handoff > AirPlay Receiver
- Or kill the process: `lsof -i :5000` then `kill -9 <PID>`

**Database errors**
- Delete `database/team_cipher.db` and restart the backend — it will auto-recreate and seed

---

## Team

**Team Cipher** — CSC 489 Web Application Security, Spring 2026

University of Southern Mississippi
