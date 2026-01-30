import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { Milestone, MilestoneStatus, InfrastructureTask } from '../../types/index';

// Status options
const statusOptions: { value: MilestoneStatus; label: string; color: string }[] = [
  { value: 'locked', label: 'Gesperrt', color: 'bg-slate-400' },
  { value: 'open', label: 'Offen', color: 'bg-blue-500' },
  { value: 'submitted', label: 'Eingereicht', color: 'bg-amber-500' },
  { value: 'in_review', label: 'In Prüfung', color: 'bg-purple-500' },
  { value: 'done', label: 'Abgeschlossen', color: 'bg-green-500' },
];

// Milestone Editor Component
function MilestoneEditor({ 
  milestone, 
  onUpdate, 
  onStatusChange 
}: { 
  milestone: Milestone; 
  onUpdate: (m: Milestone) => void;
  onStatusChange: (id: string, status: MilestoneStatus) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(milestone.title);
  const [editDescription, setEditDescription] = useState(milestone.description);
  const [editDueDate, setEditDueDate] = useState(format(parseISO(milestone.dueDate), 'yyyy-MM-dd'));
  const [editActionUrl, setEditActionUrl] = useState(milestone.actionUrl || '');
  const [editActionLabel, setEditActionLabel] = useState(milestone.actionLabel || '');
  
  const daysOverdue = differenceInDays(new Date(), parseISO(milestone.dueDate));
  const isOverdue = milestone.status !== 'done' && milestone.status !== 'locked' && daysOverdue > 0;
  
  const handleSave = () => {
    onUpdate({
      ...milestone,
      title: editTitle,
      description: editDescription,
      dueDate: new Date(editDueDate).toISOString(),
      actionUrl: editActionUrl || undefined,
      actionLabel: editActionLabel || undefined,
    });
    setIsEditing(false);
  };
  
  const currentStatus = statusOptions.find(s => s.value === milestone.status);
  
  return (
    <div className={`border rounded-lg p-4 ${
      milestone.status === 'done' 
        ? 'bg-green-50 border-green-200' 
        : isOverdue 
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-start gap-4">
        {/* Order Number */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          milestone.status === 'done'
            ? 'bg-green-500 text-white'
            : milestone.owner === 'client'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {milestone.status === 'done' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            milestone.order
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fälligkeitsdatum</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Action URL</label>
                  <input
                    type="url"
                    value={editActionUrl}
                    onChange={(e) => setEditActionUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Action Button Label</label>
                <input
                  type="text"
                  value={editActionLabel}
                  onChange={(e) => setEditActionLabel(e.target.value)}
                  placeholder="z.B. 'Zum Google Drive Ordner'"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-600 text-sm font-medium hover:text-slate-800"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{milestone.description}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  milestone.owner === 'client' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {milestone.owner === 'client' ? 'Kunde' : 'Agentur'}
                </span>
                
                <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                  Fällig: {format(parseISO(milestone.dueDate), 'd. MMMM yyyy', { locale: de })}
                  {isOverdue && ` (${daysOverdue} Tage überfällig)`}
                </span>
                
                {milestone.actionUrl && (
                  <a
                    href={milestone.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {milestone.actionLabel || 'Link öffnen'}
                  </a>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Status Dropdown */}
        {!isEditing && (
          <div>
            <select
              value={milestone.status}
              onChange={(e) => onStatusChange(milestone.id, e.target.value as MilestoneStatus)}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-white border-0 cursor-pointer ${currentStatus?.color}`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-slate-900 bg-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// Infrastructure Checklist Component
function InfrastructureChecklist({ 
  tasks, 
  onToggle 
}: { 
  tasks: InfrastructureTask[]; 
  onToggle: (task: InfrastructureTask) => void;
}) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <label
          key={task.id}
          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle({ ...task, completed: !task.completed })}
            className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
          />
          <span className={task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}>
            {task.title}
          </span>
        </label>
      ))}
    </div>
  );
}

// Activity Log Component
function ActivityLog({ projectId }: { projectId: string }) {
  const { getActivityLogByProjectId } = useApp();
  const activities = getActivityLogByProjectId(projectId);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return '🎉';
      case 'milestone_status_changed':
        return '🔄';
      case 'milestone_submitted':
        return '✅';
      case 'deadline_cascade':
        return '📅';
      case 'escalation_sent':
        return '⚠️';
      case 'infrastructure_updated':
        return '🔧';
      default:
        return '📝';
    }
  };
  
  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p className="text-sm text-slate-500">Noch keine Aktivitäten.</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 text-sm">
            <span>{getActivityIcon(activity.type)}</span>
            <div>
              <p className="text-slate-900">{activity.message}</p>
              <p className="text-slate-400 text-xs">
                {format(parseISO(activity.timestamp), 'd. MMM yyyy, HH:mm', { locale: de })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getProjectById, 
    getClientById, 
    getMilestonesByProjectId, 
    getInfrastructureTasksByProjectId,
    updateProject,
    updateMilestone,
    updateMilestoneStatus,
    updateInfrastructureTask,
    deleteProject
  } = useApp();
  
  const project = id ? getProjectById(id) : undefined;
  const client = project ? getClientById(project.clientId) : undefined;
  const milestones = id ? getMilestonesByProjectId(id) : [];
  const infrastructureTasks = id ? getInfrastructureTasksByProjectId(id) : [];
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  if (!project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900 mb-4">Projekt nicht gefunden</h1>
        <Link to="/admin/projects" className="text-blue-600 hover:underline">
          Zurück zur Projektliste
        </Link>
      </div>
    );
  }
  
  const handleDelete = () => {
    deleteProject(project.id);
    navigate('/admin/projects');
  };
  
  const handleCascadeToggle = () => {
    updateProject({
      ...project,
      cascadePolicyEnabled: !project.cascadePolicyEnabled
    });
  };
  
  // Calculate progress
  const completedMilestones = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/admin/projects" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Zurück zur Projektliste
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-slate-600 mt-1">
            Kunde: {client?.name || 'Unbekannt'} • {client?.email}
          </p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          Projekt löschen
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Projekt löschen?</h3>
            <p className="text-slate-600 mb-6">
              Sind Sie sicher, dass Sie das Projekt "{project.title}" unwiderruflich löschen möchten?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Projektfortschritt</h2>
          <span className="text-sm text-slate-500">
            {completedMilestones}/{milestones.length} Meilensteine abgeschlossen
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cascade Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">Automatische Deadline-Kaskade</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Bei Verzögerungen werden alle nachfolgenden Meilensteine automatisch verschoben.
                </p>
              </div>
              <button
                onClick={handleCascadeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  project.cascadePolicyEnabled ? 'bg-green-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    project.cascadePolicyEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Timeline Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <MilestoneEditor
                  key={milestone.id}
                  milestone={milestone}
                  onUpdate={updateMilestone}
                  onStatusChange={updateMilestoneStatus}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Infrastructure Checklist */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Infrastruktur</h2>
            <InfrastructureChecklist
              tasks={infrastructureTasks}
              onToggle={updateInfrastructureTask}
            />
          </div>
          
          {/* Activity Log */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Aktivitätsprotokoll</h2>
            <div className="max-h-96 overflow-y-auto">
              <ActivityLog projectId={project.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
