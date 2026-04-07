# Testing the Database & API

## ✅ Server is Running

**Backend:** http://localhost:5000  
**Database:** SQLite (team_cipher.db in database folder)

---

## 🧪 Test the API

### Using PowerShell/Terminal

#### 1. Test if everything is working
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/test" -Method GET | ConvertTo-Json
```

#### 2. Get all users
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method GET | ConvertTo-Json
```

#### 3. Create a new user
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/users" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```

#### 4. Create a listing
```powershell
$body = @{
    user_id = 1
    title = "iPhone 14"
    description = "Great condition"
    price = 800.00
    category = "electronics"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/listings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```

#### 5. Get all listings
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/listings" -Method GET | ConvertTo-Json
```

---

## 📡 API Endpoints Reference

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/<id>` | Get user by ID |
| GET | `/api/users/username/<username>` | Get user by username |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/<id>` | Update user |
| DELETE | `/api/users/<id>` | Delete user |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all listings |
| GET | `/api/listings/<id>` | Get listing by ID |
| GET | `/api/users/<id>/listings` | Get user's listings |
| POST | `/api/listings` | Create new listing |
| PUT | `/api/listings/<id>` | Update listing |
| DELETE | `/api/listings/<id>` | Delete listing |

---

## 💡 Quick Test Examples

### Create a User
```powershell
$newUser = @{
    username = "binita"
    email = "binita@example.com"
    password = "securepass123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/users" `
  -Method POST `
  -ContentType "application/json" `
  -Body $newUser

$response.Content | ConvertFrom-Json
```

### Get All Users
```powershell
(Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method GET).Content | ConvertFrom-Json
```

### Create a Listing
```powershell
$listing = @{
    user_id = 1
    title = "Laptop"
    description = "Great condition, minimal use"
    price = 1200.00
    category = "electronics"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/listings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $listing

$response.Content | ConvertFrom-Json
```

---

## 🔗 Frontend Integration

From your Next.js frontend, use these fetch calls:

### Get all listings
```javascript
const response = await fetch('http://localhost:5000/api/listings');
const listings = await response.json();
console.log(listings);
```

### Create a listing
```javascript
const newListing = {
  user_id: 1,
  title: "iPhone 14",
  description: "Good condition",
  price: 800.00,
  category: "electronics"
};

const response = await fetch('http://localhost:5000/api/listings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newListing)
});

const result = await response.json();
console.log(result);
```

### Get all users
```javascript
const response = await fetch('http://localhost:5000/api/users');
const users = await response.json();
console.log(users);
```

---

## 📊 Database Tables

View your database file at: `database/team_cipher.db`

Tables:
- **users** - User accounts
- **listings** - Items for sale
- **messages** - Messages between users
- **favorites** - Bookmarked listings
- **reviews** - User reviews

---

## 🐛 Troubleshooting

### Server won't start
- Make sure you're in the `backend` directory
- Ensure Python and Flask are installed: `py -m pip install -r requirements.txt`

### Database error
- Check that `database/__init__.py` exists
- Verify `schema.sql` is in the database folder
- Delete `database/team_cipher.db` and restart to reinitialize

### CORS errors from frontend
- CORS is enabled in Flask with `CORS(app)`
- Make sure frontend requests go to `http://localhost:5000`

### Port 5000 already in use
- Kill any existing processes on port 5000
- Or modify the port in `app.py`: `app.run(debug=True, port=5001)`

---

## ✨ Next Steps

1. ✅ Database is set up and running
2. ✅ Backend API is connected
3. Next: Connect your Next.js frontend to these API endpoints
4. Add authentication and password hashing
5. Implement real-time features (messages, notifications)

---

**Database Location:** `C:\Users\20bin\Documents\GitHub\Team-Cipher\database\team_cipher.db`  
**Backend Location:** `C:\Users\20bin\Documents\GitHub\Team-Cipher\backend\app.py`  
**Frontend Location:** `C:\Users\20bin\Documents\GitHub\Team-Cipher\frontend\`
