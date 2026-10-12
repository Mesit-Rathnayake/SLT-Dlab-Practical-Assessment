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
  Database,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LandingPage({
  onEnterApp,
  onOpenAuth,
  onQuickDemo,
  isDbConnected
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Landing Header */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
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
                Enterprise Clinical System
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="live-badge" title="Live Database Status">
              <span className="live-pulse" />
              <Database size={13} />
              <span>Neon Cloud Active</span>
            </div>

            <button
              id="landing-btn-signin"
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
              onClick={() => onOpenAuth('login')}
            >
              Sign In
            </button>

            <button
              id="landing-btn-portal"
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1.15rem' }}
              onClick={onEnterApp}
            >
              <span>Access System</span>
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
          <Sparkles size={15} />
          <span>Practical Assessment • AI Engineering Intern</span>
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
          Next-Generation Clinical Appointment & Multi-Portal Administration
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#64748b',
            maxWidth: '780px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          A unified, high-performance healthcare management platform built with <strong>React</strong>,{' '}
          <strong>Go (Golang)</strong>, and <strong>Neon Serverless PostgreSQL</strong>. Enforces relational data integrity, verified SLMC practitioner onboarding, and instant sudden leave alerts.
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
            <span>Launch Administration Portal</span>
            <ArrowRight size={18} />
          </button>

          <button
            id="hero-btn-signup"
            className="btn btn-secondary"
            style={{ fontSize: '1rem', padding: '0.85rem 1.75rem', borderRadius: '12px' }}
            onClick={() => onOpenAuth('signup')}
          >
            <Users size={18} />
            <span>Register as Patient</span>
          </button>
        </div>

        {/* Quick Reviewer 1-Click Launch Bar */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '920px',
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
            ⚡ Reviewer Quick-Access Profiles (1-Click Instant Login)
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.65rem', textAlign: 'left' }}
              onClick={() => onQuickDemo('super_admin')}
            >
              <Crown size={16} color="#d97706" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>Super Admin</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Onboard Doctors & SLMC</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.65rem', textAlign: 'left' }}
              onClick={() => onQuickDemo('admin')}
            >
              <Building size={16} color="#0284c7" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>General Admin</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hospital Appointments</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.65rem', textAlign: 'left' }}
              onClick={() => onQuickDemo('doctor')}
            >
              <Stethoscope size={16} color="#0d9488" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>Dr. Vance</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cardiologist Workspace</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.65rem', textAlign: 'left', background: '#fffbeb', borderColor: '#fde68a' }}
              onClick={() => onQuickDemo('doctor_temp')}
            >
              <Lock size={16} color="#b45309" />
              <div>
                <strong style={{ fontSize: '0.8125rem' }}>Dr. Chen (Temp)</strong>
                <div style={{ fontSize: '0.7rem', color: '#b45309' }}>Test Password Rotation</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ maxWidth: '1280px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Three Dedicated Role-Based Workspaces
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Tailored interfaces designed specifically for administrators, clinicians, and reception staff.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1: General Admin */}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>General Administration Portal</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Comprehensive appointment booking, multi-criteria filtering, live debounced search, and immediate awareness of sudden doctor schedule adjustments via broadcast banners.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0d9488" /> Doctor conflict & double-booking prevention
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0d9488" /> Real-time search across patients & notes
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0d9488" /> Emergency leave alert acknowledgment
              </li>
            </ul>
          </div>

          {/* Card 2: Super Admin */}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Super Admin Portal</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Physician onboarding with Sri Lanka Medical Council (SLMC) registration verification, automated temporary credential issuance, recurring duty hours customizer, and email outbox audit.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#d97706" /> Practitioner onboarding with SLMC Reg No
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#d97706" /> Weekly schedule & slot duration customizer
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#d97706" /> Transactional mailer outbox audit trail
              </li>
            </ul>
          </div>

          {/* Card 3: Doctor Portal */}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Personalized Doctor Portal</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Clinician consultation workspace showing daily patient appointments, inline visit progression (Start Consultation $\to$ Mark Completed), duty schedule management, and emergency leave reporting.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#334155' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0f766e" /> Dedicated consultation roster & patient history
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0f766e" /> Direct consultation status progression
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#0f766e" /> Broadcast sudden leaves/shifts to front desk
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
            Built with <strong>React</strong> • <strong>Go</strong> • <strong>Neon PostgreSQL Cloud</strong> • <strong>Docker</strong>
          </div>
          <div>
            AI Engineering Intern Assessment • Candidate: <strong>Rathnayake</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
