import { useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { Milestone, Project } from '../../types/index';

// Komponente für die minimalistische Timeline
function MiniTimeline({ 
  milestones, 
  currentMilestoneId 
}: { 
  milestones: Milestone[]; 
  currentMilestoneId: string | null;
}) {
  return (
    <div className="flex items-center gap-1">
      {milestones.map((milestone, index) => {
        const isCurrent = milestone.id === currentMilestoneId;
        const isDone = milestone.status === 'done';
        const isLocked = milestone.status === 'locked';
        
        return (
          <div key={milestone.id} className="flex items-center">
            {/* Milestone Dot */}
            <div
              className={`relative group ${
                isDone
                  ? 'cursor-default'
                  : isCurrent
                  ? 'cursor-default'
                  : 'cursor-default'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isDone
                    ? 'bg-primary-500 border-primary-500'
                    : isCurrent
                    ? 'bg-primary-500 border-primary-500 ring-4 ring-primary-100'
                    : isLocked
                    ? 'bg-dark-200 border-dark-300'
                    : 'bg-white border-dark-300'
                }`}
              >
                {isDone && (
                  <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {milestone.title}
                {isDone && ' ✓'}
                {isCurrent && ' (Aktuell)'}
                {isLocked && ' 🔒'}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < milestones.length - 1 && (
              <div
                className={`w-6 h-0.5 ${
                  isDone ? 'bg-primary-500' : 'bg-dark-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Erweiterte Timeline-Ansicht
function ExpandedTimeline({ 
  milestones, 
  currentMilestoneId 
}: { 
  milestones: Milestone[]; 
  currentMilestoneId: string | null;
}) {
  return (
    <div className="space-y-3">
      {milestones.map((milestone, index) => {
        const isCurrent = milestone.id === currentMilestoneId;
        const isDone = milestone.status === 'done';
        const isLocked = milestone.status === 'locked';
        
        return (
          <div 
            key={milestone.id} 
            className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
              isCurrent 
                ? 'bg-primary-50 border border-primary-200' 
                : isDone
                ? 'bg-primary-50 border border-primary-100'
                : 'bg-dark-50 border border-transparent'
            }`}
          >
            {/* Status Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDone
                ? 'bg-primary-500 text-white'
                : isCurrent
                ? 'bg-primary-500 text-white'
                : isLocked
                ? 'bg-dark-200 text-dark-400'
                : 'bg-dark-300 text-dark-500'
            }`}>
              {isDone ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isLocked ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${
                isDone ? 'text-primary-800' : isCurrent ? 'text-primary-900' : isLocked ? 'text-dark-400' : 'text-dark-700'
              }`}>
                {milestone.title}
              </div>
              <div className={`text-sm ${
                isDone ? 'text-primary-600' : isCurrent ? 'text-primary-600' : 'text-dark-400'
              }`}>
                {milestone.owner === 'client' ? 'Ihre Aufgabe' : 'Agentur'}
                {!isLocked && !isDone && (
                  <> • Fällig: {format(parseISO(milestone.dueDate), 'd. MMM', { locale: de })}</>
                )}
              </div>
            </div>
            
            {/* Status Badge */}
            {isCurrent && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                Aktuell
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Hauptkomponente für die aktuelle Aufgabe
function CurrentTaskCard({ 
  milestone, 
  project,
  onSubmit 
}: { 
  milestone: Milestone; 
  project: Project;
  onSubmit: () => void;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dueDate = parseISO(milestone.dueDate);
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const isOverdue = daysUntilDue < 0;
  const isSubmitted = milestone.status === 'submitted';
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit();
    setShowConfirmation(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };
  
  // Wenn bereits eingereicht
  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-3xl p-8 md:p-12 border border-primary-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">
            Vielen Dank!
          </h2>
          <p className="text-primary-700 max-w-md mx-auto">
            Wir haben Ihre Einreichung für "{milestone.title}" erhalten und prüfen diese. 
            Sie werden benachrichtigt, sobald wir weitermachen können.
          </p>
          <div className="mt-6 text-sm text-primary-600">
            Eingereicht am {milestone.submittedAt 
              ? format(parseISO(milestone.submittedAt), 'd. MMMM yyyy, HH:mm', { locale: de })
              : 'gerade'
            }
          </div>
        </div>
      </div>
    );
  }
  
  // Bestätigungs-Modal
  if (showConfirmation) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-3xl p-8 md:p-12 border border-primary-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">
            Vielen Dank!
          </h2>
          <p className="text-primary-700 max-w-md mx-auto">
            Wir prüfen Ihre Unterlagen und melden uns bei Ihnen.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`rounded-3xl p-8 md:p-12 border-2 ${
      isOverdue 
        ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-primary-200'
    }`}>
      {/* Badge */}
      <div className="flex items-center justify-between mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isOverdue 
            ? 'bg-red-100 text-red-700' 
            : 'bg-primary-100 text-primary-700'
        }`}>
          Ihr nächster Schritt
        </span>
        <span className="text-sm text-dark-500">
          {project.title}
        </span>
      </div>
      
      {/* Title */}
      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
        isOverdue ? 'text-red-900' : 'text-dark-900'
      }`}>
        {milestone.title}
      </h2>
      
      {/* Description */}
      <p className="text-lg text-dark-600 mb-8">
        {milestone.description}
      </p>
      
      {/* Due Date */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${
        isOverdue 
          ? 'bg-red-100 text-red-700' 
          : daysUntilDue <= 2 
          ? 'bg-amber-100 text-amber-700'
          : 'bg-dark-100 text-dark-700'
      }`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">
          {isOverdue 
            ? `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'Tag' : 'Tage'} überfällig`
            : daysUntilDue === 0
            ? 'Heute fällig'
            : daysUntilDue === 1
            ? 'Morgen fällig'
            : `Fällig in ${daysUntilDue} Tagen`
          }
        </span>
        <span className="text-sm opacity-75">
          ({format(dueDate, 'd. MMMM yyyy', { locale: de })})
        </span>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {milestone.actionUrl && (
          <a
            href={milestone.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
              isOverdue
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {milestone.actionLabel || 'Aufgabe öffnen'}
          </a>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl font-semibold text-lg transition-all"
        >
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Wird gesendet...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ich habe alles erledigt
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Warten auf Agentur-Ansicht
function WaitingOnAgency({ milestone, project }: { milestone: Milestone; project: Project }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-purple-200">
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          {project.title}
        </span>
        <h2 className="text-2xl font-bold text-purple-900 mt-4 mb-2">
          Wir arbeiten für Sie
        </h2>
        <p className="text-purple-700 max-w-md mx-auto mb-6">
          {milestone.title}
        </p>
        <p className="text-sm text-purple-600">
          Wir melden uns bei Ihnen, sobald wir den nächsten Schritt abgeschlossen haben.
        </p>
        <div className="mt-6 text-sm text-purple-500">
          Erwartete Fertigstellung: {format(parseISO(milestone.dueDate), 'd. MMMM yyyy', { locale: de })}
        </div>
      </div>
    </div>
  );
}

// Projekt abgeschlossen Ansicht
function ProjectCompleted({ project }: { project: Project }) {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-3xl p-8 md:p-12 border border-primary-200">
      <div className="text-center">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-primary-800 mb-2">
          Herzlichen Glückwunsch!
        </h2>
        <p className="text-xl text-primary-700 mb-4">
          {project.title}
        </p>
        <p className="text-primary-600 max-w-md mx-auto">
          Ihr Projekt wurde erfolgreich abgeschlossen. Vielen Dank für die tolle Zusammenarbeit!
        </p>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { state, getProjectsByClientId, getMilestonesByProjectId, submitMilestone } = useApp();
  const [showTimeline, setShowTimeline] = useState(false);

  // Finde das Projekt des aktuellen Kunden
  const clientId = state.currentUser?.clientId;
  const projects = clientId ? getProjectsByClientId(clientId) : [];
  
  // Hole das erste aktive Projekt
  const project = projects[0];
  const milestones = project ? getMilestonesByProjectId(project.id) : [];
  
  // Finde den aktuellen Meilenstein (erster nicht abgeschlossener)
  const currentMilestone = milestones.find(
    m => m.status !== 'done' && m.status !== 'locked'
  );
  
  // Prüfe ob alle Meilensteine abgeschlossen sind
  const isProjectCompleted = project && milestones.length > 0 && milestones.every(m => m.status === 'done');
  
  // Berechne Fortschritt
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  const handleSubmit = () => {
    if (currentMilestone) {
      submitMilestone(currentMilestone.id);
    }
  };

  return (
    <div>
      {/* Begrüßung */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900">
          Hallo, {state.currentUser?.name?.split(' ')[0]}!
        </h1>
        <p className="text-dark-600 mt-1">
          {project 
            ? 'Hier ist Ihr aktueller Projektstand.' 
            : 'Willkommen in Ihrem Projekt-Portal.'
          }
        </p>
      </div>

      {!project ? (
        /* Empty State */
        <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-12 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-dark-900 mb-2">
            Noch kein aktives Projekt
          </h2>
          <p className="text-dark-500 max-w-md mx-auto">
            Ihr Projektmanager wird in Kürze ein Projekt für Sie anlegen. 
            Sie werden dann automatisch per E-Mail benachrichtigt.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-dark-700">Projektfortschritt</span>
              <span className="text-sm text-dark-500">
                {completedCount} von {milestones.length} Schritten abgeschlossen
              </span>
            </div>
            <div className="h-3 bg-dark-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Mini Timeline (always visible) */}
          <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-dark-700">Timeline</span>
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showTimeline ? 'Minimieren' : 'Details anzeigen'}
              </button>
            </div>
            
            {showTimeline ? (
              <ExpandedTimeline 
                milestones={milestones} 
                currentMilestoneId={currentMilestone?.id || null} 
              />
            ) : (
              <div className="flex justify-center py-2">
                <MiniTimeline 
                  milestones={milestones} 
                  currentMilestoneId={currentMilestone?.id || null} 
                />
              </div>
            )}
          </div>

          {/* Main Task Card */}
          {isProjectCompleted ? (
            <ProjectCompleted project={project} />
          ) : currentMilestone ? (
            currentMilestone.owner === 'client' ? (
              <CurrentTaskCard 
                milestone={currentMilestone} 
                project={project}
                onSubmit={handleSubmit} 
              />
            ) : (
              <WaitingOnAgency milestone={currentMilestone} project={project} />
            )
          ) : null}
        </div>
      )}
    </div>
  );
}
