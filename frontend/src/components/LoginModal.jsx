import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, User, Stethoscope, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
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

  const handleQuickFill = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 90 }}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h3>Staff & Clinician Sign In</h3>
            <p>Access role-based clinical workspace and administration</p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
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
                marginBottom: '1rem',
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
                className="form-control"
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
                className="form-control"
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
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>

          {/* Quick-Fill Helper for Reviewers */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between' }}>
              <span>Reviewer Quick-Fill</span>
              <span style={{ textTransform: 'none', color: '#0284c7' }}>Populates email & password</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#cbd5e1' }}
                onClick={() => handleQuickFill('superadmin@medwizard.health', 'SuperAdmin123!')}
              >
                <Crown size={14} color="#d97706" />
                <div>
                  <strong>Super Admin</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Full system oversight</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#cbd5e1' }}
                onClick={() => handleQuickFill('admin@medwizard.health', 'Admin123!')}
              >
                <User size={14} color="#0284c7" />
                <div>
                  <strong>General Admin</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Appointments & Patients</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#cbd5e1' }}
                onClick={() => handleQuickFill('eleanor.vance@medwizard.health', 'DoctorPass123!')}
              >
                <Stethoscope size={14} color="#0d9488" />
                <div>
                  <strong>Dr. Vance</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cardiologist Portal</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', justifyContent: 'flex-start', textAlign: 'left', borderColor: '#fde68a', background: '#fffbeb' }}
                onClick={() => handleQuickFill('marcus.chen@medwizard.health', 'TempDr2026!')}
              >
                <Lock size={14} color="#b45309" />
                <div>
                  <strong>Dr. Chen (Temp)</strong>
                  <div style={{ fontSize: '0.65rem', color: '#b45309' }}>Password change test</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
