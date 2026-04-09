'use client';

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { ArrowLeft, Send, User, CalendarDays } from 'lucide-react';

const API = 'http://localhost:5001';

function imgSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API}${url}`;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/listings/${id}`)
      .then(res => res.json())
      .then(data => {
        setListing(data.listing || data);
        setLoading(false);
      })
      .catch(() => {
        setListing(null);
        setLoading(false);
      });
  }, [id]);

  const handleContact = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // SECURE: Send authentication token with request
    await fetch(`${API}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        listing_id: id,
        sender_id: user?.id,
        message: message,
      }),
    });

    setMessageSent(true);
    setMessage('');
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
          Loading...
        </div>
        <footer className="site-footer"><p><span>EagleMart</span> · Student Marketplace</p></footer>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="container empty-state" style={{ paddingTop: 60 }}>
          <h2 style={{ color: '#555', marginBottom: 16 }}>Listing not found</h2>
          <Link href="/listings" className="btn btn-accent">Back to Listings</Link>
        </div>
        <footer className="site-footer"><p><span>EagleMart</span> · Student Marketplace</p></footer>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        <Link href="/listings" style={{
          color: '#1a1a1a',
          fontSize: '0.88rem',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <ArrowLeft size={16} /> Back to listings
        </Link>

        <div className="detail-grid">
          {/* Image */}
          <div className="detail-image">
            {imgSrc(listing.image_url) ? (
              <img src={imgSrc(listing.image_url)} alt={listing.title} />
            ) : '📷'}
          </div>

          {/* Details */}
          <div>
            <span className="badge badge-gray" style={{ marginBottom: 12, display: 'inline-block' }}>
              {listing.category}
            </span>

            {/* VULNERABILITY: XSS - title rendered as raw HTML */}
            <h1
              style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}
              dangerouslySetInnerHTML={{ __html: listing.title }}
            />

            <p className="detail-price">${listing.price}</p>

            {/* VULNERABILITY: XSS - description rendered as raw HTML */}
            <div
              className="detail-description"
              dangerouslySetInnerHTML={{ __html: listing.description }}
            />

            <div className="detail-meta">
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} />
                Seller: <Link href={`/profile/${listing.seller_id}`}>
                  {listing.seller_name || `User #${listing.seller_id}`}
                </Link>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#aaa', marginTop: 6 }}>
                <CalendarDays size={14} />
                Listed: {listing.created_at || 'Recently'}
              </p>
            </div>

            {/* Contact form — no border-top to avoid nested gold borders */}
            <div style={{
              background: '#fafafa',
              border: '1px solid #eee',
              borderRadius: 4,
              padding: 20,
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, color: '#333', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Send size={16} /> Contact Seller
              </h3>
              {messageSent ? (
                <div className="alert alert-success">Message sent!</div>
              ) : (
                <form onSubmit={handleContact}>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Hi, is this still available?"
                      required
                      style={{ minHeight: 80, padding: '12px 14px' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <p><span>EagleMart</span> · Student Marketplace</p>
      </footer>
    </div>
  );
}
