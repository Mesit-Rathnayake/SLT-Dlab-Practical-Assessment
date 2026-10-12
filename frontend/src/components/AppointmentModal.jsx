import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  ShieldCheck,
  History,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';

function toLocalDatetimeString(dateObj) {
  const d = dateObj ? new Date(dateObj) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AppointmentModal({
  isOpen,
  mode, // 'create' | 'edit'
  appointment,
  patients,
  doctors,
  appointmentTypes,
  onClose,
  onSubmit,
}) {
  // Form states
  const [patientNic, setPatientNic] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState('Male');

  // History preview state
  const [nicLookupStatus, setNicLookupStatus] = useState(null); // null | 'found' | 'new' | 'searching'
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const [doctorId, setDoctorId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('Scheduled');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setNicLookupStatus(null);
    setPreviousAppointments([]);
    setShowHistoryDropdown(false);

    if (mode === 'edit' && appointment) {
      setPatientId(appointment.patient_id || '');
      setPatientNic(appointment.patient?.nic || '');
      setPatientName(appointment.patient?.name || '');
      setPatientPhone(appointment.patient?.phone || '');
      setPatientEmail(appointment.patient?.email || '');
      setDoctorId(appointment.doctor_id || '');
      setTypeId(appointment.appointment_type_id || '');
      setDateTime(toLocalDatetimeString(appointment.appointment_date_time));
      setDuration(appointment.duration_minutes || 30);
      setStatus(appointment.status || 'Scheduled');
      setNotes(appointment.notes || '');

      // Load previous appointment history if patient exists
      if (appointment.patient_id) {
        api.getPatientHistory(appointment.patient_id)
          .then((res) => {
            if (res && res.appointments) {
              setPreviousAppointments(res.appointments.filter((a) => a.id !== appointment.id));
              setNicLookupStatus('found');
            }
          })
          .catch(() => {});
      }
    } else {
      // Create mode defaults
      setPatientId('');
      setPatientNic('');
      setPatientName('');
      setPatientEmail('');
      setPatientPhone('');
      setPatientGender('Male');

      setDoctorId(doctors.length > 0 ? doctors[0].id : '');
      const defaultType = appointmentTypes.length > 0 ? appointmentTypes[0] : null;
      setTypeId(defaultType ? defaultType.id : '');
      setDuration(defaultType ? defaultType.default_duration_minutes : 30);

      // Default date: tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setDateTime(toLocalDatetimeString(tomorrow));

      setStatus('Scheduled');
      setNotes('');
    }
  }, [isOpen, mode, appointment, patients, doctors, appointmentTypes]);

  if (!isOpen) return null;

  // Lookup patient by NIC
  const handleLookupNIC = async (nicValue) => {
    const clean = (nicValue || patientNic).trim();
    if (!clean) return;

    setNicLookupStatus('searching');
    try {
      const res = await api.getPatientByNIC(clean);
      if (res && res.patient) {
        setPatientId(res.patient.id);
        setPatientNic(res.patient.nic);
        setPatientName(res.patient.name);
        setPatientPhone(res.patient.phone);
        setPatientEmail(res.patient.email);
        if (res.patient.gender) setPatientGender(res.patient.gender);
        setPreviousAppointments(res.appointments || []);
        setNicLookupStatus('found');
      }
    } catch (err) {
      // Not found -> treat as new patient under this NIC
      setPatientId('');
      setPreviousAppointments([]);
      setNicLookupStatus('new');
    }
  };

  // When staff selects from dropdown of existing patients
  const handleSelectPatientDropdown = (selectedId) => {
    setPatientId(selectedId);
    const pat = patients.find((p) => String(p.id) === String(selectedId));
    if (pat) {
      setPatientNic(pat.nic || '');
      setPatientName(pat.name || '');
      setPatientPhone(pat.phone || '');
      setPatientEmail(pat.email || '');
      if (pat.gender) setPatientGender(pat.gender);

      // Fetch their history
      api.getPatientHistory(pat.id)
        .then((res) => {
          setPreviousAppointments(res.appointments || []);
          setNicLookupStatus('found');
        })
        .catch(() => {});
    }
  };

  const handleTypeChange = (newTypeId) => {
    setTypeId(newTypeId);
    const selectedType = appointmentTypes.find((t) => String(t.id) === String(newTypeId));
    if (selectedType && selectedType.default_duration_minutes) {
      setDuration(selectedType.default_duration_minutes);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!doctorId) {
      setError('Please select a healthcare provider / doctor.');
      return;
    }

    if (!typeId) {
      setError('Please select an appointment type.');
      return;
    }

    if (!dateTime) {
      setError('Please select appointment date and time.');
      return;
    }

    if (mode === 'create') {
      if (!patientNic.trim() && !patientId) {
        setError('Please enter the patient NIC number or select a patient.');
        return;
      }
      if (!patientName.trim()) {
        setError('Please enter the patient full legal name.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const payload = {
          patient_id: patientId ? Number(patientId) : null,
          patient_nic: patientNic.trim(),
          patient_name: patientName.trim(),
          patient_email: patientEmail.trim(),
          patient_phone: patientPhone.trim(),
          patient_gender: patientGender,
          doctor_id: Number(doctorId),
          appointment_type_id: Number(typeId),
          appointment_date_time: dateTime,
          duration_minutes: Number(duration),
          status,
          notes,
        };

        await onSubmit(payload);
      } else {
        const payload = {
          patient_id: patientId ? Number(patientId) : null,
          doctor_id: Number(doctorId),
          appointment_type_id: Number(typeId),
          appointment_date_time: dateTime,
          duration_minutes: Number(duration),
          status,
          notes,
        };
        await onSubmit(appointment.id, payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify form details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>{mode === 'create' ? 'Schedule Clinical Appointment' : 'Edit Appointment'}</h3>
            <p>
              {mode === 'create'
                ? 'Identify patient by NIC, review previous history, and assign clinician.'
                : `Updating Appointment #${appointment?.id}`}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} id="btn-close-modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* SECTION 1: PATIENT IDENTIFICATION & NIC LOOKUP */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Patient Identification (NIC & Demographics)
                </span>

                {/* Quick picker dropdown */}
                {patients && patients.length > 0 && (
                  <select
                    className="form-control"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', maxWidth: '210px' }}
                    value={patientId}
                    onChange={(e) => handleSelectPatientDropdown(e.target.value)}
                  >
                    <option value="">Or select from directory...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.nic || 'No NIC'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* NIC Input with Lookup */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">
                  <span>National Identity Card (NIC) *</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      id="modal-input-patient-nic"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 198810502341 or 881052341V"
                      value={patientNic}
                      onChange={(e) => setPatientNic(e.target.value)}
                      onBlur={() => handleLookupNIC()}
                      required
                    />
                    <ShieldCheck
                      size={15}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    onClick={() => handleLookupNIC()}
                  >
                    Verify NIC
                  </button>
                </div>
              </div>

              {/* Status Banner based on Lookup */}
              {nicLookupStatus === 'found' && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.8125rem',
                    color: '#15803d',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <CheckCircle2 size={16} />
                      <span>Existing Patient Verified: {patientName}</span>
                    </div>
                    {previousAppointments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#047857',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <History size={13} />
                        <span>{previousAppointments.length} Previous Visits</span>
                        {showHistoryDropdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    )}
                  </div>

                  {/* Previous Appointment Accordion */}
                  {showHistoryDropdown && previousAppointments.length > 0 && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        paddingTop: '0.65rem',
                        borderTop: '1px dashed #bbf7d0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        maxHeight: '180px',
                        overflowY: 'auto',
                      }}
                    >
                      {previousAppointments.map((pa) => (
                        <div
                          key={pa.id}
                          style={{
                            background: '#ffffff',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid #dcfce7',
                            fontSize: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#0f172a' }}>
                              {new Date(pa.appointment_date_time).toLocaleDateString()}
                            </strong>{' '}
                            with {pa.doctor?.name || 'Doctor'}
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                              ({pa.appointment_type?.name || 'Visit'})
                            </span>
                          </div>
                          <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                            {pa.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {nicLookupStatus === 'new' && (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.8125rem',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>
                    New NIC detected. Enter patient name and details below to create permanent record.
                  </span>
                </div>
              )}

              {/* Patient Fields */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Patient Full Name *</label>
                <input
                  id="modal-input-patient-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Kasun Fernando"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Contact</label>
                  <input
                    id="modal-input-patient-phone"
                    type="tel"
                    className="form-control"
                    placeholder="+94 77 123 4567"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    id="modal-input-patient-email"
                    type="email"
                    className="form-control"
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CLINICIAN & VISIT TYPE */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Healthcare Provider / Doctor *</label>
              <select
                id="modal-select-doctor"
                className="form-control"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                <option value="">Select a doctor...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.room_number || 'Room 101'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Appointment Type *</label>
                <select
                  id="modal-select-type"
                  className="form-control"
                  value={typeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  required
                >
                  <option value="">Select type...</option>
                  {appointmentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.default_duration_minutes}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <select
                  id="modal-select-duration"
                  className="form-control"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>

            {/* SECTION 3: DATE, TIME & STATUS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input
                  id="modal-input-datetime"
                  type="datetime-local"
                  className="form-control"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  id="modal-select-status"
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* SECTION 4: CLINICAL NOTES */}
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Clinical / Administrative Notes</label>
              <textarea
                id="modal-input-notes"
                className="form-control"
                rows={3}
                placeholder="Reason for consultation, relevant symptoms, or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              id="modal-btn-submit"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving Appointment...' : mode === 'create' ? 'Confirm & Schedule Appointment' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
