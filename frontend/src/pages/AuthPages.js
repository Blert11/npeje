import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Icon from '../components/common/Icon';
import './AuthPages.css';

export function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const redirectTo   = location.state?.from || '/';
  const [form,   setForm]   = useState({ email: '', password: '' });
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form);
      if (user.role === 'admin')    navigate('/admin');
      else if (user.role === 'business') navigate('/business');
      else navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Link to="/" className="auth-logo">
            <span>P</span>eja Tourism
          </Link>
          <h1>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@email.com" />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Password</label>
              <button type="button" className="auth-forgot-link"
                onClick={() => setShowForgot(true)}>
                Forgot password?
              </button>
            </div>
            <input type="password" className="form-input" required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Join free</Link>
        </p>
      </div>

      {showForgot && (
        <ForgotPasswordModal
          onClose={() => setShowForgot(false)}
          initialEmail={form.email}
        />
      )}
    </div>
  );
}

function ForgotPasswordModal({ onClose, initialEmail }) {
  const [email, setEmail]     = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState('');
  const [err, setErr]         = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return setErr('Enter your email');
    setLoading(true); setErr(''); setResult('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      const tempPass = data.data?.temp_password;
      if (tempPass) {
        setResult(`Your temporary password is: ${tempPass}\n\nUse it to log in, then change it in your account settings.`);
      } else {
        setResult(data.message || 'If an account exists, reset instructions have been sent.');
      }
    } catch (e) {
      setErr(e.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18 }}>Reset password</h3>
          <button onClick={onClose} type="button" style={{
            width: 28, height: 28, borderRadius: '50%', background: 'var(--gray-100)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="close" size={16} />
          </button>
        </div>

        {!result ? (
          <form onSubmit={submit}>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 14 }}>
              Enter your email and we'll generate a temporary password for you.
            </p>
            <div className="form-group">
              <input type="email" className="form-input" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" autoFocus />
            </div>
            {err && <div className="auth-error">{err}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%' }}>
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        ) : (
          <div>
            <div className="ua__success" style={{ whiteSpace: 'pre-wrap', marginBottom: 14 }}>
              {result}
            </div>
            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form,   setForm]   = useState({ name: '', email: '', password: '' });
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Link to="/" className="auth-logo"><span>P</span>eja Tourism</Link>
          <h1>Create account</h1>
          <p>Join the Peja community for free</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" required minLength={8}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min. 8 characters" />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
