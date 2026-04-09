"""
Flask Backend - EagleMart
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import (
    initialize_db,
    add_user,
    get_users,
    get_user_by_id,
    get_user_by_username,
    update_user,
    delete_user,
    add_listing,
    get_listings,
    get_listing_by_id,
    get_user_listings,
    search_listings,
    update_listing,
    delete_listing,
    add_message,
    verify_password,
)

app = Flask(__name__)
CORS(app)

# Upload folder for listing images
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# File upload security settings
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Initialize database and seed if empty
try:
    initialize_db()
    users = get_users()
    if len(users) == 0:
        print("Empty database — seeding...")
        from database.seed import seed
        seed()
    print(f"Database ready ({len(get_users())} users, {len(get_listings())} listings)")
except Exception as e:
    print(f"Database error: {e}")


# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@app.route('/api/login', methods=['POST'])
def login():
    """SECURE: Uses bcrypt password verification, generic error messages, no password in response"""
    try:
        data = request.get_json()
        username = data.get('username', '')
        password = data.get('password', '')

        user = get_user_by_username(username)
        if user and verify_password(password, user['password']):
            user_data = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({
                'user': user_data,
                'token': f'mock-token-{user["id"]}'
            })
        return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/register', methods=['POST'])
def register():
    """VULNERABILITY: No CSRF, stores plain text password"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({'error': 'Missing required fields'}), 400

        user_id = add_user(username, email, password)
        if user_id:
            user = get_user_by_id(user_id)
            user_data = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({
                'user': user_data,
                'token': f'mock-token-{user_id}'
            }), 201
        return jsonify({'error': 'Username or email already taken'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# AUTHENTICATION MIDDLEWARE
# ============================================================================

def authenticate_request():
    """Check if request has valid authentication token"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.replace('Bearer ', '')
    if not token.startswith('mock-token-'):
        return None

    try:
        user_id = int(token.replace('mock-token-', ''))
        user = get_user_by_id(user_id)
        return user
    except:
        return None

def require_auth(f):
    """Decorator to require authentication"""
    def wrapper(*args, **kwargs):
        user = authenticate_request()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# ============================================================================
# PROFILE ENDPOINT
# ============================================================================

@app.route('/api/profile/<int:user_id>', methods=['GET'])
@require_auth
def get_profile(user_id):
    """SECURE: Authentication and authorization required"""
    try:
        # Authorization: users can only access their own profile
        if request.current_user['id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403

        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        listings = get_user_listings(user_id)

        # SECURITY: Exclude sensitive fields from response
        user_data = {k: v for k, v in user.items() if k not in ['password']}
        return jsonify({
            'user': user_data,
            'listings': listings
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# LISTINGS ENDPOINTS
# ============================================================================

@app.route('/api/listings', methods=['GET'])
def list_listings():
    try:
        category = request.args.get('category')
        limit = request.args.get('limit')
        listings = get_listings(category=category, limit=limit)
        return jsonify({'listings': listings})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/listings/<int:listing_id>', methods=['GET'])
def get_single_listing(listing_id):
    try:
        listing = get_listing_by_id(listing_id)
        if listing:
            return jsonify({'listing': listing})
        return jsonify({'error': 'Listing not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/listings', methods=['POST'])
@require_auth
def create_listing():
    """SECURE: Authentication required"""
    try:
        # Handle both FormData and JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            title = request.form.get('title')
            description = request.form.get('description')
            price = request.form.get('price')
            category = request.form.get('category')
            seller_id = request.form.get('seller_id')

            # SECURITY: Verify that seller_id matches authenticated user
            if int(seller_id) != request.current_user['id']:
                return jsonify({'error': 'Unauthorized'}), 403
                #secure file validation
            image_url = None
            if 'image' in request.files:
                file = request.files['image']
                if file.filename:
                    ext = os.path.splitext(secure_filename(file.filename))[1].lower()
                    if ext not in ALLOWED_EXTENSIONS:
                        return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp'}), 400

                    file.seek(0, os.SEEK_END)
                    size = file.tell()
                    file.seek(0)
                    if size > MAX_FILE_SIZE:
                        return jsonify({'error': 'File too large. Maximum size is 5MB'}), 400

                    try:
                        img = Image.open(file)
                        img.verify()
                    except Exception:
                        return jsonify({'error': 'Invalid image file'}), 400
                    file.seek(0)

                    safe_name = f"{uuid.uuid4().hex}{ext}"
                    filepath = os.path.join(UPLOAD_FOLDER, safe_name)
                    file.save(filepath)
                    image_url = f'/uploads/{safe_name}'
        else:
            data = request.get_json()
            title = data.get('title')
            description = data.get('description')
            price = data.get('price')
            category = data.get('category')
            seller_id = data.get('seller_id') or data.get('user_id')
            image_url = data.get('image_url')

        if not all([seller_id, title, price, category]):
            return jsonify({'error': 'Missing required fields'}), 400

        listing_id = add_listing(int(seller_id), title, description, float(price), category, image_url)
        if listing_id:
            return jsonify({'id': listing_id, 'message': 'Listing created'}), 201
        return jsonify({'error': 'Failed to create listing'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/uploads/<filename>')
def serve_upload(filename):
    """Serve uploaded files"""
    return send_from_directory(UPLOAD_FOLDER, filename)


# ============================================================================
# SEARCH ENDPOINT
# ============================================================================

@app.route('/api/search', methods=['GET'])
def search():
    """VULNERABILITY: SQL Injection - query passed directly to raw SQL"""
    query = request.args.get('q', '')
    if not query:
        return jsonify({'listings': []})
    try:
        results = search_listings(query)
        return jsonify({'listings': results})
    except Exception as e:
        # VULNERABILITY: Information Disclosure - raw SQL error returned to user
        return jsonify({'error': str(e)}), 500


# ============================================================================
# MESSAGES ENDPOINT
# ============================================================================

@app.route('/api/messages', methods=['POST'])
@require_auth
def send_message():
    """SECURE: Authentication required"""
    try:
        data = request.get_json()
        sender_id = data.get('sender_id')
        listing_id = data.get('listing_id')
        message = data.get('message')

        # SECURITY: Verify that sender_id matches authenticated user
        if int(sender_id) != request.current_user['id']:
            return jsonify({'error': 'Unauthorized'}), 403

        if not sender_id or not message:
            return jsonify({'error': 'Missing fields'}), 400

        # Get listing to find receiver
        listing = get_listing_by_id(int(listing_id)) if listing_id else None
        receiver_id = listing['user_id'] if listing else 1

        msg_id = add_message(int(sender_id), receiver_id, int(listing_id) if listing_id else None, message)
        if msg_id:
            return jsonify({'id': msg_id, 'message': 'Message sent'}), 201
        return jsonify({'error': 'Failed to send message'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# TEST / HOME
# ============================================================================

@app.route('/api/test')
def test():
    try:
        users = get_users()
        listings = get_listings()
        return jsonify({
            'message': 'API working',
            'status': 'online',
            'users_count': len(users),
            'listings_count': len(listings),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def home():
    return jsonify({
        'app': 'EagleMart API',
        'status': 'running',
        'endpoints': [
            'POST /api/login',
            'POST /api/register',
            'GET /api/profile/<id>',
            'GET /api/listings',
            'GET /api/listings/<id>',
            'POST /api/listings',
            'GET /api/search?q=',
            'POST /api/messages',
            'GET /api/test',
        ]
    })


if __name__ == '__main__':
    print("=" * 50)
    print("EagleMart Backend - http://localhost:5001")
    print("=" * 50)
    app.run(debug=True, port=5001)
