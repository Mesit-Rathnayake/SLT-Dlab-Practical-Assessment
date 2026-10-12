import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
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

export default function AuthView({ initialMode = 'login', onBackToHome, onSuccess }) {
  const { login, signup, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    password: '',
    confirm_password: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError('Name, email, and password are required fields.');
      return;
    }

    if (signupForm.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (signupForm.password !== signupForm.confirm_password) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: signupForm.name,
        email: signupForm.email,
        phone: signupForm.phone,
        date_of_birth: signupForm.date_of_birth,
        gender: signupForm.gender,
        password: signupForm.password,
      });
      setSuccessMsg('Patient account registered successfully! Entering portal...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 1-click Demo Profiles
  const handleDemo = async (roleKey) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await quickDemoLogin(roleKey);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
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
          maxWidth: '520px',
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
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Toggle Switch */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#f8fafc',
            padding: '0.35rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '12px',
              border: 'none',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#0f172a' : 'var(--text-muted)',
              fontWeight: mode === 'login' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '12px',
              border: 'none',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#0f172a' : 'var(--text-muted)',
              fontWeight: mode === 'signup' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Register as Patient
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Card Title */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Patient Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {mode === 'login'
                ? 'Sign in to access your appointments and clinical portal'
                : 'Register your details to schedule and manage doctor appointments'}
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

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <div>
              {/* 1-Click Reviewer Access Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
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
                  }}
                >
                  ⚡ Reviewer Demo Profiles (1-Click Instant Login)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start' }}
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
                    style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start' }}
                    onClick={() => handleDemo('admin')}
                    disabled={loading}
                  >
                    <Building size={15} color="#0284c7" />
                    <div>
                      <strong>General Admin</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hospital Appointments</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start' }}
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
                    style={{ fontSize: '0.75rem', padding: '0.55rem', justifyContent: 'flex-start' }}
                    onClick={() => handleDemo('doctor_temp')}
                    disabled={loading}
                  >
                    <ShieldCheck size={15} color="#dc2626" />
                    <div>
                      <strong>Dr. Chen (Temp)</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tests Enforced Reset</div>
                    </div>
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  margin: '1.25rem 0',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  OR ENTER CREDENTIALS
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="admin@medwizard.health"
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
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '0.925rem', borderRadius: '10px' }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* MODE 2: SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Full Legal Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Kasun Fernando"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <User
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

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="kasun.f@example.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+94 77 123 4567"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      style={{ paddingLeft: '2.25rem' }}
                    />
                    <Phone
                      size={14}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={signupForm.gender}
                    onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Date of Birth</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="form-control"
                    value={signupForm.date_of_birth}
                    onChange={(e) => setSignupForm({ ...signupForm, date_of_birth: e.target.value })}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                  <Calendar
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Account Password (min. 8 characters) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
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
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
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
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={signupForm.confirm_password}
                    onChange={(e) => setSignupForm({ ...signupForm, confirm_password: e.target.value })}
                    style={{ paddingLeft: '2.5rem' }}
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
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.925rem', borderRadius: '10px' }}
                disabled={loading}
              >
                {loading ? 'Registering Patient Account...' : 'Complete Patient Registration'}
              </button>
            </form>
          )}

          {/* Footer Toggle Text */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <span>
                New patient?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Create an account here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Sign in to your account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
