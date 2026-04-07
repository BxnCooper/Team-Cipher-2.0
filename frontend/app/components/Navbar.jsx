'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // VULNERABILITY: Session Management - reading auth from localStorage
    // Token and user data stored client-side, easily tamperable
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch(e) {}
    }
    setLoaded(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="navbar-brand">
          <img src="/logo.svg" alt="EagleMart" />
          <span className="navbar-logo">Eagle<span>Mart</span></span>
        </Link>
        {loaded && (
          <ul className="navbar-links">
            <li><Link href="/listings">Browse</Link></li>
            <li><Link href="/search">Search</Link></li>
            {user ? (
              <>
                <li><Link href="/create-listing">Sell Item</Link></li>
                <li><Link href={`/profile/${user.id}`}>Profile</Link></li>
                <li><a onClick={handleLogout} style={{cursor:'pointer'}}>Logout</a></li>
              </>
            ) : (
              <>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/register" className="btn-sm">Sign Up</Link></li>
              </>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
