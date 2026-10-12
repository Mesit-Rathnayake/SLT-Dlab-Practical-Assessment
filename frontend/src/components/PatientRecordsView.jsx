import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Calendar,
  Clock,
  Stethoscope,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  X,
  History,
  CheckCircle2,
  AlertCircle,
  Eye,
  CalendarPlus
} from 'lucide-react';
import { api } from '../services/api';

export default function PatientRecordsView({ onScheduleForPatient, onAddToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // History modal state
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // New patient modal state
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    nic: '',
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
  });
  const [newPatientError, setNewPatientError] = useState('');
  const [newPatientSubmitting, setNewPatientSubmitting] = useState(false);

  // Load all patients
  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.getPatients(query);
      setPatients(data || []);
    } catch (err) {
      if (onAddToast) onAddToast('Failed to load patient records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(searchTerm);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchPatients(val);
  };

  // Open history modal for a patient
  const handleOpenHistory = async (patient) => {
    setHistoryLoading(true);
    setSelectedPatientHistory({ patient, appointments: [] });
    try {
      const res = await api.getPatientHistory(patient.id);
      setSelectedPatientHistory(res);
    } catch (err) {
      if (onAddToast) onAddToast('Failed to fetch patient history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle new patient registration by staff
  const handleCreatePatientSubmit = async (e) => {
    e.preventDefault();
    setNewPatientError('');

    if (!newPatientForm.nic.trim()) {
      setNewPatientError('NIC number is required as the unique identifier.');
      return;
    }

    if (!newPatientForm.name.trim()) {
      setNewPatientError('Full Legal Name is required.');
      return;
    }

    setNewPatientSubmitting(true);
    try {
      await api.createPatient({
        nic: newPatientForm.nic.trim(),
        name: newPatientForm.name.trim(),
        email: newPatientForm.email.trim(),
        phone: newPatientForm.phone.trim() || 'Not provided',
        date_of_birth: newPatientForm.date_of_birth || null,
        gender: newPatientForm.gender,
      });

      if (onAddToast) onAddToast(`Patient "${newPatientForm.name}" registered successfully!`, 'success');
      setIsNewPatientModalOpen(false);
      setNewPatientForm({
        nic: '',
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'Male',
      });
      fetchPatients(searchTerm);
    } catch (err) {
      setNewPatientError(err.message || 'Failed to register patient');
    } finally {
      setNewPatientSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Top Controls Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Patient Registry & Medical Consultation History
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Comprehensive records indexed by National Identity Card (NIC) with previous consultation logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by NIC, Name, or Phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
            />
            <Search
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

          <button
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            onClick={() => setIsNewPatientModalOpen(true)}
          >
            <Plus size={16} />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Records Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No patient records found matching your search.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>NIC Number</th>
                <th>Patient Details</th>
                <th>Contact Info</th>
                <th>Gender / DOB</th>
                <th>Registration Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <ShieldCheck size={13} color="#0d9488" />
                      {p.nic || 'Not Recorded'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: #{p.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={12} color="var(--text-muted)" />
                        <span>{p.phone || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                        <Mail size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {p.gender || 'Unspecified'}
                      </span>
                      {p.date_of_birth && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          DOB: {p.date_of_birth}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        onClick={() => handleOpenHistory(p)}
                        title="View consultation history"
                      >
                        <History size={14} color="#0d9488" />
                        <span>History</span>
                      </button>

                      {onScheduleForPatient && (
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                          onClick={() => onScheduleForPatient(p)}
                          title="Schedule new appointment for this patient"
                        >
                          <CalendarPlus size={14} color="#0284c7" />
                          <span>Book</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL 1: PATIENT MEDICAL & APPOINTMENT HISTORY */}
      {selectedPatientHistory && (
        <div className="modal-overlay" onClick={() => setSelectedPatientHistory(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '680px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={20} color="#0d9488" />
                  <h3>Patient Medical Consultation History</h3>
                </div>
                <p>
                  Record for <strong>{selectedPatientHistory.patient.name}</strong> • NIC:{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {selectedPatientHistory.patient.nic || 'Unspecified'}
                  </span>
                </p>
              </div>
              <button
                className="btn-icon"
                onClick={() => setSelectedPatientHistory(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Patient Profile Summary Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    National ID (NIC)
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                    {selectedPatientHistory.patient.nic || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Phone Contact
                  </span>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {selectedPatientHistory.patient.phone || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Gender / DOB
                  </span>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {selectedPatientHistory.patient.gender} • {selectedPatientHistory.patient.date_of_birth || 'N/A'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Total Visits
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0d9488' }}>
                    {selectedPatientHistory.appointments ? selectedPatientHistory.appointments.length : 0} Appointments
                  </div>
                </div>
              </div>

              {/* Consultation History Records */}
              <div style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  Chronological Appointment Records
                </h4>

                {historyLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Fetching records...
                  </div>
                ) : !selectedPatientHistory.appointments || selectedPatientHistory.appointments.length === 0 ? (
                  <div
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px dashed var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    No previous appointments found for this patient.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedPatientHistory.appointments.map((appt) => (
                      <div
                        key={appt.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '0.9rem',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.4rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={15} color="#0284c7" />
                            <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                              {appt.appointment_date_time
                                ? new Date(appt.appointment_date_time).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })
                                : '—'}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ({appt.duration_minutes || 30} mins)
                            </span>
                          </div>

                          <span
                            className={`badge ${
                              appt.status === 'Completed'
                                ? 'badge-success'
                                : appt.status === 'In-Progress'
                                ? 'badge-info'
                                : appt.status === 'Cancelled'
                                ? 'badge-danger'
                                : 'badge-warning'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            fontSize: '0.8125rem',
                            color: '#334155',
                            marginBottom: '0.4rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Stethoscope size={14} color="#0d9488" />
                            <span>{appt.doctor?.name || 'Assigned Clinician'}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              ({appt.doctor?.specialty} • {appt.doctor?.room_number})
                            </span>
                          </div>

                          <div>
                            <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                              {appt.appointment_type?.name || 'General Visit'}
                            </span>
                          </div>
                        </div>

                        {appt.notes && (
                          <div
                            style={{
                              background: '#f8fafc',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.775rem',
                              color: '#475569',
                              borderLeft: '3px solid #cbd5e1',
                            }}
                          >
                            <strong>Notes:</strong> {appt.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              {onScheduleForPatient && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem' }}
                  onClick={() => {
                    const pat = selectedPatientHistory.patient;
                    setSelectedPatientHistory(null);
                    onScheduleForPatient(pat);
                  }}
                >
                  <CalendarPlus size={15} />
                  <span>Book New Appointment for Patient</span>
                </button>
              )}
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem' }}
                onClick={() => setSelectedPatientHistory(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER PATIENT (STAFF ENTRY) */}
      {isNewPatientModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewPatientModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h3>Register Patient Record</h3>
                <p>Register a verified patient using their National Identity Card (NIC)</p>
              </div>
              <button className="btn-icon" onClick={() => setIsNewPatientModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePatientSubmit}>
              <div className="modal-body">
                {newPatientError && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#b91c1c',
                      fontSize: '0.8125rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{newPatientError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">National Identity Card (NIC) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 199084601289 or 908461289V"
                    value={newPatientForm.nic}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, nic: e.target.value })}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    Used as the unique primary identification for appointment history tracking.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Full Legal Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Suneth Jayawardena"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+94 77 123 4567"
                      value={newPatientForm.phone}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-control"
                      value={newPatientForm.gender}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Unspecified">Unspecified</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="patient@example.com"
                      value={newPatientForm.email}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newPatientForm.date_of_birth}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, date_of_birth: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsNewPatientModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={newPatientSubmitting}
                >
                  {newPatientSubmitting ? 'Registering...' : 'Save Patient Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
