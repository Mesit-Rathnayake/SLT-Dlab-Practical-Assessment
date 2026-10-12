import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, User, Stethoscope, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin(roleKey);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 90 }}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h3>Portal Authentication</h3>
            <p>Access role-based clinical or administration workspace</p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick 1-Click Demo Logins */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              ⚡ 1-Click Demo Profiles (For Reviewers)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#cbd5e1' }}
                onClick={() => handleDemo('super_admin')}
                disabled={loading}
              >
                <Crown size={15} color="#d97706" />
                <div>
                  <strong>Super Admin</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Doctor & Hours Mgmt</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#cbd5e1' }}
                onClick={() => handleDemo('admin')}
                disabled={loading}
              >
                <User size={15} color="#0284c7" />
                <div>
                  <strong>General Admin</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hospital Appointments</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#cbd5e1' }}
                onClick={() => handleDemo('doctor')}
                disabled={loading}
              >
                <Stethoscope size={15} color="#0d9488" />
                <div>
                  <strong>Dr. Vance (Active)</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cardiologist Portal</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#fde68a', background: '#fffbeb' }}
                onClick={() => handleDemo('doctor_temp')}
                disabled={loading}
              >
                <Lock size={15} color="#b45309" />
                <div>
                  <strong>Dr. Chen (Temp)</strong>
                  <div style={{ fontSize: '0.65rem', color: '#b45309' }}>Test Password Change</div>
                </div>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>OR ENTER CREDENTIALS</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="input-login-email"
                type="email"
                className="form-input"
                placeholder="e.g. superadmin@medwizard.health"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="input-login-password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
