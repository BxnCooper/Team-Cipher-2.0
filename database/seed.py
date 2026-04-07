"""
Seed Script - Populates the database with sample data
Can be run standalone: cd database && python seed.py
Also called automatically by backend on first start
"""

import os
import sys
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), 'team_cipher.db')


def seed():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Check if already seeded
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] > 0:
        print("Database already has data, skipping seed")
        conn.close()
        return

    # ── Users ──
    users = [
        ('admin', 'admin@university.edu', 'admin123', 'admin'),
        ('jsmith', 'john.smith@university.edu', 'password123', 'user'),
        ('emilyr', 'emily.r@university.edu', 'password123', 'user'),
        ('carlos99', 'carlos.m@university.edu', 'password123', 'user'),
        ('priya_k', 'priya.k@university.edu', 'password123', 'user'),
    ]

    c.executemany(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        users
    )
    print(f"Seeded {len(users)} users")

    # ── Listings ──
    listings = [
        (2, 'Calculus Textbook (Stewart 9th Ed)',
         'Barely used, no highlights or writing. Covers Calc I and II. Retail is $180, selling for cheap since I graduated.',
         45.00, 'textbooks', 'https://picsum.photos/id/24/400/300'),

        (3, 'MacBook Air M2 - Great Condition',
         '2023 MacBook Air M2, 8GB RAM, 256GB SSD. Space Gray. Comes with charger. Minor scuff on bottom, screen is perfect. Battery health 94%.',
         750.00, 'electronics', 'https://picsum.photos/id/0/400/300'),

        (4, 'IKEA Desk + Chair Combo',
         'MALM desk (white, 55") and MARKUS office chair. Both in good shape, just some normal wear. Pick up only.',
         120.00, 'furniture', 'https://picsum.photos/id/36/400/300'),

        (2, 'TI-84 Plus CE Graphing Calculator',
         'Works perfectly, color screen. Includes USB cable. Great for any math or engineering class.',
         60.00, 'electronics', 'https://picsum.photos/id/60/400/300'),

        (5, 'North Face Jacket - Men\'s Medium',
         'Black Thermoball jacket, men\'s medium. Worn one season, still in great shape. Super warm and lightweight.',
         85.00, 'clothing', 'https://picsum.photos/id/119/400/300'),

        (3, 'Organic Chemistry (Bruice 8th)',
         'Has some highlighting in chapters 1-6 but otherwise clean. Comes with the study guide. Need gone ASAP.',
         35.00, 'textbooks', 'https://picsum.photos/id/42/400/300'),

        (5, 'Yoga Mat + Resistance Bands Set',
         'Purple yoga mat (thick, non-slip) and a set of 5 resistance bands with handles. Used a few times.',
         25.00, 'sports', 'https://picsum.photos/id/26/400/300'),

        (4, 'Dorm Mini Fridge',
         'Compact 3.2 cu ft mini fridge with small freezer compartment. Works great, selling because I\'m moving off campus.',
         55.00, 'furniture', 'https://picsum.photos/id/225/400/300'),

        (2, 'Sony WH-1000XM4 Headphones',
         'Noise cancelling headphones in black. Incredible sound quality. Comes with case and all cables. Upgrading to XM5.',
         140.00, 'electronics', 'https://picsum.photos/id/39/400/300'),

        (4, 'Wilson Basketball - Indoor/Outdoor',
         'Official size, good grip. Used for intramurals last semester.',
         15.00, 'sports', 'https://picsum.photos/id/106/400/300'),

        (5, 'Intro to Psychology (Myers 13th)',
         'Clean copy, no marks. Required for PSY 101.',
         30.00, 'textbooks', 'https://picsum.photos/id/46/400/300'),

        (3, 'USB-C Hub + Monitor Stand Bundle',
         '7-in-1 USB-C hub (HDMI, USB 3.0 x3, SD, microSD, PD) and a wooden monitor riser. Clean desk setup.',
         40.00, 'electronics', 'https://picsum.photos/id/180/400/300'),
    ]

    c.executemany(
        "INSERT INTO listings (user_id, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        listings
    )
    print(f"Seeded {len(listings)} listings")

    conn.commit()
    conn.close()
    print("Seed complete! Default login: admin / admin123")


if __name__ == '__main__':
    # When run standalone, initialize schema first
    sys.path.insert(0, os.path.dirname(__file__))
    from db import initialize_db

    # Optionally reset DB
    if '--reset' in sys.argv:
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
            print("Removed old database")

    initialize_db()
    seed()
