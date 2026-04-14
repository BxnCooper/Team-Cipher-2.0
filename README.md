# EagleMart - Student Marketplace

**CSC 489 - Web Application Security | Spring 2026 | Team Cipher**

EagleMart is a full-stack campus marketplace web application where students can buy and sell items such as textbooks, electronics, furniture, and more. Built as part of the CSC 489 Capstone Project. Security hardened during Milestone 3 defense phase following penetration testing by Team Vortex.

---

## Prerequisites

- **Node.js** v18 or higher — [download here](https://nodejs.org/)
- **Python** 3.8 or higher — [download here](https://www.python.org/downloads/)

---

## Getting Started

### Option 1: Start Everything (Recommended)

```bash
chmod +x start.sh   # only needed once
./start.sh
```

This single command will:
1. Create a Python virtual environment (if not exists)
2. Install backend dependencies
3. Initialize the database and seed it with sample data
4. Start the Flask backend on port 5001
5. Install frontend dependencies (if not exists)
6. Start the Next.js frontend on port 3000

Press `Ctrl+C` to stop both servers.

### Option 2: Start Manually

**Terminal 1 — Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
The backend will run on **http://localhost:5001**

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:3000**

### Open the App

Go to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Accounts

The database is automatically seeded with test accounts on first start. All passwords are hashed with bcrypt. See `database/seed.py` for usernames and credentials.

12 sample listings are also created across categories: textbooks, electronics, furniture, clothing, and sports.

---

## Features

- **User Authentication** — Login and registration with bcrypt password hashing
- **User Profiles** — Authenticated access to user details and active listings
- **Marketplace Listings** — Browse, filter by category, view details
- **Create Listings** — Post items for sale with validated image upload
- **Search** — Search across all listing titles, descriptions, and categories
- **Contact Seller** — Send messages to listing owners (authenticated)
- **Categories** — Textbooks, Electronics, Furniture, Clothing, Sports, Other

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | Next.js 14, React 18, Lucide Icons |
| Backend   | Flask 3.0, Python, bcrypt          |
| Database  | SQLite 3                           |

---

## Project Structure

```
TeamCipher_Milestone3/
├── start.sh                         # Start both servers
├── README.md                        # This file
│
├── backend/
│   ├── app.py                       # Flask API — all endpoints
│   ├── requirements.txt             # Python dependencies (Flask, flask-cors, bcrypt)
│   └── uploads/                     # Uploaded listing images (UUID filenames)
│
├── database/
│   ├── schema.sql                   # Table definitions
│   ├── db.py                        # Database functions + verify_password()
│   ├── seed.py                      # Seed script (bcrypt-hashed passwords)
│   ├── __init__.py                  # Package exports
│   └── team_cipher.db              # SQLite database (auto-created on first start)
│
└── frontend/
    ├── public/
    │   └── logo.svg                 # EagleMart logo
    ├── app/
    │   ├── globals.css              # Global styles
    │   ├── layout.jsx               # Root layout
    │   ├── page.jsx                 # Landing page
    │   ├── login/page.jsx           # Login
    │   ├── register/page.jsx        # Registration
    │   ├── listings/page.jsx        # Browse listings
    │   ├── listings/[id]/page.jsx   # Listing detail
    │   ├── create-listing/page.jsx  # Create listing
    │   ├── profile/[id]/page.jsx    # User profile
    │   ├── search/page.jsx          # Search
    │   └── components/Navbar.jsx    # Navigation bar
    ├── package.json
    └── next.config.js
```

---

## API Endpoints

| Method | Endpoint              | Auth | Description                                  |
|--------|-----------------------|------|----------------------------------------------|
| POST   | `/api/login`          | No   | Authenticate user, returns token             |
| POST   | `/api/register`       | No   | Create new user account                      |
| GET    | `/api/profile/:id`    | Yes  | Get own profile and listings                 |
| GET    | `/api/listings`       | No   | Browse listings (`?category=` `?limit=`)     |
| GET    | `/api/listings/:id`   | No   | Get a single listing                         |
| POST   | `/api/listings`       | Yes  | Create listing (validated image upload)      |
| GET    | `/api/search?q=`      | No   | Search by title/description/category         |
| POST   | `/api/messages`       | Yes  | Send message to seller                       |
| GET    | `/api/test`           | No   | Health check                                 |

---

## Reset Database

Delete the database file and restart the backend — it will auto-recreate and seed:

```bash
rm database/team_cipher.db
cd backend && source venv/bin/activate && python app.py
```

---

## Troubleshooting

**"No module named flask"** — Activate the virtual environment: `source backend/venv/bin/activate`

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

**Port 5001 already in use (macOS)**
- macOS uses port 5001 for AirPlay Receiver. Disable it in System Settings > General > AirDrop & Handoff > AirPlay Receiver
- Or kill the process: `lsof -i :5001` then `kill -9 <PID>`

**Database errors**
- Delete `database/team_cipher.db` and restart the backend — it will auto-recreate and seed

---

## Security

The following security controls are implemented:

- **SQL Injection Prevention** — All database queries use parameterized placeholders (`?`)
- **XSS Prevention** — React safe text rendering (no `dangerouslySetInnerHTML`)
- **Password Hashing** — bcrypt with salting for all stored passwords
- **Password Exclusion** — Password field stripped from all API responses
- **Authentication** — Bearer token required for protected endpoints
- **Authorization** — Users can only access their own profile data
- **File Upload Validation** — Extension whitelist (images only), 5MB size limit, UUID filenames
- **CORS Restriction** — Only frontend origins allowed (`localhost:3000`, `localhost:3001`)
- **Generic Error Messages** — No internal details leaked to clients
- **Debug Mode Disabled** — Flask runs with `debug=False`

---

## Team

**Team Cipher** — CSC 489 Web Application Security, Spring 2026

Toby Holekamp, Chetanchal Saud, Benjamin Cooper, Christian Stuart, Binita Dhakal

University of Southern Mississippi
