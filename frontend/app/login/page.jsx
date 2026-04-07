'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useState } from 'react';


const API = 'http://localhost:5000';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // VULNERABILITY: No CSRF token sent with request
      // VULNERABILITY: Credentials sent to backend which uses raw SQL (SQL Injection)
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // VULNERABILITY: Session Management - storing sensitive data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || '');
        window.location.href = '/';
      } else {
        // VULNERABILITY: Information Disclosure - showing backend error messages directly
        setError(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    }

    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.svg" alt="EagleMart" style={{ height: 48, margin: '0 auto 16px' }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ color: '#888', fontSize: '0.95rem' }}>
              Sign in to your EagleMart account
            </p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: '36px 32px' }}>
            {error && <div className="alert alert-error">{error}</div>}

            {/* VULNERABILITY: No CSRF token in form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-accent"
                disabled={loading}
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 8 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #eee',
              fontSize: '0.9rem',
              color: '#888',
            }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: '#1a1a1a', fontWeight: 700 }}>Create one</Link>
            </div>
          </div>
        </div>
      </div>

      {/* VULNERABILITY: Sensitive Data Exposure - debug info in HTML comment */}
      <div dangerouslySetInnerHTML={{ __html: '<!-- Debug: API endpoint = http://localhost:5000/api/login, Default credentials: admin/admin123 -->' }} />

      <footer className="site-footer">
        <p><span>EagleMart</span> · Student Marketplace</p>
      </footer>
    </div>
  );
}
