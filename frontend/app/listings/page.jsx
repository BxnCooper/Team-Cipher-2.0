'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';


const API = 'http://localhost:5000';

const categories = [
  { name: 'All', slug: '' },
  { name: 'Textbooks', slug: 'textbooks' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Other', slug: 'other' },
];

function imgSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API}${url}`;
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = activeCategory
      ? `${API}/api/listings?category=${activeCategory}`
      : `${API}/api/listings`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setListings(data.listings || []);
        setLoading(false);
      })
      .catch(() => {
        setListings([]);
        setLoading(false);
      });
  }, [activeCategory]);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ flex: 1 }}>
        <div className="page-header">
          <h1>Browse Listings</h1>
          <p>Find what you need from fellow students</p>
        </div>

        {/* Category filter pills */}
        <div className="filter-pills">
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`pill ${activeCategory === cat.slug ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Listings grid */}
        {loading ? (
          <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>Loading...</p>
        ) : listings.length > 0 ? (
          <div className="grid-3" style={{ paddingBottom: 40 }}>
            {listings.map(item => (
              <Link key={item.id} href={`/listings/${item.id}`} className="card">
                <div className="listing-card-img">
                  {imgSrc(item.image_url) ? (
                    <img src={imgSrc(item.image_url)} alt={item.title} />
                  ) : '📷'}
                </div>
                <div className="listing-card-body">
                  {/* VULNERABILITY: XSS - title rendered as HTML */}
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
                    <span>{item.seller_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <p>No listings found{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
          </div>
        )}
      </div>

      <footer className="site-footer">
        <p><span>EagleMart</span> · Student Marketplace</p>
      </footer>
    </div>
  );
}
