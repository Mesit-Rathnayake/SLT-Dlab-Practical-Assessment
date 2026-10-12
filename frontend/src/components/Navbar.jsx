import React from 'react';
import { Activity, Plus, Database, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenNewModal, isDbConnected }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-icon-wrap">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>Medical Wizard</h1>
            <p>Clinical Appointment System</p>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="live-badge" title="Connected to PostgreSQL Database">
            <span className="live-pulse" />
            <Database size={13} />
            <span>PostgreSQL Active</span>
          </div>

          <button
            id="btn-new-appointment-nav"
            className="btn btn-primary"
            onClick={onOpenNewModal}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>
    </header>
  );
}
