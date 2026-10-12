import React from 'react';
import {
  Activity,
  Plus,
  Database,
  ShieldCheck,
  Crown,
  Stethoscope,
  Building,
  LogIn,
  LogOut,
  User,
  KeyRound,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  onOpenNewModal,
  onOpenLoginModal,
  activePortal,
  onSelectPortal,
  onNavigateHome,
}) {
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onNavigateHome) onNavigateHome();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={onNavigateHome} style={{ cursor: 'pointer' }} title="Medical Wizard Home">
          <div className="brand-icon-wrap">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>Medical Wizard</h1>
            <p>Clinical Appointment System</p>
          </div>
        </div>

        {/* Role-Based Portal Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-lg)' }}>
          {onNavigateHome && (
            <button
              id="tab-home"
              className="btn"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                background: 'transparent',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={onNavigateHome}
              title="Return to Landing Page"
            >
              <span>← Home</span>
            </button>
          )}

          {!user && (
            <div style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={13} />
              <span>Authorization Required</span>
            </div>
          )}

          {/* General Admin: Visible to SUPER_ADMIN and ADMIN */}
          {user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
            <button
              id="tab-portal-general"
              className="btn"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                background: activePortal === 'ADMIN' ? '#ffffff' : 'transparent',
                color: activePortal === 'ADMIN' ? '#0f172a' : 'var(--text-muted)',
                boxShadow: activePortal === 'ADMIN' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => onSelectPortal('ADMIN')}
            >
              <Building size={14} color="#0284c7" />
              <span>General Admin</span>
            </button>
          )}

          {/* Super Admin: Visible ONLY to SUPER_ADMIN */}
          {user && user.role === 'SUPER_ADMIN' && (
            <button
              id="tab-portal-super"
              className="btn"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                background: activePortal === 'SUPER_ADMIN' ? '#ffffff' : 'transparent',
                color: activePortal === 'SUPER_ADMIN' ? '#0f172a' : 'var(--text-muted)',
                boxShadow: activePortal === 'SUPER_ADMIN' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => onSelectPortal('SUPER_ADMIN')}
            >
              <Crown size={14} color="#d97706" />
              <span>Super Admin</span>
            </button>
          )}

          {/* Doctor Portal: Visible ONLY to DOCTOR */}
          {user && user.role === 'DOCTOR' && (
            <button
              id="tab-portal-doctor"
              className="btn"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                background: activePortal === 'DOCTOR' ? '#ffffff' : 'transparent',
                color: activePortal === 'DOCTOR' ? '#0f172a' : 'var(--text-muted)',
                boxShadow: activePortal === 'DOCTOR' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => onSelectPortal('DOCTOR')}
            >
              <Stethoscope size={14} color="#0d9488" />
              <span>Doctor Portal</span>
            </button>
          )}
        </div>

        {/* Actions & Profile */}
        <div className="navbar-actions">
          {/* Hospital Network Status */}
          <div className="live-badge" title="Hospital Information Network Status">
            <span className="live-pulse" />
            <ShieldCheck size={13} color="#0d9488" />
            <span>System Operational</span>
          </div>

          {/* User Account / Login Status */}
          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#f8fafc',
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: user.role === 'SUPER_ADMIN' ? '#fef3c7' : user.role === 'DOCTOR' ? '#ccfbf1' : '#e0f2fe',
                  color: user.role === 'SUPER_ADMIN' ? '#b45309' : user.role === 'DOCTOR' ? '#0f766e' : '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {user.role === 'SUPER_ADMIN' ? '👑' : user.role === 'DOCTOR' ? '🩺' : '🏥'}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
              <button
                id="btn-nav-logout"
                className="btn-icon"
                title="Sign Out"
                onClick={handleLogout}
                style={{ color: '#ef4444', width: '26px', height: '26px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              id="btn-nav-signin"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
              onClick={onOpenLoginModal}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Quick Action Button in General Admin (Only for authorized admin roles) */}
          {activePortal === 'ADMIN' && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <button
              id="btn-new-appointment-nav"
              className="btn btn-primary"
              onClick={onOpenNewModal}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Appointment</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
