import React from 'react';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  MapPin,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

function formatDate(isoString) {
  if (!isoString) return { date: 'N/A', time: 'N/A' };
  try {
    const d = new Date(isoString);
    const dateFormatted = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { date: dateFormatted, time: timeFormatted };
  } catch (e) {
    return { date: isoString, time: '' };
  }
}

export default function AppointmentsTable({
  appointments,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onOpenNewModal,
  onStatusChange,
}) {
  if (loading) {
    return (
      <div className="table-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading clinical appointments...</p>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-icon">
            <Calendar size={32} />
          </div>
          <h3>No Appointments Found</h3>
          <p>
            No appointments matched your search or active filter criteria. Try adjusting your
            filters or create a new appointment.
          </p>
          <button className="btn btn-primary" onClick={onOpenNewModal}>
            Schedule First Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div style={{ overflowX: 'auto' }}>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor & Specialty</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Clinical Notes</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const { date, time } = formatDate(appt.appointment_date_time);
              const initials = appt.patient?.name
                ? appt.patient.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'PT';

              return (
                <tr key={appt.id} id={`appointment-row-${appt.id}`}>
                  {/* Patient Info */}
                  <td>
                    <div className="patient-cell">
                      <div className="patient-avatar">{initials}</div>
                      <div>
                        <div className="patient-name">{appt.patient?.name || 'Unknown Patient'}</div>
                        <div className="patient-sub">
                          {appt.patient?.phone || appt.patient?.email || 'No contact'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Doctor Info */}
                  <td>
                    <div className="doctor-cell">
                      <div className="doctor-name">{appt.doctor?.name || 'Assigned Doctor'}</div>
                      <div className="doctor-specialty">
                        <span>{appt.doctor?.specialty || 'General Practice'}</span>
                        {appt.doctor?.room_number && (
                          <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>
                            • {appt.doctor.room_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td>
                    <div className="date-time-cell">
                      <span className="date-text">{date}</span>
                      <span className="time-text">
                        <Clock size={12} />
                        {time} ({appt.duration_minutes || 30} mins)
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    <span className="type-pill">
                      {appt.appointment_type?.name || 'General Consultation'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`status-badge ${appt.status}`}>
                      <span className="status-dot" />
                      {appt.status}
                    </span>
                  </td>

                  {/* Notes */}
                  <td style={{ maxWidth: '240px' }}>
                    <div
                      title={appt.notes}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: appt.notes ? 'var(--text-muted)' : 'var(--text-light)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {appt.notes || '—'}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      {/* Quick Status Selector */}
                      <select
                        className="form-select"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          width: 'auto',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        value={appt.status}
                        onChange={(e) => onStatusChange(appt.id, e.target.value)}
                        title="Quick update status"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {/* Edit Button */}
                      <button
                        className="btn-icon"
                        title="Edit Appointment"
                        onClick={() => onEdit(appt)}
                        id={`btn-edit-appointment-${appt.id}`}
                      >
                        <Edit2 size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        className="btn-icon"
                        title="Delete Appointment"
                        style={{ color: '#ef4444' }}
                        onClick={() => onDelete(appt)}
                        id={`btn-delete-appointment-${appt.id}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.total_pages > 1 && (
        <div className="pagination">
          <span className="pagination-text">
            Showing Page {pagination.page} of {pagination.total_pages} ({pagination.total_count} total records)
          </span>
          <div className="pagination-controls">
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
