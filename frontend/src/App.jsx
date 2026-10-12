import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import FiltersBar from './components/FiltersBar';
import AppointmentsTable from './components/AppointmentsTable';
import AppointmentModal from './components/AppointmentModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import { api } from './services/api';

export default function App() {
  // Global Data
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    doctor_id: '',
    type_id: '',
    sort_by: 'date',
    sort_order: 'desc',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total_count: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
  });

  // Modals & Notifications
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create',
    appointment: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    appointment: null,
    deleting: false,
  });

  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch (Metadata)
  const fetchMetadata = async () => {
    try {
      const [docsData, typesData, patsData, statsData] = await Promise.all([
        api.getDoctors(),
        api.getAppointmentTypes(),
        api.getPatients(),
        api.getStats(),
      ]);
      setDoctors(docsData || []);
      setAppointmentTypes(typesData || []);
      setPatients(patsData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error('Failed to load initial metadata:', err);
      addToast('Could not load metadata from API server', 'error');
    }
  };

  // Fetch Appointments
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAppointments(filters);
      setAppointments(res.appointments || []);
      setPagination({
        total_count: res.total_count,
        page: res.page,
        limit: res.limit,
        total_pages: res.total_pages,
      });

      // Also refresh stats
      api.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      addToast(err.message || 'Failed to fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Search debounce
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      loadAppointments();
    }, 250);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [filters, loadAppointments]);

  // Filter Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // reset to page 1 on filter change
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      doctor_id: '',
      type_id: '',
      sort_by: 'date',
      sort_order: 'desc',
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Create Appointment
  const handleCreateAppointment = async (payload) => {
    const res = await api.createAppointment(payload);
    addToast('Appointment scheduled successfully!', 'success');
    // Refresh patients list in case inline patient was created
    api.getPatients().then((pats) => setPatients(pats || [])).catch(() => {});
    loadAppointments();
    return res;
  };

  // Edit Appointment
  const handleUpdateAppointment = async (id, payload) => {
    const res = await api.updateAppointment(id, payload);
    addToast('Appointment updated successfully!', 'success');
    loadAppointments();
    return res;
  };

  // Quick Status Change from row
  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await api.updateAppointment(id, { status: newStatus });
      addToast(`Status updated to "${newStatus}"`, 'success');
      loadAppointments();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete Appointment
  const handleConfirmDelete = async (id) => {
    setDeleteModalState((prev) => ({ ...prev, deleting: true }));
    try {
      await api.deleteAppointment(id);
      addToast('Appointment deleted successfully', 'success');
      setDeleteModalState({ isOpen: false, appointment: null, deleting: false });
      loadAppointments();
    } catch (err) {
      addToast(err.message || 'Failed to delete appointment', 'error');
      setDeleteModalState((prev) => ({ ...prev, deleting: false }));
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        onOpenNewModal={() =>
          setModalState({ isOpen: true, mode: 'create', appointment: null })
        }
      />

      {/* Main Body */}
      <main className="main-content">
        {/* KPI Stats */}
        <StatsCards
          stats={stats}
          activeStatus={filters.status}
          onSelectStatus={(status) => handleFilterChange('status', status)}
        />

        {/* Section Header */}
        <div className="section-header">
          <div className="section-title">
            <h2>Appointments Directory</h2>
            <p>Monitor, schedule, and coordinate clinical appointments.</p>
          </div>
          <button
            id="btn-schedule-main"
            className="btn btn-primary"
            onClick={() =>
              setModalState({ isOpen: true, mode: 'create', appointment: null })
            }
          >
            + Schedule Appointment
          </button>
        </div>

        {/* Search & Filters */}
        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          doctors={doctors}
          appointmentTypes={appointmentTypes}
          stats={stats}
        />

        {/* Appointments Table */}
        <AppointmentsTable
          appointments={appointments}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={(appt) =>
            setModalState({ isOpen: true, mode: 'edit', appointment: appt })
          }
          onDelete={(appt) =>
            setDeleteModalState({ isOpen: true, appointment: appt, deleting: false })
          }
          onOpenNewModal={() =>
            setModalState({ isOpen: true, mode: 'create', appointment: null })
          }
          onStatusChange={handleQuickStatusChange}
        />
      </main>

      {/* Create / Edit Modal */}
      <AppointmentModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        appointment={modalState.appointment}
        patients={patients}
        doctors={doctors}
        appointmentTypes={appointmentTypes}
        onClose={() =>
          setModalState({ isOpen: false, mode: 'create', appointment: null })
        }
        onSubmit={
          modalState.mode === 'create'
            ? handleCreateAppointment
            : handleUpdateAppointment
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        appointment={deleteModalState.appointment}
        deleting={deleteModalState.deleting}
        onClose={() =>
          setDeleteModalState({ isOpen: false, appointment: null, deleting: false })
        }
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
