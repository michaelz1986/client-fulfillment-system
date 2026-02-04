import { useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { Milestone, Project, FileCategory } from '../../types/index';

// Beruhigende Nachrichten basierend auf Fortschritt
const getEncouragingMessage = (progress: number, remainingSteps: number): string => {
  if (progress === 100) return "Geschafft! Ihr Projekt ist abgeschlossen.";
  if (progress >= 80) return "Fast geschafft! Sie sind auf der Zielgeraden.";
  if (progress >= 60) return "Großartig! Mehr als die Hälfte ist geschafft.";
  if (progress >= 40) return "Sie machen tolle Fortschritte!";
  if (progress >= 20) return "Gut gestartet! Wir sind auf einem guten Weg.";
  return "Willkommen! Lassen Sie uns gemeinsam starten.";
};

// Fortschritts-Ring Komponente
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Hintergrund-Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fortschritts-Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-dark-900">{Math.round(progress)}%</span>
        <span className="text-xs text-dark-500">abgeschlossen</span>
      </div>
    </div>
  );
}

// Ansprechpartner-Karte
function ContactCard({ employeeId }: { employeeId?: string }) {
  const { getEmployeeById } = useApp();
  const employee = employeeId ? getEmployeeById(employeeId) : null;

  if (!employee) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
      <p className="text-xs text-dark-500 uppercase tracking-wider mb-3">Ihr Ansprechpartner</p>
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold"
          style={{ backgroundColor: employee.color }}
        >
          {employee.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-dark-900">{employee.name}</p>
          <p className="text-sm text-dark-500">{employee.role}</p>
        </div>
      </div>
      {employee.calendlyUrl && (
        <a
          href={employee.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Termin vereinbaren
        </a>
      )}
    </div>
  );
}

// Erfolgs-Checkliste
function SuccessChecklist({ milestones }: { milestones: Milestone[] }) {
  const completedMilestones = milestones.filter(m => m.status === 'done');
  
  if (completedMilestones.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-medium text-dark-900">Bereits erledigt</p>
      </div>
      <div className="space-y-2">
        {completedMilestones.slice(-3).map((m) => (
          <div key={m.id} className="flex items-center gap-3 text-sm">
            <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-dark-600">{m.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Nächste Schritte Vorschau
function UpcomingSteps({ milestones, currentMilestoneId }: { milestones: Milestone[]; currentMilestoneId: string | null }) {
  const currentIndex = milestones.findIndex(m => m.id === currentMilestoneId);
  const upcomingMilestones = milestones.slice(currentIndex + 1, currentIndex + 4);
  
  if (upcomingMilestones.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-dark-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <p className="font-medium text-dark-900">Nächste Schritte</p>
      </div>
      <div className="space-y-3">
        {upcomingMilestones.map((m, index) => (
          <div key={m.id} className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-dark-100 flex items-center justify-center text-dark-400 text-xs">
              {index + 1}
            </div>
            <span className="text-dark-500">{m.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hauptkomponente für die aktuelle Aufgabe - beruhigender Stil
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
  
  if (isSubmitted || showConfirmation) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-3xl p-8 border border-primary-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">
            Perfekt erledigt!
          </h2>
          <p className="text-primary-700 max-w-md mx-auto">
            Wir prüfen "{milestone.title}" und melden uns bei Ihnen. Lehnen Sie sich zurück!
          </p>
          <div className="mt-6 text-sm text-primary-600">
            {milestone.submittedAt 
              ? `Eingereicht am ${format(parseISO(milestone.submittedAt), 'd. MMMM yyyy, HH:mm', { locale: de })}`
              : 'Gerade eingereicht'
            }
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-dark-200 overflow-hidden">
      {/* Sanfter Header */}
      <div className="bg-gradient-to-r from-primary-500 to-teal-500 px-8 py-4">
        <div className="flex items-center justify-between">
          <span className="text-white/90 text-sm font-medium">Ihr aktueller Schritt</span>
          {!isOverdue && (
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
              {daysUntilDue === 0 
                ? 'Heute' 
                : daysUntilDue === 1 
                ? 'Morgen' 
                : `Noch ${daysUntilDue} Tage Zeit`
              }
            </span>
          )}
          {isOverdue && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
              Bitte erledigen
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-dark-900 mb-3">
          {milestone.title}
        </h2>
        
        <p className="text-dark-600 mb-6 leading-relaxed">
          {milestone.description}
        </p>
        
        {/* Deadline - freundlich formuliert */}
        <div className="flex items-center gap-3 mb-8 text-sm text-dark-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Ideal bis {format(dueDate, 'd. MMMM yyyy', { locale: de })}</span>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {milestone.actionUrl && (
            <a
              href={milestone.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-dark-100 hover:bg-dark-200 text-dark-700 rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {milestone.actionLabel || 'Aufgabe ansehen'}
            </a>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow"
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
                Fertig - Weiter geht's!
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Warten auf Agentur - beruhigend
function WaitingOnAgency({ milestone, project }: { milestone: Milestone; project: Project }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-sm text-blue-600 font-medium mb-2">Wir arbeiten für Sie</p>
        <h2 className="text-2xl font-bold text-dark-900 mb-3">
          {milestone.title}
        </h2>
        <p className="text-dark-600 max-w-md mx-auto mb-6">
          Unser Team ist gerade an Ihrem Projekt. Sie müssen nichts tun - wir melden uns!
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-dark-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Voraussichtlich bis {format(parseISO(milestone.dueDate), 'd. MMMM', { locale: de })}
        </div>
      </div>
    </div>
  );
}

// Projekt abgeschlossen - Feier!
function ProjectCompleted({ project }: { project: Project }) {
  return (
    <div className="bg-gradient-to-br from-primary-50 via-teal-50 to-cyan-50 rounded-3xl p-8 border border-primary-100">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-dark-900 mb-3">
          Herzlichen Glückwunsch!
        </h2>
        <p className="text-xl text-primary-700 mb-2">
          {project.title}
        </p>
        <p className="text-dark-600 max-w-md mx-auto">
          Ihr Projekt wurde erfolgreich abgeschlossen. Vielen Dank für die tolle Zusammenarbeit!
        </p>
      </div>
    </div>
  );
}

// Vollständige Timeline-Übersicht
function FullTimeline({ milestones, currentMilestoneId }: { milestones: Milestone[]; currentMilestoneId: string | null }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
      <h3 className="font-semibold text-dark-900 mb-4">Alle Projektschritte</h3>
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const isCurrent = milestone.id === currentMilestoneId;
          const isDone = milestone.status === 'done';
          const isLocked = milestone.status === 'locked';
          const dueDate = parseISO(milestone.dueDate);
          const isOverdue = !isDone && differenceInDays(new Date(), dueDate) > 0;
          
          return (
            <div 
              key={milestone.id} 
              className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                isCurrent 
                  ? 'bg-primary-50 border border-primary-200' 
                  : isDone
                  ? 'bg-dark-50'
                  : 'bg-white border border-dark-100'
              }`}
            >
              {/* Status Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone
                  ? 'bg-primary-500 text-white'
                  : isCurrent
                  ? 'bg-primary-500 text-white'
                  : isLocked
                  ? 'bg-dark-200 text-dark-400'
                  : 'bg-dark-300 text-dark-500'
              }`}>
                {isDone ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isLocked ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium ${
                      isDone ? 'text-dark-600' : isCurrent ? 'text-primary-900' : isLocked ? 'text-dark-400' : 'text-dark-700'
                    }`}>
                      {milestone.title}
                    </p>
                    <p className={`text-sm mt-0.5 ${
                      isDone ? 'text-dark-400' : isCurrent ? 'text-primary-600' : 'text-dark-400'
                    }`}>
                      {milestone.owner === 'client' ? 'Ihre Aufgabe' : 'Digitalisierungshilfe'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-medium ${
                      isDone ? 'text-primary-600' : isOverdue ? 'text-red-600' : 'text-dark-600'
                    }`}>
                      {format(dueDate, 'd. MMM yyyy', { locale: de })}
                    </p>
                    {isDone && milestone.completedAt && (
                      <p className="text-xs text-dark-400">
                        Erledigt am {format(parseISO(milestone.completedAt), 'd. MMM', { locale: de })}
                      </p>
                    )}
                    {isCurrent && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                        Aktuell
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// File Categories Configuration
const FILE_CATEGORIES: { value: FileCategory; label: string; icon: string; color: string; description: string }[] = [
  { 
    value: 'corporate_identity', 
    label: 'Corporate Identity & Logos', 
    icon: '🎨',
    color: 'purple',
    description: 'Logo, Farben, Schriften, Styleguides'
  },
  { 
    value: 'photos', 
    label: 'Fotos & Bilder', 
    icon: '📸',
    color: 'blue',
    description: 'Produktfotos, Team, Bildmaterial'
  },
  { 
    value: 'documents', 
    label: 'Dokumente & Texte', 
    icon: '📄',
    color: 'amber',
    description: 'Texte, PDFs, Word-Dokumente'
  },
  { 
    value: 'other', 
    label: 'Sonstige Dateien', 
    icon: '📁',
    color: 'slate',
    description: 'Alle anderen Dateien'
  }
];

const getCategoryConfig = (category: FileCategory) => {
  return FILE_CATEGORIES.find(c => c.value === category) || FILE_CATEGORIES[3];
};

const getCategoryColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-50' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', light: 'bg-slate-50' }
  };
  return colors[color] || colors.slate;
};

// Kunden-Uploads Bereich mit Kategorien
function ClientUploads({ projectId }: { projectId: string }) {
  const { getFilesByProjectId, addProjectFile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<FileCategory>('corporate_identity');
  
  const allFiles = getFilesByProjectId(projectId).filter(f => f.uploadedBy === 'client');
  
  // Dateien nach Kategorien gruppieren
  const filesByCategory = FILE_CATEGORIES.map(cat => ({
    ...cat,
    files: allFiles.filter(f => f.category === cat.value),
    colors: getCategoryColorClasses(cat.color)
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    Array.from(fileList).forEach(file => {
      addProjectFile({
        projectId,
        category: uploadCategory,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: 'client',
        url: URL.createObjectURL(file)
      });
    });
    
    e.target.value = '';
    setShowUploadModal(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-dark-900">Meine Uploads</h3>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Hochladen
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-dark-900">Dateien hochladen</h4>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-dark-400 hover:text-dark-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-dark-600 mb-4">Wählen Sie die Kategorie für Ihre Dateien:</p>
            
            <div className="space-y-2 mb-6">
              {FILE_CATEGORIES.map(cat => {
                const colors = getCategoryColorClasses(cat.color);
                return (
                  <button
                    key={cat.value}
                    onClick={() => setUploadCategory(cat.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      uploadCategory === cat.value 
                        ? `${colors.border} ${colors.light}` 
                        : 'border-dark-100 hover:border-dark-200'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-dark-900">{cat.label}</p>
                      <p className="text-xs text-dark-500">{cat.description}</p>
                    </div>
                    {uploadCategory === cat.value && (
                      <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            
            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-primary-300 rounded-xl bg-primary-50 cursor-pointer hover:bg-primary-100 transition-colors">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-primary-700 font-medium">Dateien auswählen</span>
              <span className="text-xs text-primary-500">oder per Drag & Drop</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
      
      {allFiles.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-dark-200 rounded-xl">
          <svg className="w-10 h-10 text-dark-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-dark-500 text-sm">Noch keine Dateien hochgeladen</p>
          <p className="text-dark-400 text-xs mt-1">Laden Sie hier Ihre Projektdateien hoch</p>
        </div>
      ) : selectedCategory === null ? (
        // Kategorien-Übersicht
        <div className="space-y-2">
          {filesByCategory.map((cat) => (
            <button
              key={cat.value}
              onClick={() => cat.files.length > 0 && setSelectedCategory(cat.value)}
              disabled={cat.files.length === 0}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                cat.files.length > 0 
                  ? `${cat.colors.light} hover:${cat.colors.bg} border ${cat.colors.border}` 
                  : 'bg-dark-50 border border-dark-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${cat.files.length > 0 ? 'text-dark-900' : 'text-dark-400'}`}>
                  {cat.label}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                cat.files.length > 0 ? `${cat.colors.bg} ${cat.colors.text}` : 'bg-dark-200 text-dark-400'
              }`}>
                {cat.files.length}
              </span>
              {cat.files.length > 0 && (
                <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      ) : (
        // Dateien in Kategorie
        <div>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Übersicht
          </button>
          
          {(() => {
            const catConfig = getCategoryConfig(selectedCategory);
            const colors = getCategoryColorClasses(catConfig.color);
            const files = allFiles.filter(f => f.category === selectedCategory);
            
            return (
              <>
                <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${colors.light}`}>
                  <span className="text-lg">{catConfig.icon}</span>
                  <span className={`font-medium text-sm ${colors.text}`}>{catConfig.label}</span>
                </div>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-900 truncate">{file.name}</p>
                        <p className="text-xs text-dark-500">
                          {(file.size / 1024).toFixed(1)} KB • {format(parseISO(file.uploadedAt), 'd. MMM yyyy', { locale: de })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function ClientDashboard() {
  const { state, getProjectsByClientId, getMilestonesByProjectId, submitMilestone } = useApp();
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const clientId = state.currentUser?.clientId;
  const projects = clientId ? getProjectsByClientId(clientId) : [];
  const project = projects[0];
  const milestones = project ? getMilestonesByProjectId(project.id) : [];
  
  const currentMilestone = milestones.find(
    m => m.status !== 'done' && m.status !== 'locked'
  );
  
  const isProjectCompleted = project && milestones.length > 0 && milestones.every(m => m.status === 'done');
  
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const remainingSteps = milestones.length - completedCount;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  const handleSubmit = () => {
    if (currentMilestone) {
      submitMilestone(currentMilestone.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header mit beruhigender Nachricht */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900">
          Hallo {state.currentUser?.name?.split(' ')[0]}!
        </h1>
        <p className="text-dark-600 mt-1">
          {project 
            ? getEncouragingMessage(progress, remainingSteps)
            : 'Willkommen in Ihrem Projekt-Portal.'
          }
        </p>
      </div>

      {!project ? (
        <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-12 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-dark-900 mb-2">
            Ihr Projekt wird vorbereitet
          </h2>
          <p className="text-dark-500 max-w-md mx-auto">
            Unser Team richtet gerade alles für Sie ein. Sie werden per E-Mail benachrichtigt, sobald es losgeht!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hauptbereich */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fortschritts-Übersicht - groß & zentral */}
            <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6">
              <div className="flex items-center gap-6">
                <ProgressRing progress={progress} />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-dark-900 mb-1">{project.title}</h2>
                  <p className="text-dark-500 mb-3">
                    {completedCount} von {milestones.length} Schritten erledigt
                  </p>
                  {!isProjectCompleted && (
                    <p className="text-sm text-primary-600 font-medium">
                      {remainingSteps === 1 
                        ? 'Nur noch 1 Schritt!' 
                        : `Nur noch ${remainingSteps} Schritte bis zum Ziel`
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Aktuelle Aufgabe */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ansprechpartner */}
            <ContactCard employeeId={project.leadEmployeeId} />

            {/* Meine Uploads */}
            <ClientUploads projectId={project.id} />
          </div>

          {/* Timeline Toggle Button */}
          <div className="lg:col-span-3">
            <button
              onClick={() => setShowFullTimeline(!showFullTimeline)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-dark-50 border border-dark-200 rounded-xl text-dark-600 font-medium transition-colors"
            >
              <svg className={`w-5 h-5 transition-transform ${showFullTimeline ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showFullTimeline ? 'Timeline ausblenden' : 'Alle Projektschritte anzeigen'}
            </button>
          </div>

          {/* Full Timeline */}
          {showFullTimeline && (
            <div className="lg:col-span-3">
              <FullTimeline milestones={milestones} currentMilestoneId={currentMilestone?.id || null} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
