const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function getToken() {
  return localStorage.getItem('medwizard_token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // --- Auth Endpoints ---
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  changePassword: (current_password, new_password) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  getMe: () => request('/auth/me'),

  // --- Appointments Core Endpoints ---
  getAppointments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.doctor_id) query.append('doctor_id', params.doctor_id);
    if (params.type_id) query.append('type_id', params.type_id);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_order) query.append('sort_order', params.sort_order);

    const queryString = query.toString();
    return request(`/appointments${queryString ? `?${queryString}` : ''}`);
  },

  getAppointmentById: (id) => request(`/appointments/${id}`),

  createAppointment: (payload) =>
    request('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAppointment: (id, payload) =>
    request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteAppointment: (id) =>
    request(`/appointments/${id}`, {
      method: 'DELETE',
    }),

  // --- Patients & Meta ---
  getPatients: (search = '') =>
    request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  createPatient: (payload) =>
    request('/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDoctors: () => request('/doctors'),

  getAppointmentTypes: () => request('/appointment-types'),

  getStats: () => request('/analytics/stats'),

  getHealth: () => request('/health'),

  // --- Schedule Change Alerts ---
  getScheduleChanges: () => request('/admin/schedule-changes'),

  acknowledgeScheduleChange: (id) =>
    request(`/admin/schedule-changes/${id}/ack`, {
      method: 'POST',
    }),

  getEmailNotifications: () => request('/admin/emails'),

  // --- Super Admin Endpoints ---
  registerDoctor: (payload) =>
    request('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateDoctor: (id, payload) =>
    request(`/admin/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getDoctorSchedules: (doctorId) => request(`/admin/doctors/${doctorId}/schedules`),

  updateDoctorSchedule: (doctorId, schedule) =>
    request(`/admin/doctors/${doctorId}/schedules`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    }),

  getAdminUsers: () => request('/admin/users'),

  // --- Doctor Portal Endpoints ---
  getDoctorMyAppointments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    return request(`/doctor/my-appointments${queryString ? `?${queryString}` : ''}`);
  },

  getDoctorMySchedule: () => request('/doctor/my-schedule'),

  updateDoctorMySchedule: (schedule) =>
    request('/doctor/my-schedule', {
      method: 'PUT',
      body: JSON.stringify(schedule),
    }),

  reportDoctorScheduleChange: (payload) =>
    request('/doctor/schedule-changes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
