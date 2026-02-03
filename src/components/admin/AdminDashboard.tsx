import { Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import EscalationPanel from './EscalationPanel';

// Hilfsfunktion für Projekttyp-Labels
const getProjectTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    landingpage: 'Landingpage',
    website: 'Website',
    software: 'Software Development'
  };
  return labels[type] || type;
};

export default function AdminDashboard() {
  const { state, getClientById, getMilestonesByProjectId } = useApp();

  // Berechne Statistiken
  const waitingOnClient = state.milestones.filter(
    m => m.owner === 'client' && (m.status === 'open' || m.status === 'submitted')
  ).length;
  
  // Finde kritische Projekte (7+ Tage überfällig)
  const criticalProjects = state.projects.filter(project => {
    const milestones = getMilestonesByProjectId(project.id);
    const currentMilestone = milestones.find(m => m.status !== 'done' && m.status !== 'locked');
    if (!currentMilestone || currentMilestone.owner !== 'client') return false;
    
    const daysOverdue = differenceInDays(new Date(), parseISO(currentMilestone.dueDate));
    return daysOverdue >= 7;
  });

  // Finde Projekte, die Aufmerksamkeit brauchen
  const projectsNeedingAttention = state.projects.filter(project => {
    const milestones = getMilestonesByProjectId(project.id);
    const currentMilestone = milestones.find(m => m.status === 'submitted' || m.status === 'in_review');
    return currentMilestone !== undefined;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900">
          Willkommen, {state.currentUser?.name?.split(' ')[0]}!
        </h1>
        <p className="text-dark-600 mt-1">
          Hier ist Ihre Übersicht für heute.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-dark-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-500">Aktive Projekte</p>
              <p className="text-2xl font-bold text-dark-900">{state.projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-dark-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-500">Kunden</p>
              <p className="text-2xl font-bold text-dark-900">{state.clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-dark-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-500">Wartend auf Kunden</p>
              <p className="text-2xl font-bold text-dark-900">{waitingOnClient}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-dark-200">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              criticalProjects.length > 0 ? 'bg-red-100' : 'bg-dark-100'
            }`}>
              <svg className={`w-6 h-6 ${criticalProjects.length > 0 ? 'text-red-600' : 'text-dark-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-500">Kritisch</p>
              <p className={`text-2xl font-bold ${criticalProjects.length > 0 ? 'text-red-600' : 'text-dark-900'}`}>
                {criticalProjects.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Panel */}
      <div className="mb-8">
        <EscalationPanel />
      </div>

      {/* Critical Projects Alert */}
      {criticalProjects.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Achtung: Kritische Projekte</h3>
              <p className="text-sm text-red-700 mt-1">
                {criticalProjects.length} {criticalProjects.length === 1 ? 'Projekt ist' : 'Projekte sind'} seit mehr als 7 Tagen blockiert.
              </p>
              <div className="mt-2 space-y-1">
                {criticalProjects.map(project => {
                  const client = getClientById(project.clientId);
                  return (
                    <Link
                      key={project.id}
                      to={`/admin/projects/${project.id}`}
                      className="text-sm text-red-800 font-medium hover:underline block"
                    >
                      → {project.title} ({client?.name})
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Needing Attention */}
      {projectsNeedingAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800">Kunden-Einreichungen prüfen</h3>
              <p className="text-sm text-amber-700 mt-1">
                {projectsNeedingAttention.length} {projectsNeedingAttention.length === 1 ? 'Projekt wartet' : 'Projekte warten'} auf Ihre Prüfung.
              </p>
              <div className="mt-2 space-y-1">
                {projectsNeedingAttention.map(project => {
                  const client = getClientById(project.clientId);
                  return (
                    <Link
                      key={project.id}
                      to={`/admin/projects/${project.id}`}
                      className="text-sm text-amber-800 font-medium hover:underline block"
                    >
                      → {project.title} ({client?.name})
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project List or Empty State */}
      {state.projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-12 text-center">
          <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">
            Noch keine Projekte
          </h3>
          <p className="text-dark-500 mb-6 max-w-sm mx-auto">
            Erstellen Sie Ihr erstes Projekt, um das System in Aktion zu sehen.
          </p>
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
        <div className="bg-white rounded-xl shadow-sm border border-dark-200">
          <div className="p-6 border-b border-dark-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-900">Aktuelle Projekte</h2>
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Neues Projekt
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {state.projects.slice(0, 5).map(project => {
              const client = getClientById(project.clientId);
              const milestones = getMilestonesByProjectId(project.id);
              const completedMilestones = milestones.filter(m => m.status === 'done').length;
              const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;
              const currentMilestone = milestones.find(m => m.status !== 'done' && m.status !== 'locked');
              
              // Check if overdue
              let isOverdue = false;
              let daysOverdue = 0;
              if (currentMilestone && currentMilestone.owner === 'client') {
                daysOverdue = differenceInDays(new Date(), parseISO(currentMilestone.dueDate));
                isOverdue = daysOverdue > 0;
              }
              
              return (
                <Link
                  key={project.id}
                  to={`/admin/projects/${project.id}`}
                  className="flex items-center gap-6 p-6 hover:bg-dark-50 transition-colors"
                >
                  {/* Warning Badge */}
                  <div className="w-8 flex justify-center">
                    {daysOverdue >= 7 ? (
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    ) : isOverdue ? (
                      <span className="w-3 h-3 bg-amber-500 rounded-full" />
                    ) : (
                      <span className="w-3 h-3 bg-primary-500 rounded-full" />
                    )}
                  </div>
                  
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-dark-900 truncate">{project.title}</h3>
                      <span className="px-2 py-0.5 bg-dark-100 text-dark-600 text-xs rounded-full">
                        {getProjectTypeLabel(project.type)}
                      </span>
                    </div>
                    <p className="text-sm text-dark-500">{client?.name}</p>
                  </div>
                  
                  {/* Progress */}
                  <div className="w-32">
                    <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-dark-500 mt-1 text-right">
                      {completedMilestones}/{milestones.length}
                    </p>
                  </div>
                  
                  {/* Current Status */}
                  <div className="w-48 text-right">
                    {currentMilestone ? (
                      <div>
                        <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-dark-600'}`}>
                          {currentMilestone.title}
                        </p>
                        <p className="text-xs text-dark-400">
                          {isOverdue 
                            ? `${daysOverdue} Tage überfällig`
                            : format(parseISO(currentMilestone.dueDate), 'd. MMM', { locale: de })
                          }
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-primary-600">Abgeschlossen</span>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
          {state.projects.length > 5 && (
            <div className="p-4 border-t border-dark-200 text-center">
              <Link
                to="/admin/projects"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Alle {state.projects.length} Projekte anzeigen →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
