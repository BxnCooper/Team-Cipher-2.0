import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'team_cipher.db')


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_db():
    conn = get_connection()
    cursor = conn.cursor()
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'r') as f:
        schema = f.read()
    cursor.executescript(schema)
    conn.commit()
    conn.close()
    print("Database initialized!")


# =====================
# USERS
# =====================

def add_user(username, email, password, role='user'):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            (username, email, password, role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError as e:
        print(f"Error adding user: {e}")
        return None


def get_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    conn.close()
    return [dict(user) for user in users]


def get_user_by_id(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None


def get_user_by_username(username):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None


def update_user(user_id, username=None, email=None, password=None):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        updates = []
        params = []
        if username is not None:
            updates.append("username = ?")
            params.append(username)
        if email is not None:
            updates.append("email = ?")
            params.append(email)
        if password is not None:
            updates.append("password = ?")
            params.append(password)
        if not updates:
            return False
        params.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error updating user: {e}")
        return False


def delete_user(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False


# =====================
# LISTINGS
# =====================

def add_listing(user_id, title, description, price, category, image_url=None):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO listings (user_id, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, title, description, price, category, image_url)
        )
        conn.commit()
        listing_id = cursor.lastrowid
        conn.close()
        return listing_id
    except Exception as e:
        print(f"Error adding listing: {e}")
        return None


def get_listings(category=None, limit=None):
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT listings.*, users.username as seller_name
        FROM listings
        JOIN users ON listings.user_id = users.id
        WHERE listings.status = 'active'
    """
    params = []
    if category:
        query += " AND listings.category = ?"
        params.append(category)
    query += " ORDER BY listings.created_at DESC"
    if limit:
        query += " LIMIT ?"
        params.append(int(limit))
    cursor.execute(query, params)
    listings = cursor.fetchall()
    conn.close()
    return [dict(l) for l in listings]


def get_listing_by_id(listing_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT listings.*, users.username as seller_name
        FROM listings
        JOIN users ON listings.user_id = users.id
        WHERE listings.id = ?
    """, (listing_id,))
    listing = cursor.fetchone()
    conn.close()
    return dict(listing) if listing else None


def get_user_listings(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT listings.*, users.username as seller_name
        FROM listings
        JOIN users ON listings.user_id = users.id
        WHERE listings.user_id = ?
        ORDER BY listings.created_at DESC
    """, (user_id,))
    listings = cursor.fetchall()
    conn.close()
    return [dict(l) for l in listings]


def search_listings(query):
    """VULNERABILITY: SQL Injection - uses string concatenation"""
    conn = get_connection()
    cursor = conn.cursor()
    sql = "SELECT listings.*, users.username as seller_name FROM listings JOIN users ON listings.user_id = users.id WHERE listings.title LIKE '%" + query + "%' OR listings.description LIKE '%" + query + "%' OR listings.category LIKE '%" + query + "%'"
    try:
        cursor.execute(sql)
        listings = cursor.fetchall()
        conn.close()
        return [dict(l) for l in listings]
    except Exception as e:
        conn.close()
        raise e


def update_listing(listing_id, title=None, description=None, price=None, category=None, image_url=None):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        updates = []
        params = []
        if title is not None:
            updates.append("title = ?")
            params.append(title)
        if description is not None:
            updates.append("description = ?")
            params.append(description)
        if price is not None:
            updates.append("price = ?")
            params.append(price)
        if category is not None:
            updates.append("category = ?")
            params.append(category)
        if image_url is not None:
            updates.append("image_url = ?")
            params.append(image_url)
        if not updates:
            return False
        params.append(listing_id)
        query = f"UPDATE listings SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error updating listing: {e}")
        return False


def delete_listing(listing_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM listings WHERE id = ?", (listing_id,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error deleting listing: {e}")
        return False


# =====================
# MESSAGES
# =====================

def add_message(sender_id, receiver_id, listing_id, message):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (sender_id, receiver_id, listing_id, message) VALUES (?, ?, ?, ?)",
            (sender_id, receiver_id, listing_id, message)
        )
        conn.commit()
        msg_id = cursor.lastrowid
        conn.close()
        return msg_id
    except Exception as e:
        print(f"Error adding message: {e}")
        return None
