'use client';

import Navbar from './components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { BookOpen, Monitor, Armchair, Shirt, Dumbbell, Package } from 'lucide-react';

const API = 'http://localhost:5000';

const categories = [
  { name: 'Textbooks', slug: 'textbooks', icon: BookOpen },
  { name: 'Electronics', slug: 'electronics', icon: Monitor },
  { name: 'Furniture', slug: 'furniture', icon: Armchair },
  { name: 'Clothing', slug: 'clothing', icon: Shirt },
  { name: 'Sports', slug: 'sports', icon: Dumbbell },
  { name: 'Other', slug: 'other', icon: Package },
];

function imgSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API}${url}`;
}

export default function Home() {
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/listings?limit=6`)
      .then(res => res.json())
      .then(data => setRecentListings(data.listings || []))
      .catch(() => {});
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero + Categories */}
      <section className="hero">
        <div className="container">
          <h1>Eagle<span>Mart</span></h1>
          <p>Buy and sell items with fellow students. Fast, easy, and local.</p>
          <div className="hero-actions">
            <Link href="/listings" className="btn btn-accent">Browse Listings</Link>
            <Link href="/create-listing" className="btn btn-outline" style={{color:'#ccc',borderColor:'#555'}}>Sell Something</Link>
          </div>

          {/* Categories */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginTop: 36,
            flexWrap: 'wrap',
          }}>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/listings?category=${cat.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  color: '#999',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffd046'}
                onMouseLeave={e => e.currentTarget.style.color = '#999'}
              >
                <cat.icon size={24} strokeWidth={1.5} />
                <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="container" style={{ paddingTop: 36, paddingBottom: 40 }}>
        <div className="section-header">
          <h2>Recent Listings</h2>
          <Link href="/listings">View all →</Link>
        </div>
        {recentListings.length > 0 ? (
          <div className="grid-3">
            {recentListings.map(item => (
              <Link key={item.id} href={`/listings/${item.id}`} className="card">
                <div className="listing-card-img">
                  {imgSrc(item.image_url) ? (
                    <img src={imgSrc(item.image_url)} alt={item.title} />
                  ) : '📷'}
                </div>
                <div className="listing-card-body">
                  {/* VULNERABILITY: XSS - rendering title without sanitization */}
                  <h3
                    className="listing-card-title"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                  {item.description && (
                    <p className="listing-card-desc">{item.description}</p>
                  )}
                  <p className="listing-card-price">${item.price}</p>
                  <div className="listing-card-meta">
                    <span className="badge badge-gray">{item.category}</span>
                    <span>{item.seller_name || 'Unknown'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <p>No listings yet. Be the first to post!</p>
            <Link href="/create-listing" className="btn btn-accent">Create Listing</Link>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <p><span>EagleMart</span> · Student Marketplace</p>
      </footer>
    </div>
  );
}
