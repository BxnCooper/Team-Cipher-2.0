'use client';

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { Mail, Calendar, Shield, Plus } from 'lucide-react';

const API = 'http://localhost:5000';

function imgSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API}${url}`;
}

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwn, setIsOwn] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfile(null);
        setListings([]);
        setLoading(false);
        return;
      }

      try {
        // SECURE: Send authentication token with request
        const res = await fetch(`${API}/api/profile/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401) {
          // Token invalid, redirect to login
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (res.status === 403) {
          setProfile(null);
          setListings([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProfile(data.user || data);
        setListings(data.listings || []);
      } catch (err) {
        setProfile(null);
        setListings([]);
      }
      setLoading(false);
    };

    fetchProfile();

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    setIsOwn(currentUser?.id == id);
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>Loading...</div>
        <footer className="site-footer"><p><span>EagleMart</span> · Student Marketplace</p></footer>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="container empty-state" style={{ paddingTop: 60 }}>
          <h2 style={{ color: '#555' }}>User not found</h2>
        </div>
        <footer className="site-footer"><p><span>EagleMart</span> · Student Marketplace</p></footer>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '32px 28px', marginBottom: 28 }}>
          <div className="profile-card">
            <div className="profile-avatar" style={{ width: 72, height: 72, fontSize: '1.7rem' }}>
              {profile.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
                {profile.username}
              </h1>
              {/* VULNERABILITY: Information Disclosure - showing email publicly */}
              <p style={{ color: '#888', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} /> {profile.email}
              </p>
              <p style={{ color: '#aaa', fontSize: '0.82rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> Member since {profile.created_at || 'Unknown'}
              </p>
            </div>
          </div>

          {isOwn && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #eee' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} /> Account Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 20px', fontSize: '0.88rem', color: '#666' }}>
                <div>
                  <span style={{ color: '#aaa', fontSize: '0.78rem', display: 'block' }}>User ID</span>
                  {profile.id}
                </div>
                <div>
                  <span style={{ color: '#aaa', fontSize: '0.78rem', display: 'block' }}>Email</span>
                  {profile.email}
                </div>
                {/* VULNERABILITY: Sensitive Data Exposure - displaying role/admin status */}
                {profile.role && (
                  <div>
                    <span style={{ color: '#aaa', fontSize: '0.78rem', display: 'block' }}>Role</span>
                    <span style={{ color: profile.role === 'admin' ? '#b8860b' : '#666' }}>{profile.role}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User's listings */}
        <div className="section-header">
          <h2>{isOwn ? 'Your Listings' : `${profile.username}'s Listings`}</h2>
          {isOwn && (
            <Link href="/create-listing" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem', color: '#1a1a1a', fontWeight: 600 }}>
              <Plus size={16} /> New Listing
            </Link>
          )}
        </div>

        {listings.length > 0 ? (
          <div className="grid-3">
            {listings.map(item => (
              <Link key={item.id} href={`/listings/${item.id}`} className="card">
                <div className="listing-card-img" style={{ height: 150 }}>
                  {imgSrc(item.image_url) ? (
                    <img src={imgSrc(item.image_url)} alt={item.title} />
                  ) : '📷'}
                </div>
                <div className="listing-card-body">
                  <h3 className="listing-card-title">{item.title}</h3>
                  <p className="listing-card-price">${item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <p>No listings yet.</p>
            {isOwn && (
              <Link href="/create-listing" className="btn btn-accent" style={{ marginTop: 8 }}>
                Create your first listing
              </Link>
            )}
          </div>
        )}
      </div>

      <footer className="site-footer">
        <p><span>EagleMart</span> · Student Marketplace</p>
      </footer>
    </div>
  );
}
