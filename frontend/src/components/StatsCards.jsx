import React from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Users } from 'lucide-react';

export default function StatsCards({ stats, onSelectStatus, activeStatus }) {
  if (!stats) return null;

  const cards = [
    {
      id: 'all',
      title: 'Total Appointments',
      value: stats.total_appointments || 0,
      icon: Calendar,
      color: '#0284c7',
      bg: '#e0f2fe',
    },
    {
      id: 'Scheduled',
      title: 'Scheduled',
      value: stats.scheduled_count || 0,
      icon: Clock,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      id: 'In-Progress',
      title: 'In Progress',
      value: stats.in_progress_count || 0,
      icon: Clock,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      id: 'Completed',
      title: 'Completed',
      value: stats.completed_count || 0,
      icon: CheckCircle2,
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      id: 'Cancelled',
      title: 'Cancelled',
      value: stats.cancelled_count || 0,
      icon: XCircle,
      color: '#dc2626',
      bg: '#fef2f2',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatus === card.id || (card.id === 'all' && activeStatus === 'all');
        return (
          <div
            key={card.id}
            className="stat-card"
            style={{
              cursor: 'pointer',
              borderColor: isSelected ? card.color : undefined,
              boxShadow: isSelected ? `0 0 0 2px ${card.color}25` : undefined,
            }}
            onClick={() => onSelectStatus(card.id)}
            title={`Click to filter by ${card.title}`}
          >
            <div className="stat-info">
              <p>{card.title}</p>
              <h2>{card.value}</h2>
            </div>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <Icon size={22} strokeWidth={2.2} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
