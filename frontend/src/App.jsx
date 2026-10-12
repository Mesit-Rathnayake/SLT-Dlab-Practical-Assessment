import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import FiltersBar from './components/FiltersBar';
import AppointmentsTable from './components/AppointmentsTable';
import AppointmentModal from './components/AppointmentModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import SuperAdminPortal from './components/SuperAdminPortal';
import DoctorPortal from './components/DoctorPortal';
import AdminScheduleAlertsBanner from './components/AdminScheduleAlertsBanner';
import LoginModal from './components/LoginModal';
import ForceChangePasswordModal from './components/ForceChangePasswordModal';
import LandingPage from './components/LandingPage';
import AuthView from './components/AuthView';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';

function MainApplication() {
  const { user, portalMode, setPortalMode, quickDemoLogin } = useAuth();

  // Navigation View: 'landing' | 'auth' | 'app'
  const [currentView, setCurrentView] = useState('landing');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Core Data
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [scheduleAlerts, setScheduleAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination for General Admin
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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

  // Initial Data Fetch
  const fetchMetadata = async () => {
    try {
      const [docsData, typesData, patsData, statsData, alertsData] = await Promise.all([
        api.getDoctors(),
        api.getAppointmentTypes(),
        api.getPatients(),
        api.getStats(),
        api.getScheduleChanges().catch(() => []),
      ]);
      setDoctors(docsData || []);
      setAppointmentTypes(typesData || []);
      setPatients(patsData || []);
      setStats(statsData || null);
      setScheduleAlerts(alertsData || []);
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

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
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
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateAppointment = async (payload) => {
    const res = await api.createAppointment(payload);
    addToast('Appointment scheduled successfully!', 'success');
    api.getPatients().then((pats) => setPatients(pats || [])).catch(() => {});
    loadAppointments();
    return res;
  };

  const handleUpdateAppointment = async (id, payload) => {
    const res = await api.updateAppointment(id, payload);
    addToast('Appointment updated successfully!', 'success');
    loadAppointments();
    return res;
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await api.updateAppointment(id, { status: newStatus });
      addToast(`Status updated to "${newStatus}"`, 'success');
      loadAppointments();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

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

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.acknowledgeScheduleChange(alertId);
      addToast('Schedule alert acknowledged', 'success');
      api.getScheduleChanges().then((a) => setScheduleAlerts(a || [])).catch(() => {});
    } catch (err) {
      addToast('Failed to acknowledge alert', 'error');
    }
  };

  // View 1: Landing Page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setCurrentView('app')}
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'login');
            setCurrentView('auth');
          }}
          onQuickDemo={async (roleKey) => {
            try {
              await quickDemoLogin(roleKey);
              setCurrentView('app');
              addToast('Welcome! Logged in successfully.', 'success');
            } catch (err) {
              addToast(err.message || 'Demo login failed', 'error');
            }
          }}
          isDbConnected={true}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // View 2: Dedicated Auth View (Login & Patient Registration)
  if (currentView === 'auth') {
    return (
      <>
        <AuthView
          initialMode={authMode}
          onBackToHome={() => setCurrentView('landing')}
          onSuccess={() => {
            setCurrentView('app');
            addToast('Authenticated successfully!', 'success');
          }}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activePortal={portalMode}
        onSelectPortal={setPortalMode}
        onNavigateHome={() => setCurrentView('landing')}
        onOpenNewModal={() =>
          setModalState({ isOpen: true, mode: 'create', appointment: null })
        }
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* PORTAL 1: SUPER ADMIN */}
        {portalMode === 'SUPER_ADMIN' && (
          <SuperAdminPortal
            doctors={doctors}
            onRefreshDoctors={fetchMetadata}
            onAddToast={addToast}
          />
        )}

        {/* PORTAL 2: DOCTOR WORKSPACE */}
        {portalMode === 'DOCTOR' && (
          <DoctorPortal onAddToast={addToast} />
        )}

        {/* PORTAL 3: GENERAL ADMINISTRATION */}
        {portalMode === 'ADMIN' && (
          <div>
            {/* Sudden Doctor Schedule Changes Alert Banner */}
            <AdminScheduleAlertsBanner
              alerts={scheduleAlerts}
              onAcknowledge={handleAcknowledgeAlert}
            />

            {/* KPI Stats */}
            <StatsCards
              stats={stats}
              activeStatus={filters.status}
              onSelectStatus={(status) => handleFilterChange('status', status)}
            />

            {/* Section Header */}
            <div className="section-header">
              <div className="section-title">
                <h2>General Administration & Appointments Directory</h2>
                <p>Monitor, book, and coordinate hospital appointments across all clinicians.</p>
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
          </div>
        )}
      </main>

      {/* Create / Edit Appointment Modal */}
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

      {/* Login & Profile Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Enforced First-Time Password Change for Doctors */}
      <ForceChangePasswordModal
        onPasswordChanged={() =>
          addToast('Password successfully updated! Welcome to your clinical workspace.', 'success')
        }
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}
