const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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
};
