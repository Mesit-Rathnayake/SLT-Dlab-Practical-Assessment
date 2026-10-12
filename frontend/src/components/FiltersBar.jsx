import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';

export default function FiltersBar({
  filters,
  onFilterChange,
  onResetFilters,
  doctors,
  appointmentTypes,
  stats,
}) {
  const statuses = [
    { label: 'All Appointments', value: 'all', count: stats?.total_appointments },
    { label: 'Scheduled', value: 'Scheduled', count: stats?.scheduled_count },
    { label: 'In Progress', value: 'In-Progress', count: stats?.in_progress_count },
    { label: 'Completed', value: 'Completed', count: stats?.completed_count },
    { label: 'Cancelled', value: 'Cancelled', count: stats?.cancelled_count },
  ];

  return (
    <div className="filter-card">
      <div className="filter-row-top">
        {/* Search */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            id="input-search-appointments"
            type="text"
            className="search-input"
            placeholder="Search by patient name, doctor, or notes..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        {/* Doctor Filter */}
        <select
          id="select-doctor-filter"
          className="filter-select"
          value={filters.doctor_id}
          onChange={(e) => onFilterChange('doctor_id', e.target.value)}
        >
          <option value="">All Doctors ({doctors.length})</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} - {doc.specialty}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          id="select-type-filter"
          className="filter-select"
          value={filters.type_id}
          onChange={(e) => onFilterChange('type_id', e.target.value)}
        >
          <option value="">All Types ({appointmentTypes.length})</option>
          {appointmentTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Sort Order */}
        <select
          id="select-sort-filter"
          className="filter-select"
          value={`${filters.sort_by}-${filters.sort_order}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            onFilterChange('sort_by', by);
            onFilterChange('sort_order', order);
          }}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="patient-asc">Patient Name (A-Z)</option>
          <option value="doctor-asc">Doctor Name (A-Z)</option>
        </select>

        {/* Reset button */}
        {(filters.search || filters.status !== 'all' || filters.doctor_id || filters.type_id) && (
          <button
            id="btn-reset-filters"
            className="btn btn-secondary"
            onClick={onResetFilters}
            title="Clear all filters"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="status-tabs">
        {statuses.map((s) => {
          const isActive = filters.status === s.value;
          return (
            <button
              key={s.value}
              className={`status-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange('status', s.value)}
            >
              <span>{s.label}</span>
              {s.count !== undefined && (
                <span className="status-tab-count">{s.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
