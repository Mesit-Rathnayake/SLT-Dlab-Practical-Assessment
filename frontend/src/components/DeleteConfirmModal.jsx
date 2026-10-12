import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, appointment, onClose, onConfirm, deleting }) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
            <h3>Cancel / Delete Appointment</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#334155', fontSize: '0.875rem' }}>
            Are you sure you want to permanently delete the appointment for{' '}
            <strong>{appointment.patient?.name || 'this patient'}</strong> with{' '}
            <strong>{appointment.doctor?.name || 'the clinician'}</strong>?
          </p>
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              fontSize: '0.8125rem',
              color: '#991b1b',
            }}
          >
            This action removes the appointment record from the database.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={deleting}>
            Keep Appointment
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(appointment.id)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
