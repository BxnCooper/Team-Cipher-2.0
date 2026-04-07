# EagleMart Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Runs on [http://localhost:5000](http://localhost:5000). Auto-seeds database on first start.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Login |
| POST | `/api/register` | Register |
| GET | `/api/profile/:id` | User profile + listings |
| GET | `/api/listings` | All listings (supports `?category=` and `?limit=`) |
| GET | `/api/listings/:id` | Single listing |
| POST | `/api/listings` | Create listing (FormData or JSON) |
| GET | `/api/search?q=` | Search listings |
| POST | `/api/messages` | Send message to seller |
