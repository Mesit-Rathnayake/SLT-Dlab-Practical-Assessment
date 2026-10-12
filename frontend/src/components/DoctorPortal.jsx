import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  CheckCheck,
  FileText,
  Save,
  Send,
  Stethoscope,
  Building,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' },
];

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

export default function DoctorPortal({ onAddToast }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'schedule'

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Schedule
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Sudden Change Modal
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertData, setAlertData] = useState({
    change_type: 'EMERGENCY_LEAVE',
    effective_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '13:00',
    reason: '',
  });
  const [submittingAlert, setSubmittingAlert] = useState(false);

  useEffect(() => {
    loadMyAppointments();
  }, [filterStatus]);

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadMySchedule();
    }
  }, [activeTab]);

  const loadMyAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await api.getDoctorMyAppointments({ status: filterStatus });
      setAppointments(res.appointments || []);
    } catch (err) {
      onAddToast('Failed to load doctor appointments', 'error');
    } finally {
      setLoadingAppts(false);
    }
  };

  const loadMySchedule = async () => {
    setLoadingSchedule(true);
    try {
      const data = await api.getDoctorMySchedule();
      const scheduleMap = {};
      (data || []).forEach((s) => {
        scheduleMap[s.day_of_week] = s;
      });

      const fullDays = DAYS_OF_WEEK.map((d) => {
        if (scheduleMap[d.id]) {
          return { ...scheduleMap[d.id] };
        }
        return {
          day_of_week: d.id,
          start_time: '09:00',
          end_time: '17:00',
          is_available: d.id <= 5,
          slot_duration_minutes: 30,
        };
      });
      setSchedules(fullDays);
    } catch (err) {
      onAddToast('Failed to load schedule', 'error');
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.updateAppointment(appointmentId, { status: newStatus });
      onAddToast(`Appointment updated to ${newStatus}`, 'success');
      loadMyAppointments();
    } catch (err) {
      onAddToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleScheduleChange = (dayOfWeek, field, value) => {
    setSchedules((prev) =>
      prev.map((s) => (s.day_of_week === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      for (const s of schedules) {
        await api.updateDoctorMySchedule(s);
      }
      onAddToast('Your working hours and days updated successfully!', 'success');
    } catch (err) {
      onAddToast(err.message || 'Failed to save schedule', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSubmitSuddenAlert = async (e) => {
    e.preventDefault();
    if (!alertData.reason.trim()) {
      onAddToast('Please provide a reason for the sudden change', 'error');
      return;
    }

    setSubmittingAlert(true);
    try {
      await api.reportDoctorScheduleChange(alertData);
      onAddToast('Notice broadcasted to hospital administration immediately!', 'success');
      setIsAlertModalOpen(false);
      setAlertData({
        change_type: 'EMERGENCY_LEAVE',
        effective_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '13:00',
        reason: '',
      });
    } catch (err) {
      onAddToast(err.message || 'Failed to broadcast change notice', 'error');
    } finally {
      setSubmittingAlert(false);
    }
  };

  const totalAppts = appointments.length;
  const scheduledCount = appointments.filter((a) => a.status === 'Scheduled').length;
  const inProgressCount = appointments.filter((a) => a.status === 'In-Progress').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <div>
      {/* Doctor Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(13, 148, 136, 0.2)',
              border: '1px solid rgba(13, 148, 136, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2dd4bf',
            }}
          >
            <Stethoscope size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {user?.doctor?.name || user?.name || 'Doctor Workspace'}
              </h2>
              <span
                style={{
                  background: '#0d9488',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {user?.doctor?.specialty || 'Consultant'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.8125rem',
                color: '#94a3b8',
                marginTop: '0.4rem',
                flexWrap: 'wrap',
              }}
            >
              <span>
                SLMC Reg No: <strong style={{ color: '#e2e8f0' }}>{user?.doctor?.slmc_reg_no || 'Verified'}</strong>
              </span>
              <span>•</span>
              <span>
                Room: <strong style={{ color: '#e2e8f0' }}>{user?.doctor?.room_number || 'Room 101'}</strong>
              </span>
              <span>•</span>
              <span style={{ color: '#34d399' }}>● On Active Duty</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            id="btn-report-sudden-change"
            className="btn"
            style={{ background: '#f43f5e', color: '#ffffff' }}
            onClick={() => setIsAlertModalOpen(true)}
          >
            <AlertTriangle size={16} />
            <span>Report Sudden Leave / Notice</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('appointments')}
        >
          <Calendar size={17} />
          <span>My Scheduled Consultations</span>
        </button>

        <button
          className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('schedule')}
        >
          <Clock size={17} />
          <span>My Working Hours & Availability</span>
        </button>
      </div>

      {/* TAB 1: MY APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div>
          {/* Quick Doctor KPIs */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card" onClick={() => setFilterStatus('all')} style={{ cursor: 'pointer' }}>
              <div className="stat-info">
                <p>All My Visits</p>
                <h2>{totalAppts}</h2>
              </div>
              <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Calendar size={20} />
              </div>
            </div>

            <div className="stat-card" onClick={() => setFilterStatus('Scheduled')} style={{ cursor: 'pointer' }}>
              <div className="stat-info">
                <p>Waiting / Scheduled</p>
                <h2>{scheduledCount}</h2>
              </div>
              <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Clock size={20} />
              </div>
            </div>

            <div className="stat-card" onClick={() => setFilterStatus('In-Progress')} style={{ cursor: 'pointer' }}>
              <div className="stat-info">
                <p>In Consultation</p>
                <h2>{inProgressCount}</h2>
              </div>
              <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <PlayCircle size={20} />
              </div>
            </div>

            <div className="stat-card" onClick={() => setFilterStatus('Completed')} style={{ cursor: 'pointer' }}>
              <div className="stat-info">
                <p>Completed Visits</p>
                <h2>{completedCount}</h2>
              </div>
              <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {loadingAppts ? (
            <div className="table-container" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading clinical roster...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="table-container">
              <div className="empty-state">
                <Calendar size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <h3>No Appointments Scheduled</h3>
                <p>You have no appointments matching this status at this moment.</p>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient Details</th>
                    <th>Date & Time</th>
                    <th>Visit Type</th>
                    <th>Status</th>
                    <th>Clinical Notes / Reason</th>
                    <th style={{ textAlign: 'right' }}>Consultation Actions</th>
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
                      <tr key={appt.id}>
                        <td>
                          <div className="patient-cell">
                            <div className="patient-avatar">{initials}</div>
                            <div>
                              <div className="patient-name">{appt.patient?.name}</div>
                              <div className="patient-sub">{appt.patient?.phone || appt.patient?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="date-time-cell">
                            <span className="date-text">{date}</span>
                            <span className="time-text">
                              <Clock size={12} />
                              {time} ({appt.duration_minutes || 30} mins)
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="type-pill">{appt.appointment_type?.name}</span>
                        </td>

                        <td>
                          <span className={`status-badge ${appt.status}`}>
                            <span className="status-dot" />
                            {appt.status}
                          </span>
                        </td>

                        <td style={{ maxWidth: '220px' }}>
                          <span style={{ fontSize: '0.8125rem', color: appt.notes ? 'var(--text-main)' : 'var(--text-light)' }}>
                            {appt.notes || '—'}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            {appt.status === 'Scheduled' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#d97706', borderColor: '#fde68a' }}
                                onClick={() => handleUpdateStatus(appt.id, 'In-Progress')}
                              >
                                <PlayCircle size={14} /> Start Consultation
                              </button>
                            )}

                            {appt.status === 'In-Progress' && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                              >
                                <CheckCheck size={14} /> Mark Completed
                              </button>
                            )}

                            {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}
                                onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SCHEDULE */}
      {activeTab === 'schedule' && (
        <div>
          <div className="section-header">
            <div>
              <h3>Adjust Weekly Working Hours & Duty Days</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Updates to your duty schedule are instantly synchronized with hospital administration for slot booking.
              </p>
            </div>
            <button
              id="btn-doctor-save-schedule"
              className="btn btn-primary"
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
            >
              <Save size={16} />
              <span>{savingSchedule ? 'Saving...' : 'Save My Schedule'}</span>
            </button>
          </div>

          {loadingSchedule ? (
            <div className="table-container" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading your schedule...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Day of the Week</th>
                    <th>Duty Availability</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Default Slot Length</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => {
                    const day = DAYS_OF_WEEK.find((d) => d.id === s.day_of_week);
                    return (
                      <tr key={s.day_of_week}>
                        <td>
                          <strong>{day?.name}</strong>
                        </td>
                        <td>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={s.is_available}
                              onChange={(e) => handleScheduleChange(s.day_of_week, 'is_available', e.target.checked)}
                            />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: s.is_available ? '#047857' : '#64748b' }}>
                              {s.is_available ? 'Available / In Clinic' : 'Off Duty'}
                            </span>
                          </label>
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-input"
                            style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                            disabled={!s.is_available}
                            value={s.start_time || '09:00'}
                            onChange={(e) => handleScheduleChange(s.day_of_week, 'start_time', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-input"
                            style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                            disabled={!s.is_available}
                            value={s.end_time || '17:00'}
                            onChange={(e) => handleScheduleChange(s.day_of_week, 'end_time', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                            disabled={!s.is_available}
                            value={s.slot_duration_minutes || 30}
                            onChange={(e) => handleScheduleChange(s.day_of_week, 'slot_duration_minutes', Number(e.target.value))}
                          >
                            <option value={15}>15 mins</option>
                            <option value={20}>20 mins</option>
                            <option value={30}>30 mins</option>
                            <option value={45}>45 mins</option>
                            <option value={60}>60 mins</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUDDEN SCHEDULE CHANGE / LEAVE REPORT MODAL */}
      {isAlertModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAlertModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#fff1f2', borderBottom: '1px solid #ffe4e6' }}>
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ color: '#e11d48' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ color: '#9f1239' }}>Report Sudden Leave or Adjusted Hours</h3>
                  <p style={{ color: '#be123c' }}>Instantly broadcasted to hospital administration</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setIsAlertModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSuddenAlert}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Notice Type *</label>
                  <select
                    className="form-select"
                    value={alertData.change_type}
                    onChange={(e) => setAlertData({ ...alertData, change_type: e.target.value })}
                  >
                    <option value="EMERGENCY_LEAVE">Emergency Medical / Personal Leave</option>
                    <option value="HOURS_ADJUSTMENT">Temporary Hours Adjustment (Late start / Early close)</option>
                    <option value="TEMPORARY_UNAVAILABLE">Hospital Committee / Surgery Duty</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Effective Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={alertData.effective_date}
                      onChange={(e) => setAlertData({ ...alertData, effective_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Impacted Hours</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="time"
                        className="form-input"
                        value={alertData.start_time}
                        onChange={(e) => setAlertData({ ...alertData, start_time: e.target.value })}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        className="form-input"
                        value={alertData.end_time}
                        onChange={(e) => setAlertData({ ...alertData, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Explanation for Administration *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide details regarding your emergency leave, conference duty, or delayed clinic start so administration can notify patients..."
                    value={alertData.reason}
                    onChange={(e) => setAlertData({ ...alertData, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAlertModalOpen(false)}
                  disabled={submittingAlert}
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-sudden-alert"
                  type="submit"
                  className="btn"
                  style={{ background: '#e11d48', color: '#ffffff' }}
                  disabled={submittingAlert}
                >
                  <Send size={15} />
                  <span>{submittingAlert ? 'Broadcasting...' : 'Broadcast Notice to Administration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
