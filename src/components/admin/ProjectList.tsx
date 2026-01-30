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
  const { getClientById, getMilestonesByProjectId } = useApp();
  
  const client = getClientById(project.clientId);
  const milestones = getMilestonesByProjectId(project.id);
  
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
      className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{project.title}</h3>
            <WarningBadge level={warningLevel} />
          </div>
          <p className="text-sm text-slate-500">{client?.name || 'Unbekannter Kunde'}</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
          {getProjectTypeLabel(project.type)}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-500">Fortschritt</span>
          <span className="font-medium text-slate-700">{completedMilestones}/{totalMilestones} Meilensteine</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Current Status */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${
          currentMilestone?.owner === 'client' ? 'bg-amber-500' : 'bg-blue-500'
        }`} />
        <span className="text-slate-600">{getStatusLabel(currentMilestone)}</span>
      </div>
      
      {/* Due Date */}
      {currentMilestone && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          Fällig: {format(parseISO(currentMilestone.dueDate), 'd. MMMM yyyy', { locale: de })}
        </div>
      )}
    </Link>
  );
}

export default function ProjectList() {
  const { state } = useApp();
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projekte</h1>
          <p className="text-slate-600 mt-1">
            {state.projects.length} {state.projects.length === 1 ? 'Projekt' : 'Projekte'} insgesamt
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neues Projekt
        </Link>
      </div>
      
      {/* Project Grid */}
      {state.projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Noch keine Projekte</h3>
          <p className="text-slate-500 mb-6">Erstellen Sie Ihr erstes Projekt, um loszulegen.</p>
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neues Projekt erstellen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
