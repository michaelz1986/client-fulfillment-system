import { Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { useEscalationEngine } from '../../hooks/useEscalationEngine';

export default function EscalationPanel() {
  const { state, getClientById, getProjectById } = useApp();
  const { getEscalationStatus, processEscalation, checkOverdueMilestones } = useEscalationEngine();
  
  // Finde alle überfälligen Kunden-Meilensteine
  const overdueMilestones = state.milestones
    .filter(m => {
      const { level } = getEscalationStatus(m.id);
      return level !== null;
    })
    .map(m => {
      const { level, daysOverdue } = getEscalationStatus(m.id);
      const project = getProjectById(m.projectId);
      const client = project ? getClientById(project.clientId) : null;
      return { milestone: m, level, daysOverdue, project, client };
    })
    .sort((a, b) => (b.level || 0) - (a.level || 0));
  
  if (overdueMilestones.length === 0) {
    return null;
  }
  
  const criticalCount = overdueMilestones.filter(m => m.level === 3).length;
  const warningCount = overdueMilestones.filter(m => m.level === 2).length;
  const reminderCount = overdueMilestones.filter(m => m.level === 1).length;
  
  const handleSendReminder = (milestoneId: string) => {
    const events = checkOverdueMilestones().filter(e => e.milestoneId === milestoneId);
    events.forEach(event => processEscalation(event));
    alert('Erinnerung wurde gesendet (simuliert für Prototyp)');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-red-50 to-amber-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Eskalations-Monitor
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {overdueMilestones.length} überfällige {overdueMilestones.length === 1 ? 'Aufgabe' : 'Aufgaben'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {criticalCount} kritisch
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {warningCount} dringend
              </span>
            )}
            {reminderCount > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {reminderCount} fällig
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        {overdueMilestones.map(({ milestone, level, daysOverdue, project, client }) => (
          <div 
            key={milestone.id} 
            className={`p-4 ${
              level === 3 ? 'bg-red-50' : level === 2 ? 'bg-amber-50' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Warning Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                level === 3 
                  ? 'bg-red-100 text-red-600' 
                  : level === 2 
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {level === 3 ? (
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                    level === 3 
                      ? 'bg-red-200 text-red-800' 
                      : level === 2 
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-blue-200 text-blue-800'
                  }`}>
                    {level === 3 ? 'KRITISCH' : level === 2 ? 'DRINGEND' : 'ERINNERUNG'}
                  </span>
                  <span className="text-sm text-slate-500">
                    {daysOverdue} {daysOverdue === 1 ? 'Tag' : 'Tage'} überfällig
                  </span>
                </div>
                
                <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                  <span>{client?.name || 'Unbekannt'}</span>
                  <span>•</span>
                  <Link 
                    to={`/admin/projects/${project?.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {project?.title || 'Unbekanntes Projekt'}
                  </Link>
                </div>
                
                <div className="text-xs text-slate-500 mt-1">
                  Ursprünglich fällig: {format(parseISO(milestone.dueDate), 'd. MMMM yyyy', { locale: de })}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendReminder(milestone.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    level === 3
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : level === 2
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Erinnerung senden
                </button>
                <Link
                  to={`/admin/projects/${project?.id}`}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                >
                  Öffnen
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
