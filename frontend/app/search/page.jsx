'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useState } from 'react';

import { Search, ShoppingCart } from 'lucide-react';

const API = 'http://localhost:5000';

function imgSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API}${url}`;
}

const quickFilters = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Sports'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      // VULNERABILITY: SQL Injection - query is sent directly to backend
      // which constructs raw SQL with string concatenation
      const res = await fetch(`${API}/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.results || data.listings || []);
      } else {
        // VULNERABILITY: Information Disclosure - raw SQL errors shown to user
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      // Fallback to mock data when backend is unavailable
      setResults([]);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Search Hero */}
      <div style={{ background: '#1a1a1a', padding: '40px 0 44px' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            Find what you need
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', marginBottom: 24 }}>
            Search across all listings on campus
          </p>

          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: 0,
            maxWidth: 680,
            margin: '0 auto',
          }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for textbooks, electronics, furniture..."
              style={{
                flex: 1,
                padding: '14px 18px',
                border: '2px solid #ffd046',
                borderRight: 'none',
                borderRadius: '4px 0 0 4px',
                fontSize: '0.95rem',
                background: '#fff',
                minWidth: 0,
              }}
            />
            <button type="submit" className="btn btn-accent" disabled={loading} style={{
              borderRadius: '0 4px 4px 0',
              padding: '14px 28px',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
            }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Quick filter chips */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            {quickFilters.map(f => (
              <button
                key={f}
                onClick={() => doSearch(f.toLowerCase())}
                style={{
                  padding: '5px 14px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  background: 'transparent',
                  color: '#aaa',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#ffd046'; e.target.style.color = '#ffd046'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#444'; e.target.style.color = '#aaa'; }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>

        {/* VULNERABILITY: XSS - Reflecting search query back in the page unsanitized */}
        {searched && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <p
              style={{ color: '#888', fontSize: '0.88rem' }}
              dangerouslySetInnerHTML={{ __html: `Showing results for: <strong style="color:#1a1a1a">${query}</strong>` }}
            />
            {results.length > 0 && (
              <span style={{ color: '#999', fontSize: '0.84rem' }}>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {results.length > 0 ? (
          <div className="grid-3">
            {results.map(item => (
              <Link key={item.id} href={`/listings/${item.id}`} className="card">
                <div className="listing-card-img">
                  {imgSrc(item.image_url) ? (
                    <img src={imgSrc(item.image_url)} alt="" />
                  ) : '📷'}
                </div>
                <div className="listing-card-body">
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
        ) : searched && !loading && !error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Search size={48} strokeWidth={1} color="#ccc" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '1rem', marginBottom: 6, color: '#666' }}>No results found</p>
            <p style={{ fontSize: '0.88rem', color: '#999' }}>Try a different search term or browse by category</p>
          </div>
        ) : !searched ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <ShoppingCart size={48} strokeWidth={1} color="#ddd" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '1rem', color: '#999' }}>Search for items or click a category above</p>
          </div>
        ) : null}
      </div>

      <footer className="site-footer">
        <p><span>EagleMart</span> · Student Marketplace</p>
      </footer>
    </div>
  );
}
