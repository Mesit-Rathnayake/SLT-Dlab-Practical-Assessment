import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  Mail,
  Stethoscope,
  Edit,
  Save,
  Check,
  Send,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import PatientRecordsView from './PatientRecordsView';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' },
];

export default function SuperAdminPortal({ doctors, onRefreshDoctors, onAddToast }) {
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'schedules' | 'emails'

  // Register Doctor Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: 'General Practice',
    email: '',
    phone: '',
    room_number: 'Suite 101',
    slmc_reg_no: '',
    bio: '',
    temp_password: '',
  });
  const [registering, setRegistering] = useState(false);
  const [registeredCredentials, setRegisteredCredentials] = useState(null);

  // Schedules Tab State
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Emails Tab State
  const [emails, setEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  // Copied feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  // Load schedules when selected doctor changes
  useEffect(() => {
    if (activeTab === 'schedules' && selectedDoctorId) {
      loadSchedules(selectedDoctorId);
    }
  }, [activeTab, selectedDoctorId]);

  // Load emails when tab active
  useEffect(() => {
    if (activeTab === 'emails') {
      loadEmails();
    }
  }, [activeTab]);

  const loadSchedules = async (docId) => {
    setLoadingSchedules(true);
    try {
      const data = await api.getDoctorSchedules(docId);
      // Map existing schedules by day
      const scheduleMap = {};
      (data || []).forEach((s) => {
        scheduleMap[s.day_of_week] = s;
      });

      // Ensure all 7 days represented
      const fullDays = DAYS_OF_WEEK.map((d) => {
        if (scheduleMap[d.id]) {
          return { ...scheduleMap[d.id] };
        }
        return {
          day_of_week: d.id,
          start_time: '09:00',
          end_time: '17:00',
          is_available: d.id <= 5, // Mon-Fri default true
          slot_duration_minutes: 30,
        };
      });
      setDoctorSchedules(fullDays);
    } catch (err) {
      onAddToast('Failed to load doctor schedules', 'error');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadEmails = async () => {
    setLoadingEmails(true);
    try {
      const data = await api.getEmailNotifications();
      setEmails(data || []);
    } catch (err) {
      onAddToast('Failed to load email outbox', 'error');
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newDoctor.slmc_reg_no.trim()) {
      onAddToast('SLMC Registration Number is required', 'error');
      return;
    }

    setRegistering(true);
    try {
      const res = await api.registerDoctor(newDoctor);
      setRegisteredCredentials({
        name: res.doctor.name,
        email: res.doctor.email,
        slmc: res.doctor.slmc_reg_no,
        temp_password: res.temp_password,
      });
      onAddToast(`Doctor ${res.doctor.name} registered successfully!`, 'success');
      onRefreshDoctors();
      setNewDoctor({
        name: '',
        specialty: 'General Practice',
        email: '',
        phone: '',
        room_number: 'Suite 101',
        slmc_reg_no: '',
        bio: '',
        temp_password: '',
      });
    } catch (err) {
      onAddToast(err.message || 'Registration failed', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleScheduleChange = (dayOfWeek, field, value) => {
    setDoctorSchedules((prev) =>
      prev.map((s) => (s.day_of_week === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSchedules = async () => {
    if (!selectedDoctorId) return;
    setSavingSchedule(true);
    try {
      for (const sched of doctorSchedules) {
        await api.updateDoctorSchedule(selectedDoctorId, sched);
      }
      onAddToast('Doctor availability schedule updated successfully!', 'success');
    } catch (err) {
      onAddToast(err.message || 'Failed to update schedule', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  const copyCredentials = () => {
    if (!registeredCredentials) return;
    const text = `Doctor Name: ${registeredCredentials.name}\nEmail: ${registeredCredentials.email}\nSLMC Reg No: ${registeredCredentials.slmc}\nTemporary Password: ${registeredCredentials.temp_password}\nPortal URL: http://localhost:5173`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div>
      {/* Super Admin Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('doctors')}
        >
          <Stethoscope size={17} />
          <span>Doctor Registry & SLMC Verification</span>
        </button>

        <button
          className={`btn ${activeTab === 'schedules' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('schedules')}
        >
          <Calendar size={17} />
          <span>Available Dates & Working Hours</span>
        </button>

        <button
          className={`btn ${activeTab === 'emails' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('emails')}
        >
          <Mail size={17} />
          <span>Email Outbox & Credential Dispatch</span>
        </button>

        <button
          className={`btn ${activeTab === 'patients' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('patients')}
        >
          <Users size={17} />
          <span>Patient Records & Medical History</span>
        </button>
      </div>

      {/* TAB 1: DOCTOR REGISTRY */}
      {activeTab === 'doctors' && (
        <div>
          <div className="section-header">
            <div>
              <h3>Practitioner Registry & Onboarding</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Onboard licensed doctors, verify SLMC numbers, and issue temporary login credentials.
              </p>
            </div>
            <button
              id="btn-register-new-doctor"
              className="btn btn-primary"
              onClick={() => {
                setRegisteredCredentials(null);
                setIsRegisterModalOpen(true);
              }}
            >
              <UserPlus size={17} />
              <span>+ Register New Doctor</span>
            </button>
          </div>

          <div className="table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Doctor & Specialty</th>
                  <th>SLMC Reg Number</th>
                  <th>Contact Info</th>
                  <th>Clinic Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div>
                        <strong style={{ color: '#0f172a' }}>{doc.name}</strong>
                        <div style={{ color: '#0d9488', fontSize: '0.75rem', fontWeight: 600 }}>
                          {doc.specialty}
                        </div>
                        {doc.bio && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {doc.bio}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#f1f5f9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          color: '#0369a1',
                          fontWeight: 600,
                        }}
                      >
                        {doc.slmc_reg_no || 'Pending Verification'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div>{doc.email}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{doc.phone}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 500 }}>
                        {doc.room_number || 'Room 101'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: doc.status === 'Active' ? '#ecfdf5' : '#fffbeb',
                          color: doc.status === 'Active' ? '#047857' : '#b45309',
                          border: `1px solid ${doc.status === 'Active' ? '#a7f3d0' : '#fde68a'}`,
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'currentColor',
                          }}
                        />
                        {doc.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULES & AVAILABLE HOURS */}
      {activeTab === 'schedules' && (
        <div>
          <div className="section-header">
            <div>
              <h3>Doctor Availability & Working Hours</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Configure recurring days of the week, shift hours, and consultation slot intervals.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                className="filter-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>

              <button
                id="btn-save-schedules"
                className="btn btn-primary"
                onClick={handleSaveSchedules}
                disabled={savingSchedule}
              >
                <Save size={16} />
                <span>{savingSchedule ? 'Saving...' : 'Save Schedule'}</span>
              </button>
            </div>
          </div>

          {loadingSchedules ? (
            <div className="table-container" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading doctor schedule...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Day of the Week</th>
                    <th>Availability Status</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Slot Duration (Mins)</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorSchedules.map((sched) => {
                    const dayObj = DAYS_OF_WEEK.find((d) => d.id === sched.day_of_week);
                    return (
                      <tr key={sched.day_of_week}>
                        <td>
                          <strong>{dayObj?.name}</strong>
                        </td>
                        <td>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={sched.is_available}
                              onChange={(e) =>
                                handleScheduleChange(sched.day_of_week, 'is_available', e.target.checked)
                              }
                            />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: sched.is_available ? '#047857' : '#64748b' }}>
                              {sched.is_available ? 'Available / On Duty' : 'Off Duty'}
                            </span>
                          </label>
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-input"
                            style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                            disabled={!sched.is_available}
                            value={sched.start_time || '09:00'}
                            onChange={(e) =>
                              handleScheduleChange(sched.day_of_week, 'start_time', e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-input"
                            style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                            disabled={!sched.is_available}
                            value={sched.end_time || '17:00'}
                            onChange={(e) =>
                              handleScheduleChange(sched.day_of_week, 'end_time', e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                            disabled={!sched.is_available}
                            value={sched.slot_duration_minutes || 30}
                            onChange={(e) =>
                              handleScheduleChange(
                                sched.day_of_week,
                                'slot_duration_minutes',
                                Number(e.target.value)
                              )
                            }
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

      {/* TAB 3: EMAIL OUTBOX */}
      {activeTab === 'emails' && (
        <div>
          <div className="section-header">
            <div>
              <h3>Email Notification Outbox & Credential Log</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Simulated transactional mailer showing welcome letters and temporary passwords delivered to clinicians.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={loadEmails} disabled={loadingEmails}>
              Refresh Outbox
            </button>
          </div>

          {loadingEmails ? (
            <div className="table-container" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading outbound notifications...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {emails.length === 0 ? (
                <div className="table-container" style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No emails dispatched yet.</p>
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={16} color="#0d9488" />
                        <strong style={{ color: '#0f172a' }}>{email.subject}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>To: <strong>{email.recipient_email}</strong></span>
                        <span
                          style={{
                            background: '#ecfdf5',
                            color: '#047857',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700,
                          }}
                        >
                          {email.status}
                        </span>
                        <span>{new Date(email.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <pre
                      style={{
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        color: '#334155',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {email.body}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PATIENT RECORDS & MEDICAL HISTORY */}
      {activeTab === 'patients' && (
        <PatientRecordsView onAddToast={onAddToast} />
      )}

      {/* REGISTER DOCTOR MODAL */}
      {isRegisterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h3>Register New Medical Practitioner</h3>
                <p>Verify clinician credentials, allocate room, and issue access</p>
              </div>
              <button className="btn-icon" onClick={() => setIsRegisterModalOpen(false)}>
                ✕
              </button>
            </div>

            {registeredCredentials ? (
              <div className="modal-body">
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                  <h4 style={{ color: '#065f46', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                    Doctor Registered Successfully!
                  </h4>
                  <p style={{ color: '#047857', fontSize: '0.8125rem' }}>
                    The welcome email with initial temporary credentials has been dispatched.
                  </p>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong>Doctor:</strong> {registeredCredentials.name}
                  </div>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong>Email:</strong> {registeredCredentials.email}
                  </div>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong>SLMC Reg No:</strong> {registeredCredentials.slmc}
                  </div>
                  <div style={{ marginBottom: '0.75rem', color: '#b45309' }}>
                    <strong>Temporary Password:</strong>{' '}
                    <span style={{ background: '#fef3c7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                      {registeredCredentials.temp_password}
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                    onClick={copyCredentials}
                  >
                    {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                  </button>
                </div>

                <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setIsRegisterModalOpen(false);
                      setRegisteredCredentials(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Doctor Full Name *</label>
                    <input
                      id="input-doc-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. Priyantha Jayasuriya"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Medical Specialty *</label>
                      <select
                        id="select-doc-specialty"
                        className="form-select"
                        value={newDoctor.specialty}
                        onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                      >
                        <option value="General Practice">General Practice</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="ENT Surgery">ENT Surgery</option>
                        <option value="Oncology">Oncology</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">SLMC Registration No *</label>
                      <input
                        id="input-doc-slmc"
                        type="text"
                        className="form-input"
                        placeholder="e.g. SLMC-MD-58921"
                        value={newDoctor.slmc_reg_no}
                        onChange={(e) => setNewDoctor({ ...newDoctor, slmc_reg_no: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        id="input-doc-email"
                        type="email"
                        className="form-input"
                        placeholder="doctor@medwizard.health"
                        value={newDoctor.email}
                        onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Phone *</label>
                      <input
                        id="input-doc-phone"
                        type="text"
                        className="form-input"
                        placeholder="+94 77 123 4567"
                        value={newDoctor.phone}
                        onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Clinic Room / Suite</label>
                      <input
                        id="input-doc-room"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Suite 204"
                        value={newDoctor.room_number}
                        onChange={(e) => setNewDoctor({ ...newDoctor, room_number: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Temporary Password (Optional)</label>
                      <input
                        id="input-doc-temp-pass"
                        type="text"
                        className="form-input"
                        placeholder="Auto-generated if blank"
                        value={newDoctor.temp_password}
                        onChange={(e) => setNewDoctor({ ...newDoctor, temp_password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinical Background / Bio</label>
                    <textarea
                      id="textarea-doc-bio"
                      className="form-textarea"
                      placeholder="Specialization, clinical experience, and patient consultation focus..."
                      value={newDoctor.bio}
                      onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsRegisterModalOpen(false)}
                    disabled={registering}
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-confirm-doctor-register"
                    type="submit"
                    className="btn btn-primary"
                    disabled={registering}
                  >
                    {registering ? 'Registering & Dispatching...' : 'Register & Issue Credentials'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
