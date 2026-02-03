import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { Project, Milestone } from '../../types/index';

// Hilfsfunktion für Projekttyp-Labels
const getProjectTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    landingpage: 'Landingpage',
    website: 'Website',
    software: 'Software Development'
  };
  return labels[type] || type;
};

// Hilfsfunktion für Status-Labels
const getStatusLabel = (milestone: Milestone | null): string => {
  if (!milestone) return 'Kein aktiver Meilenstein';
  
  const statusLabels: Record<string, string> = {
    locked: 'Gesperrt',
    open: 'Offen',
    submitted: 'Eingereicht',
    in_review: 'In Prüfung',
    done: 'Abgeschlossen'
  };
  
  return `${statusLabels[milestone.status] || milestone.status}: ${milestone.title}`;
};

// Komponente für Warnsymbole
function WarningBadge({ level }: { level: 'yellow' | 'red' | null }) {
  if (!level) return null;
  
  if (level === 'red') {
    return (
      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Kritisch
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      Überfällig
    </span>
  );
}

// Einzelne Projektkarte
function ProjectCard({ project }: { project: Project }) {
  const { getClientById, getMilestonesByProjectId, getEmployeeById } = useApp();
  
  const client = getClientById(project.clientId);
  const milestones = getMilestonesByProjectId(project.id);
  const leadEmployee = project.leadEmployeeId ? getEmployeeById(project.leadEmployeeId) : null;
  
  // Fortschritt berechnen
  const completedMilestones = milestones.filter(m => m.status === 'done').length;
  const totalMilestones = milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  // Aktueller Meilenstein (erster nicht abgeschlossener)
  const currentMilestone = milestones.find(m => m.status !== 'done' && m.status !== 'locked') || null;
  
  // Warnstufe berechnen
  let warningLevel: 'yellow' | 'red' | null = null;
  if (currentMilestone && currentMilestone.owner === 'client') {
    const dueDate = parseISO(currentMilestone.dueDate);
    const daysOverdue = differenceInDays(new Date(), dueDate);
    
    if (daysOverdue >= 7) {
      warningLevel = 'red';
    } else if (daysOverdue >= 1) {
      warningLevel = 'yellow';
    }
  }
  
  return (
    <Link
      to={`/admin/projects/${project.id}`}
      className="block bg-white rounded-xl shadow-sm border border-dark-200 p-6 hover:shadow-md hover:border-dark-300 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-dark-900">{project.title}</h3>
            <WarningBadge level={warningLevel} />
          </div>
          <p className="text-sm text-dark-500">{client?.name || 'Unbekannter Kunde'}</p>
        </div>
        <div className="flex items-center gap-2">
          {leadEmployee && (
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: leadEmployee.color }}
              title={leadEmployee.name}
            >
              {leadEmployee.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <span className="px-3 py-1 bg-dark-100 text-dark-600 text-xs font-medium rounded-full">
            {getProjectTypeLabel(project.type)}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-dark-500">Fortschritt</span>
          <span className="font-medium text-dark-700">{completedMilestones}/{totalMilestones} Meilensteine</span>
        </div>
        <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Current Status */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${
          currentMilestone?.owner === 'client' ? 'bg-amber-500' : 'bg-primary-500'
        }`} />
        <span className="text-dark-600">{getStatusLabel(currentMilestone)}</span>
      </div>
      
      {/* Due Date */}
      {currentMilestone && (
        <div className="mt-3 pt-3 border-t border-dark-100 text-xs text-dark-500">
          Fällig: {format(parseISO(currentMilestone.dueDate), 'd. MMMM yyyy', { locale: de })}
        </div>
      )}
    </Link>
  );
}

export default function ProjectList() {
  const { state, getClientById } = useApp();
  const [filterEmployee, setFilterEmployee] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const employees = state.employees || [];

  // Filter Projects
  const filteredProjects = state.projects.filter(project => {
    // Employee Filter
    if (filterEmployee && !project.assignedEmployeeIds?.includes(filterEmployee) && project.leadEmployeeId !== filterEmployee) {
      return false;
    }

    // Search Query (Project Title or Client Name)
    if (searchQuery) {
      const client = getClientById(project.clientId);
      const searchLower = searchQuery.toLowerCase();
      if (
        !project.title.toLowerCase().includes(searchLower) &&
        !client?.name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Projekte</h1>
          <p className="text-dark-600 mt-1">
            {filteredProjects.length} von {state.projects.length} {state.projects.length === 1 ? 'Projekt' : 'Projekten'}
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neues Projekt
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="w-5 h-5 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Projekt oder Kunde suchen..."
                className="w-full pl-10 pr-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Employee Filter */}
          <div className="min-w-[180px]">
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Alle Mitarbeiter</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(filterEmployee || searchQuery) && (
            <button
              onClick={() => { setFilterEmployee(''); setSearchQuery(''); }}
              className="px-3 py-2 text-sm text-dark-500 hover:text-dark-700 hover:bg-dark-100 rounded-lg transition-colors"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>
      
      {/* Project Grid */}
      {filteredProjects.length === 0 && state.projects.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-12 text-center">
          <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">Keine Projekte gefunden</h3>
          <p className="text-dark-500 mb-4">Versuche andere Filterkriterien.</p>
          <button
            onClick={() => { setFilterEmployee(''); setSearchQuery(''); }}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Alle Projekte anzeigen
          </button>
        </div>
      ) : state.projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-12 text-center">
          <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">Noch keine Projekte</h3>
          <p className="text-dark-500 mb-6">Erstellen Sie Ihr erstes Projekt, um loszulegen.</p>
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neues Projekt erstellen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
