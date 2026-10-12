import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';

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
  const [patientMode, setPatientMode] = useState('existing'); // 'existing' | 'new'

  // Form states
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState('Male');

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

    if (mode === 'edit' && appointment) {
      setPatientMode('existing');
      setPatientId(appointment.patient_id || '');
      setDoctorId(appointment.doctor_id || '');
      setTypeId(appointment.appointment_type_id || '');
      setDateTime(toLocalDatetimeString(appointment.appointment_date_time));
      setDuration(appointment.duration_minutes || 30);
      setStatus(appointment.status || 'Scheduled');
      setNotes(appointment.notes || '');
    } else {
      // Create mode defaults
      setPatientMode('existing');
      setPatientId(patients.length > 0 ? patients[0].id : '');
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
      if (patientMode === 'existing' && !patientId) {
        setError('Please select a patient.');
        return;
      }
      if (patientMode === 'new' && !patientName.trim()) {
        setError('Please enter the patient full name.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const payload = {
          doctor_id: Number(doctorId),
          appointment_type_id: Number(typeId),
          appointment_date_time: dateTime,
          duration_minutes: Number(duration),
          status,
          notes,
        };

        if (patientMode === 'existing') {
          payload.patient_id = Number(patientId);
        } else {
          payload.patient_name = patientName.trim();
          payload.patient_email = patientEmail.trim();
          payload.patient_phone = patientPhone.trim();
        }

        await onSubmit(payload);
      } else {
        const payload = {
          patient_id: Number(patientId),
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>{mode === 'create' ? 'Schedule New Appointment' : 'Edit Appointment'}</h3>
            <p>
              {mode === 'create'
                ? 'Fill in appointment details and link patient and clinician.'
                : `Updating Appointment #${appointment?.id}`}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} id="btn-close-modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Patient Selection */}
            {mode === 'create' ? (
              <div className="form-group">
                <label className="form-label">
                  <span>Patient</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      className={`switch-btn ${patientMode === 'existing' ? 'active' : ''}`}
                      onClick={() => setPatientMode('existing')}
                    >
                      Existing Patient
                    </button>
                    <button
                      type="button"
                      className={`switch-btn ${patientMode === 'new' ? 'active' : ''}`}
                      onClick={() => setPatientMode('new')}
                    >
                      + New Patient
                    </button>
                  </div>
                </label>

                {patientMode === 'existing' ? (
                  <select
                    id="modal-select-patient"
                    className="form-select"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone || p.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      background: 'var(--bg-surface-subtle)',
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <input
                      id="modal-input-patient-name"
                      type="text"
                      className="form-input"
                      placeholder="Patient Full Name *"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                    <div className="form-row">
                      <input
                        id="modal-input-patient-email"
                        type="email"
                        className="form-input"
                        placeholder="Email Address"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                      />
                      <input
                        id="modal-input-patient-phone"
                        type="text"
                        className="form-input"
                        placeholder="Phone Number"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select
                  id="modal-edit-select-patient"
                  className="form-select"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone || p.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Doctor Selection */}
            <div className="form-group">
              <label className="form-label">Doctor / Healthcare Provider *</label>
              <select
                id="modal-select-doctor"
                className="form-select"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">Select a doctor...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.room_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type & Duration */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Appointment Type *</label>
                <select
                  id="modal-select-type"
                  className="form-select"
                  value={typeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  {appointmentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.default_duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input
                  id="modal-input-duration"
                  type="number"
                  min="5"
                  max="240"
                  step="5"
                  className="form-input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            {/* Date Time & Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input
                  id="modal-input-datetime"
                  type="datetime-local"
                  className="form-input"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  id="modal-select-status"
                  className="form-select"
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

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Clinical Notes / Reason for Visit</label>
              <textarea
                id="modal-textarea-notes"
                className="form-textarea"
                placeholder="Enter patient symptoms, reason for consultation, or special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="btn-submit-appointment"
            >
              {submitting
                ? 'Saving...'
                : mode === 'create'
                ? 'Confirm Appointment'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
