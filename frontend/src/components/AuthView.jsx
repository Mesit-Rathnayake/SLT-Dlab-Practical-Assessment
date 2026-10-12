import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Crown,
  Stethoscope,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthView({ onBackToHome, onSuccess }) {
  const { login, quickDemoLogin } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick-Fill of Reviewer Credentials into form inputs
  const handleQuickFill = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={onBackToHome}
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Activity size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
            Medical Wizard
          </span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '2rem' }}>
          {/* Card Title */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
              Staff & Clinician Sign In
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Authorized access to hospital clinical operations & patient records
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                color: '#15803d',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Staff Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="auth-input-email"
                  className="form-control"
                  placeholder="name@medwizard.health"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="auth-input-password"
                  className="form-control"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="auth-btn-submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.925rem', borderRadius: '10px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Clinical Workspace'}
            </button>
          </form>

          {/* Quick-Fill Reviewer Reference Box */}
          <div
            style={{
              marginTop: '1.75rem',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '0.65rem',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Reviewer Quick-Fill Credentials</span>
              <span style={{ fontSize: '0.65rem', color: '#0284c7', textTransform: 'none' }}>Click to populate form</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickFill('superadmin@medwizard.health', 'SuperAdmin123!')}
              >
                <Crown size={15} color="#d97706" />
                <div>
                  <strong>Super Admin</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hospital Director</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickFill('admin@medwizard.health', 'Admin123!')}
              >
                <Building size={15} color="#0284c7" />
                <div>
                  <strong>General Admin</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Front Desk & Admissions</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickFill('eleanor.vance@medwizard.health', 'DoctorPass123!')}
              >
                <Stethoscope size={15} color="#0d9488" />
                <div>
                  <strong>Dr. Vance</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>eleanor.vance@...</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickFill('marcus.chen@medwizard.health', 'TempDr2026!')}
              >
                <User size={15} color="#475569" />
                <div>
                  <strong>Dr. Chen (Temp)</strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>marcus.chen@...</div>
                </div>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Patient registrations are handled directly within the General Administration portal using NIC verification.
          </div>
        </div>
      </div>
    </div>
  );
}
