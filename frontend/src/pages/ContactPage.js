import { useState } from 'react';
import { contactService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './ContactPage.css';

export default function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: '',
    contact_type: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await contactService.submit(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="contact-page page-enter">
      <div className="contact-page__header">
        <div className="container">
          <h1 className="display-heading">Get in Touch</h1>
          <p>Have a question or want to list your business? We'd love to hear from you.</p>
        </div>
      </div>

      <div className="container contact-page__body">
        {/* Info cards */}
        <div className="contact-info">
          <div className="contact-info-card">
            <span className="contact-info-card__icon">📍</span>
            <h3>Location</h3>
            <p>Peja (Peć), Kosovo</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-card__icon">✉️</span>
            <h3>Email</h3>
            <p>hello@pejatourism.com</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-card__icon">🕐</span>
            <h3>Response Time</h3>
            <p>Within 24 hours</p>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          {success ? (
            <div className="contact-success">
              <span>🎉</span>
              <h2>Message sent!</h2>
              <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button className="btn btn-primary" onClick={() => setSuccess(false)}>Send another</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send a Message</h2>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input name="name" className="form-input" required
                    value={form.name} onChange={handleChange} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="form-input" required
                    value={form.email} onChange={handleChange} placeholder="you@email.com" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone (optional)</label>
                  <input name="phone" className="form-input"
                    value={form.phone} onChange={handleChange} placeholder="+383 …" />
                </div>
                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <select name="contact_type" className="form-input"
                    value={form.contact_type} onChange={handleChange}>
                    <option value="general">General Inquiry</option>
                    <option value="join_request">Add My Business</option>
                    <option value="listing_inquiry">Listing Question</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea name="message" className="form-input" required minLength={10}
                  value={form.message} onChange={handleChange}
                  placeholder="Tell us more…" rows={5} />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="btn btn-primary contact-submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
