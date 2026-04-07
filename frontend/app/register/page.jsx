'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useState } from 'react';

const API = 'http://localhost:5000';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // VULNERABILITY: No CSRF protection
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || '');
        window.location.href = '/';
      } else {
        setError(data.error || data.message || 'Registration failed');
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
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.svg" alt="EagleMart" style={{ height: 48, margin: '0 auto 16px' }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
              Create your account
            </h1>
            <p style={{ color: '#888', fontSize: '0.95rem' }}>
              Join EagleMart and start trading on campus
            </p>
          </div>

          <div className="card" style={{ padding: '36px 32px' }}>
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
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
                {loading ? 'Creating account...' : 'Create Account'}
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
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#1a1a1a', fontWeight: 700 }}>Sign in</Link>
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
