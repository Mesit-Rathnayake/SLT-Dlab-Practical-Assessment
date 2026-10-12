import React from 'react';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Users,
  Stethoscope,
  Building,
  Crown,
  Lock,
  CheckCircle2,
  FileText,
  UserCheck
} from 'lucide-react';

export default function LandingPage({
  onEnterApp,
  onOpenAuth,
  onQuickDemo,
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Landing Header */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)',
              }}
            >
              <Activity size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Medical Wizard
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Hospital Information & Clinical Management System
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="live-badge" title="Hospital Network Status">
              <span className="live-pulse" />
              <ShieldCheck size={14} color="#0d9488" />
              <span>Network Operational</span>
            </div>

            <button
              id="landing-btn-signin"
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
              onClick={() => onOpenAuth('login')}
            >
              Staff Sign In
            </button>

            <button
              id="landing-btn-portal"
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1.15rem' }}
              onClick={onEnterApp}
            >
              <span>Enter Clinical Portal</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4.5rem 2rem 3rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Building size={15} />
          <span>Integrated Healthcare Infrastructure</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            maxWidth: '960px',
            margin: '0 auto 1.25rem',
          }}
        >
          Intelligent Clinical Workflow & Hospital Management
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#64748b',
            maxWidth: '820px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Medical Wizard powers modern healthcare institutions with synchronized outpatient scheduling, unified patient records, practitioner roster coordination, and real-time clinical communication across all hospital departments.
        </p>

        {/* Hero CTAs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3.5rem',
          }}
        >
          <button
            id="hero-btn-enter-app"
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '0.85rem 1.75rem', borderRadius: '12px' }}
            onClick={onEnterApp}
          >
            <span>Launch Hospital Portal</span>
            <ArrowRight size={18} />
          </button>

          <button
            id="hero-btn-login"
            className="btn btn-secondary"
            style={{ fontSize: '1rem', padding: '0.85rem 1.75rem', borderRadius: '12px' }}
            onClick={() => onOpenAuth('login')}
          >
            <Lock size={16} />
            <span>Authorized Staff Sign In</span>
          </button>
        </div>

        {/* Clinical Portals Access Bar */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '940px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              letterSpacing: '0.05em',
            }}
          >
            Departmental & Clinical Portals
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.7rem', textAlign: 'left' }}
              onClick={() => onQuickDemo('super_admin')}
            >
              <Crown size={16} color="#d97706" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>Executive Administration</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Practitioners & Roster Oversight</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.7rem', textAlign: 'left' }}
              onClick={() => onQuickDemo('admin')}
            >
              <Building size={16} color="#0284c7" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>Clinical Front Desk</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Appointments & Patient Records</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.7rem', textAlign: 'left' }}
              onClick={() => onQuickDemo('doctor')}
            >
              <Stethoscope size={16} color="#0d9488" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>Cardiology Department</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dr. Eleanor Vance, MD</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.7rem', textAlign: 'left' }}
              onClick={() => onQuickDemo('doctor_temp')}
            >
              <UserCheck size={16} color="#475569" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>Orthopedic Department</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dr. Marcus Chen, MD</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Hospital Capabilities Section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Integrated Healthcare Operations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Designed for hospitals and multi-specialty medical centers requiring dependable operational coordination.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1: Outpatient Care & Scheduling */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Outpatient Care & Scheduling</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Deliver seamless patient encounters with conflict-free scheduling, automated clinician matching, and instantaneous access to patient care histories.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0d9488" /> Real-time clinician availability & conflict prevention
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0d9488" /> Comprehensive longitudinal patient medical histories
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0d9488" /> Instant administrative notice for clinical schedule updates
              </li>
            </ul>
          </div>

          {/* Card 2: Practitioner Credentialing & Roster Governance */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Crown size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Practitioner Governance</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Streamline clinician credentialing, maintain verified medical council licensing, and configure multi-department duty schedules across hospital branches.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#d97706" /> Practitioner licensing verification & departmental assignment
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#d97706" /> Recurring shift management & consultation slot allocation
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#d97706" /> Secure institutional access control & credential dispatch
              </li>
            </ul>
          </div>

          {/* Card 3: Clinician Consultation Suite */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#ccfbf1',
                color: '#0f766e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Clinician Workspace</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Equip physicians with an intuitive clinical encounter suite designed for focused patient care, active status tracking, and direct administrative coordination.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0f766e" /> Real-time daily patient queue & clinical consultation notes
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0f766e" /> Seamless encounter lifecycle from triage to completion
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0f766e" /> Rapid shift adjustment & emergency clinical notice broadcasting
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: '#ffffff',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#0d9488" />
            <strong style={{ color: '#0f172a' }}>Medical Wizard Clinical Management System</strong>
          </div>
          <div>
            Enterprise Healthcare Information Platform
          </div>
          <div>
            Secure Clinical Operations & Data Privacy Standards
          </div>
        </div>
      </footer>
    </div>
  );
}
