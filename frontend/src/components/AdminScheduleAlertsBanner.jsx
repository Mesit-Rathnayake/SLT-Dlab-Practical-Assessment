import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function AdminScheduleAlertsBanner({ alerts, onAcknowledge }) {
  if (!alerts || alerts.length === 0) return null;

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  if (activeAlerts.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div
              style={{
                background: '#ffe4e6',
                color: '#e11d48',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ color: '#9f1239', fontSize: '0.9375rem' }}>
                  Notice: Sudden Schedule Change reported by {alert.doctor_name || 'Clinician'}
                </strong>
                <span
                  style={{
                    background: '#f43f5e',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {alert.change_type}
                </span>
              </div>
              <p style={{ color: '#881337', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                Effective Date: <strong>{alert.effective_date}</strong>{' '}
                {alert.start_time && alert.end_time ? `(${alert.start_time} - ${alert.end_time})` : ''} •{' '}
                {alert.reason}
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              borderColor: '#fca5a5',
              color: '#9f1239',
              background: '#ffffff',
            }}
            onClick={() => onAcknowledge(alert.id)}
            title="Mark alert as acknowledged by administration"
          >
            <CheckCircle size={14} />
            <span>Acknowledge Notice</span>
          </button>
        </div>
      ))}
    </div>
  );
}
