'use client';

import Navbar from '../components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';

const API = 'http://localhost:5001';

export default function CreateListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'other',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      setError('You must be logged in to create a listing');
      setLoading(false);
      return;
    }

    try {
      // VULNERABILITY: File Upload - no client-side file type validation
      // Any file type can be uploaded (backend should also be vulnerable)
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('seller_id', user.id);
      if (file) {
        formData.append('image', file);
      }

      // SECURE: Send authentication token with request
      const res = await fetch(`${API}/api/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/listings/${data.id || data.listing?.id}`);
      } else {
        setError(data.error || 'Failed to create listing');
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
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 24px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: 540 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
              Create Listing
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Sell an item to fellow students</p>
          </div>

          <div className="card" style={{ padding: '32px 28px' }}>
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="What are you selling?"
                  required
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange} style={{ padding: '12px 14px', fontSize: '0.95rem' }}>
                    <option value="textbooks">Textbooks</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="clothing">Clothing</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your item, condition, etc."
                  required
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                />
                <small style={{ color: '#aaa', fontSize: '0.8rem' }}>
                  HTML formatting is supported
                </small>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImagePlus size={14} /> Photo
                </label>
                {/* VULNERABILITY: File Upload - accepts all file types, no validation */}
                <input
                  type="file"
                  onChange={e => setFile(e.target.files[0])}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-accent"
                disabled={loading}
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 8 }}
              >
                {loading ? 'Posting...' : 'Post Listing'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <p><span>EagleMart</span> · Student Marketplace</p>
      </footer>
    </div>
  );
}
