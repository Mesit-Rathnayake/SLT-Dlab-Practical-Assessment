import React from 'react';
import {
  Activity,
  Plus,
  Database,
  Crown,
  Stethoscope,
  Building,
  LogIn,
  LogOut,
  User,
  KeyRound
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

        {/* Portal Switcher Tabs */}
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
        </div>

        {/* Actions & Profile */}
        <div className="navbar-actions">
          {/* PostgreSQL Status */}
          <div className="live-badge" title="Neon Serverless Cloud PostgreSQL Active">
            <span className="live-pulse" />
            <Database size={13} />
            <span>Neon Cloud Active</span>
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
                className="btn-icon"
                title="Switch Profile / Logout"
                onClick={logout}
                style={{ color: '#ef4444', width: '26px', height: '26px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              id="btn-nav-login"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
              onClick={onOpenLoginModal}
            >
              <LogIn size={15} />
              <span>Switch Profile</span>
            </button>
          )}

          {/* Quick Action Button in General Admin */}
          {activePortal === 'ADMIN' && (
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
