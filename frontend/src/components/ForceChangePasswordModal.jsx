import React, { useState } from 'react';
import { KeyRound, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForceChangePasswordModal({ onPasswordChanged }) {
  const { user, mustChangePassword, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!mustChangePassword) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Please enter your temporary password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      if (onPasswordChanged) onPasswordChanged();
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ background: '#fffbeb', borderBottom: '1px solid #fef3c7' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ color: '#d97706' }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ color: '#92400e' }}>Password Update Required</h3>
              <p style={{ color: '#b45309' }}>First-time login with temporary credentials</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                fontSize: '0.8125rem',
                color: '#1e40af',
                display: 'flex',
                gap: '0.6rem',
              }}
            >
              <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Welcome, <strong>{user?.name || 'Doctor'}</strong>. Your account was registered with a temporary password. For security compliance, please set your permanent clinical password now.
              </div>
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
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Temporary Password *</label>
              <input
                id="input-force-current-password"
                type="password"
                className="form-input"
                placeholder="Enter current temporary password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Secure Password *</label>
              <input
                id="input-force-new-password"
                type="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                id="input-force-confirm-password"
                type="password"
                className="form-input"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              id="btn-submit-force-password"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Updating Password...' : 'Save Password & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
