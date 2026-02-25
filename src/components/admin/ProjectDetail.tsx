import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { Milestone, MilestoneStatus, InfrastructureTask, MilestoneOwner, MilestoneCategory, ProjectDocumentType, FileCategory } from '../../types/index';

// Status options
const statusOptions: { value: MilestoneStatus; label: string; color: string }[] = [
  { value: 'locked', label: 'Gesperrt', color: 'bg-dark-400' },
  { value: 'open', label: 'Offen', color: 'bg-primary-500' },
  { value: 'submitted', label: 'Eingereicht', color: 'bg-amber-500' },
  { value: 'in_review', label: 'In Prüfung', color: 'bg-purple-500' },
  { value: 'done', label: 'Abgeschlossen', color: 'bg-primary-500' },
];

// Milestone Editor Component
function MilestoneEditor({ 
  milestone, 
  onUpdate, 
  onStatusChange,
  onDelete
}: { 
  milestone: Milestone; 
  onUpdate: (m: Milestone) => void;
  onStatusChange: (id: string, status: MilestoneStatus) => void;
  onDelete: () => void;
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
        ? 'bg-primary-50 border-primary-200' 
        : isOverdue 
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-dark-200'
    }`}>
      <div className="flex items-start gap-4">
        {/* Order Number */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          milestone.status === 'done'
            ? 'bg-primary-500 text-white'
            : milestone.owner === 'client'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-primary-100 text-primary-800'
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
                <label className="block text-sm font-medium text-dark-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Beschreibung</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Fälligkeitsdatum</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Action URL</label>
                  <input
                    type="url"
                    value={editActionUrl}
                    onChange={(e) => setEditActionUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Action Button Label</label>
                <input
                  type="text"
                  value={editActionLabel}
                  onChange={(e) => setEditActionLabel(e.target.value)}
                  placeholder="z.B. 'Zum Google Drive Ordner'"
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-dark-600 text-sm font-medium hover:text-dark-800"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-dark-900">{milestone.title}</h4>
                  <p className="text-sm text-dark-500 mt-1">{milestone.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-dark-400 hover:text-dark-600"
                    title="Bearbeiten"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-dark-400 hover:text-red-600"
                    title="Löschen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  milestone.owner === 'client' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-primary-100 text-primary-800'
                }`}>
                  {milestone.owner === 'client' ? 'Kunde' : 'Agentur'}
                </span>
                
                <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-dark-500'}`}>
                  Fällig: {format(parseISO(milestone.dueDate), 'd. MMMM yyyy', { locale: de })}
                  {isOverdue && ` (${daysOverdue} Tage überfällig)`}
                </span>
                
                {milestone.actionUrl && (
                  <a
                    href={milestone.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline"
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
                <option key={option.value} value={option.value} className="text-dark-900 bg-white">
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
  projectId,
  onToggle,
  onAdd,
  onDelete
}: { 
  tasks: InfrastructureTask[]; 
  projectId: string;
  onToggle: (task: InfrastructureTask) => void;
  onAdd: (title: string) => void;
  onDelete: (taskId: string) => void;
}) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newItemTitle.trim()) {
      onAdd(newItemTitle.trim());
      setNewItemTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors group"
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle({ ...task, completed: !task.completed })}
            className="w-5 h-5 text-primary-600 border-dark-300 rounded focus:ring-primary-500 cursor-pointer"
          />
          <span className={`flex-1 ${task.completed ? 'text-dark-500 line-through' : 'text-dark-900'}`}>
            {task.title}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-dark-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Löschen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      
      {/* Add new item */}
      {isAdding ? (
        <div className="flex items-center gap-2 p-2">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Neues Item..."
            className="flex-1 px-3 py-2 text-sm border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewItemTitle(''); }}
            className="p-2 text-dark-400 hover:bg-dark-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 w-full p-3 text-sm text-dark-500 hover:text-primary-600 hover:bg-dark-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Item hinzufügen
        </button>
      )}
    </div>
  );
}

// Activity Log Component
function ActivityLog({ projectId, onDelete }: { projectId: string; onDelete: (activityId: string) => void }) {
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
        <p className="text-sm text-dark-500">Noch keine Aktivitäten.</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 text-sm group">
            <span>{getActivityIcon(activity.type)}</span>
            <div className="flex-1">
              <p className="text-dark-900">{activity.message}</p>
              <p className="text-dark-400 text-xs">
                {format(parseISO(activity.timestamp), 'd. MMM yyyy, HH:mm', { locale: de })}
              </p>
            </div>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-1 text-dark-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eintrag löschen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
    state,
    getProjectById, 
    getClientById, 
    getMilestonesByProjectId, 
    getInfrastructureTasksByProjectId,
    getFilesByProjectId,
    getEmployeeById,
    updateProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneStatus,
    updateInfrastructureTask,
    addInfrastructureTask,
    deleteInfrastructureTask,
    addProjectFile,
    deleteProjectFile,
    addProjectDocument,
    deleteProjectDocument,
    getDocumentsByProjectId,
    deleteActivityLog,
    deleteProject
  } = useApp();
  
  const project = id ? getProjectById(id) : undefined;
  const client = project ? getClientById(project.clientId) : undefined;
  const milestones = id ? getMilestonesByProjectId(id) : [];
  const infrastructureTasks = id ? getInfrastructureTasksByProjectId(id) : [];
  const projectFiles = id ? getFilesByProjectId(id) : [];
  const projectDocuments = id ? getDocumentsByProjectId(id) : [];
  const employees = state.employees || [];
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentType, setDocumentType] = useState<ProjectDocumentType>('offer');
  const [documentName, setDocumentName] = useState('');
  
  // Quick Event Modal State
  const [showQuickEvent, setShowQuickEvent] = useState(false);
  const [quickEventType, setQuickEventType] = useState<'calendly' | 'upload' | 'feedback'>('calendly');
  const [quickEventData, setQuickEventData] = useState({
    title: 'Termin vereinbaren',
    description: 'Bitte buchen Sie über den folgenden Link einen passenden Termin für unser nächstes Gespräch.',
    employeeId: '' as string,
    customCalendlyUrl: '',
    useEmployeeCalendly: true,
    insertAfterMilestoneId: '' as string,
    // Upload-spezifisch
    uploadCategory: 'corporate_identity' as FileCategory,
    uploadRequired: true,
  });
  
  // New Milestone State
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    owner: 'agency' as MilestoneOwner,
    category: 'development' as MilestoneCategory,
    dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    actionType: '' as 'calendly' | 'upload' | 'link' | 'feedback' | 'approval' | '',
    actionUrl: '',
    actionLabel: ''
  });
  
  if (!project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold text-dark-900 mb-4">Projekt nicht gefunden</h1>
        <Link to="/admin/projects" className="text-primary-600 hover:underline">
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

  const handleAssignEmployee = (employeeId: string, isLead: boolean = false) => {
    const currentIds = project.assignedEmployeeIds || [];
    let newIds = [...currentIds];
    
    if (newIds.includes(employeeId)) {
      newIds = newIds.filter(id => id !== employeeId);
    } else {
      newIds.push(employeeId);
    }
    
    updateProject({
      ...project,
      assignedEmployeeIds: newIds,
      leadEmployeeId: isLead ? employeeId : (project.leadEmployeeId === employeeId ? undefined : project.leadEmployeeId)
    });
  };

  const handleSetLeadEmployee = (employeeId: string) => {
    const currentIds = project.assignedEmployeeIds || [];
    if (!currentIds.includes(employeeId)) {
      currentIds.push(employeeId);
    }
    updateProject({
      ...project,
      assignedEmployeeIds: currentIds,
      leadEmployeeId: employeeId
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: FileCategory = 'other') => {
    const files = e.target.files;
    if (!files || !project) return;
    
    Array.from(files).forEach(file => {
      // Simulierter Upload - in Produktion würde hier der echte Upload stattfinden
      addProjectFile({
        projectId: project.id,
        category,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: 'agency',
        url: URL.createObjectURL(file)  // Nur für Demo
      });
    });
    
    e.target.value = '';  // Reset input
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    
    addProjectDocument({
      projectId: project.id,
      type: documentType,
      name: documentName || getDocumentTypeLabel(documentType),
      fileName: file.name,
      fileSize: file.size,
      url: URL.createObjectURL(file)  // Nur für Demo
    });
    
    setShowDocumentUpload(false);
    setDocumentName('');
    e.target.value = '';
  };

  const getDocumentTypeLabel = (type: ProjectDocumentType): string => {
    switch (type) {
      case 'offer': return 'Angebot';
      case 'contract': return 'Vertrag';
      case 'invoice': return 'Rechnung';
      default: return 'Dokument';
    }
  };

  const handleAddMilestone = () => {
    if (!project || !newMilestone.title.trim()) return;
    
    const maxOrder = milestones.length > 0 ? Math.max(...milestones.map(m => m.order)) : 0;
    const dueDate = new Date(newMilestone.dueDate).toISOString();
    
    addMilestone({
      projectId: project.id,
      order: maxOrder + 1,
      title: newMilestone.title,
      description: newMilestone.description,
      status: 'locked',
      dueDate,
      originalDueDate: dueDate,
      owner: newMilestone.owner,
      category: newMilestone.category,
      actionType: newMilestone.actionType || undefined,
      actionUrl: newMilestone.actionUrl || undefined,
      actionLabel: newMilestone.actionLabel || undefined
    });
    
    // Reset form
    setNewMilestone({
      title: '',
      description: '',
      owner: 'agency',
      category: 'development',
      dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      actionType: '',
      actionUrl: '',
      actionLabel: ''
    });
    setShowAddMilestone(false);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (confirm('Meilenstein wirklich löschen?')) {
      deleteMilestone(milestoneId);
    }
  };

  // Quick Event hinzufügen (Termin, Upload-Anforderung, Feedback)
  const handleAddQuickEvent = () => {
    if (!project) return;
    
    // Finde die Position zum Einfügen
    let insertOrder = 1;
    if (quickEventData.insertAfterMilestoneId) {
      const afterMilestone = milestones.find(m => m.id === quickEventData.insertAfterMilestoneId);
      if (afterMilestone) {
        insertOrder = afterMilestone.order + 0.5;
      }
    } else {
      const firstOpenMilestone = milestones.find(m => m.status !== 'done');
      if (firstOpenMilestone) {
        insertOrder = firstOpenMilestone.order - 0.5;
      }
    }
    
    const dueDate = addDays(new Date(), quickEventType === 'calendly' ? 3 : 5).toISOString();
    
    // Je nach Event-Typ unterschiedliche Einstellungen
    if (quickEventType === 'calendly') {
      let calendlyUrl = quickEventData.customCalendlyUrl;
      if (quickEventData.useEmployeeCalendly && quickEventData.employeeId) {
        const employee = employees.find(e => e.id === quickEventData.employeeId);
        if (employee?.calendlyUrl) {
          calendlyUrl = employee.calendlyUrl;
        }
      }
      
      if (!calendlyUrl) {
        alert('Bitte geben Sie eine Calendly-URL ein oder wählen Sie einen Mitarbeiter mit Calendly-Link aus.');
        return;
      }
      
      addMilestone({
        projectId: project.id,
        order: insertOrder,
        title: quickEventData.title,
        description: quickEventData.description,
        status: 'open',
        dueDate,
        originalDueDate: dueDate,
        owner: 'client',
        category: 'onboarding',
        actionType: 'calendly',
        actionUrl: calendlyUrl,
        actionLabel: 'Termin buchen',
        assignedEmployeeId: quickEventData.employeeId || undefined
      });
    } else if (quickEventType === 'upload') {
      addMilestone({
        projectId: project.id,
        order: insertOrder,
        title: quickEventData.title,
        description: quickEventData.description,
        status: 'open',
        dueDate,
        originalDueDate: dueDate,
        owner: 'client',
        category: 'content',
        actionType: 'upload',
        actionLabel: 'Dateien hochladen',
        requiredUploadCategory: quickEventData.uploadCategory
      });
    } else if (quickEventType === 'feedback') {
      addMilestone({
        projectId: project.id,
        order: insertOrder,
        title: quickEventData.title,
        description: quickEventData.description,
        status: 'open',
        dueDate,
        originalDueDate: dueDate,
        owner: 'client',
        category: 'review',
        actionType: 'feedback',
        actionLabel: 'Feedback abgeben'
      });
    }
    
    // Reset und schließen
    resetQuickEventData();
    setShowQuickEvent(false);
  };

  const resetQuickEventData = () => {
    setQuickEventType('calendly');
    setQuickEventData({
      title: 'Termin vereinbaren',
      description: 'Bitte buchen Sie über den folgenden Link einen passenden Termin für unser nächstes Gespräch.',
      employeeId: '',
      customCalendlyUrl: '',
      useEmployeeCalendly: true,
      insertAfterMilestoneId: '',
      uploadCategory: 'corporate_identity',
      uploadRequired: true,
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
          <Link to="/admin/projects" className="text-sm text-primary-600 hover:underline mb-2 inline-block">
            ← Zurück zur Projektliste
          </Link>
          <h1 className="text-2xl font-bold text-dark-900">{project.title}</h1>
          <p className="text-dark-600 mt-1">
            Kunde: {client?.name || 'Unbekannt'} • {client?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickEvent(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Aufgabe einschieben
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Projekt löschen
          </button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-900 mb-2">Projekt löschen?</h3>
            <p className="text-dark-600 mb-6">
              Sind Sie sicher, dass Sie das Projekt "{project.title}" unwiderruflich löschen möchten?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-dark-600 hover:text-dark-800"
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

      {/* Quick Event Modal (Termin, Upload, Feedback) */}
      {showQuickEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900">Aufgabe einschieben</h3>
              <button onClick={() => { setShowQuickEvent(false); resetQuickEventData(); }} className="text-dark-400 hover:text-dark-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Event-Typ Auswahl */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setQuickEventType('calendly');
                  setQuickEventData({ ...quickEventData, title: 'Termin vereinbaren', description: 'Bitte buchen Sie über den folgenden Link einen passenden Termin für unser nächstes Gespräch.' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  quickEventType === 'calendly' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-dark-200 hover:border-dark-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Termin</span>
              </button>
              <button
                onClick={() => {
                  setQuickEventType('upload');
                  setQuickEventData({ ...quickEventData, title: 'Dateien hochladen', description: 'Bitte laden Sie die angeforderten Dateien hier im Portal hoch.' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  quickEventType === 'upload' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-dark-200 hover:border-dark-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-medium">Upload</span>
              </button>
              <button
                onClick={() => {
                  setQuickEventType('feedback');
                  setQuickEventData({ ...quickEventData, title: 'Feedback geben', description: 'Bitte teilen Sie uns Ihr Feedback mit.' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  quickEventType === 'feedback' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-dark-200 hover:border-dark-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">Feedback</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={quickEventData.title}
                  onChange={(e) => setQuickEventData({ ...quickEventData, title: e.target.value })}
                  placeholder={quickEventType === 'calendly' ? 'z.B. Zwischenbesprechung' : quickEventType === 'upload' ? 'z.B. Logo & CI hochladen' : 'z.B. Feedback zum Entwurf'}
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Nachricht an Kunden</label>
                <textarea
                  value={quickEventData.description}
                  onChange={(e) => setQuickEventData({ ...quickEventData, description: e.target.value })}
                  rows={2}
                  placeholder="Diese Nachricht sieht der Kunde..."
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Calendly-spezifische Optionen */}
              {quickEventType === 'calendly' && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <label className="block text-sm font-medium text-dark-700 mb-3">Calendly-Link</label>
                  
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={quickEventData.useEmployeeCalendly}
                        onChange={() => setQuickEventData({ ...quickEventData, useEmployeeCalendly: true, customCalendlyUrl: '' })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-dark-700">Mitarbeiter-Calendly</span>
                        {quickEventData.useEmployeeCalendly && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {employees.filter(e => e.calendlyUrl && e.isActive).map(emp => (
                              <button
                                key={emp.id}
                                onClick={() => setQuickEventData({ ...quickEventData, employeeId: emp.id })}
                                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left ${
                                  quickEventData.employeeId === emp.id ? 'border-blue-500 bg-white' : 'border-dark-200 bg-white hover:border-dark-300'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: emp.color }}>
                                  {emp.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-dark-900 truncate">{emp.name}</p>
                                </div>
                              </button>
                            ))}
                            {employees.filter(e => e.calendlyUrl && e.isActive).length === 0 && (
                              <p className="col-span-2 text-sm text-dark-400 p-2">Keine Mitarbeiter mit Calendly-Link</p>
                            )}
                          </div>
                        )}
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={!quickEventData.useEmployeeCalendly}
                        onChange={() => setQuickEventData({ ...quickEventData, useEmployeeCalendly: false, employeeId: '' })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-dark-700">Eigenen Link eingeben</span>
                        {!quickEventData.useEmployeeCalendly && (
                          <input
                            type="url"
                            value={quickEventData.customCalendlyUrl}
                            onChange={(e) => setQuickEventData({ ...quickEventData, customCalendlyUrl: e.target.value })}
                            placeholder="https://calendly.com/..."
                            className="mt-2 w-full px-3 py-2 border border-dark-300 rounded-lg text-sm bg-white"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Upload-spezifische Optionen */}
              {quickEventType === 'upload' && (
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <label className="block text-sm font-medium text-dark-700 mb-3">Welche Dateien werden benötigt?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'corporate_identity', label: '🎨 Corporate Identity & Logos', desc: 'Logo, Farben, Schriften' },
                      { value: 'photos', label: '📸 Fotos & Bilder', desc: 'Produktfotos, Team, etc.' },
                      { value: 'documents', label: '📄 Dokumente & Texte', desc: 'Texte, PDFs, Word' },
                      { value: 'other', label: '📁 Sonstige Dateien', desc: 'Andere Materialien' }
                    ].map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setQuickEventData({ ...quickEventData, uploadCategory: cat.value as FileCategory })}
                        className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left ${
                          quickEventData.uploadCategory === cat.value ? 'border-purple-500 bg-white' : 'border-dark-200 bg-white hover:border-dark-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{cat.label}</span>
                        <span className="text-xs text-dark-400">{cat.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback hat keine spezifischen Optionen */}
              {quickEventType === 'feedback' && (
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <p className="text-sm text-amber-700">
                    <strong>Tipp:</strong> Der Kunde erhält ein Textfeld, in dem er sein Feedback schreiben kann. 
                    Beschreiben Sie in der Nachricht genau, wozu Sie Feedback benötigen.
                  </p>
                </div>
              )}

              {/* Position in Timeline */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Einfügen nach Meilenstein</label>
                <select
                  value={quickEventData.insertAfterMilestoneId}
                  onChange={(e) => setQuickEventData({ ...quickEventData, insertAfterMilestoneId: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Am Anfang (vor dem nächsten offenen Schritt)</option>
                  {milestones.map(m => (
                    <option key={m.id} value={m.id}>
                      Nach: {m.title} {m.status === 'done' ? '✓' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-dark-400 mt-1">Die Aufgabe wird direkt für den Kunden sichtbar sein</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => { setShowQuickEvent(false); resetQuickEventData(); }}
                className="px-4 py-2 text-dark-600 hover:text-dark-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddQuickEvent}
                disabled={quickEventType === 'calendly' && (quickEventData.useEmployeeCalendly ? !quickEventData.employeeId : !quickEventData.customCalendlyUrl)}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  quickEventType === 'calendly' ? 'bg-blue-600 hover:bg-blue-700' :
                  quickEventType === 'upload' ? 'bg-purple-600 hover:bg-purple-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {quickEventType === 'calendly' ? 'Termin einschieben' : 
                 quickEventType === 'upload' ? 'Upload anfordern' : 
                 'Feedback anfordern'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Neuen Meilenstein hinzufügen</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Titel *</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="z.B. Design-Review"
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Beschreibung</label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  rows={2}
                  placeholder="Was soll in diesem Meilenstein erledigt werden?"
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Verantwortlich</label>
                  <select
                    value={newMilestone.owner}
                    onChange={(e) => setNewMilestone({ ...newMilestone, owner: e.target.value as MilestoneOwner })}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="agency">Agentur</option>
                    <option value="client">Kunde</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Kategorie</label>
                  <select
                    value={newMilestone.category}
                    onChange={(e) => setNewMilestone({ ...newMilestone, category: e.target.value as MilestoneCategory })}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="content">Content</option>
                    <option value="design">Design</option>
                    <option value="development">Entwicklung</option>
                    <option value="review">Review</option>
                    <option value="conversion">Conversion-Prüfung</option>
                    <option value="deployment">Deployment</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Fälligkeitsdatum</label>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Action Type für Kunden-Milestones */}
              {newMilestone.owner === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Kunden-Aktion</label>
                  <select
                    value={newMilestone.actionType}
                    onChange={(e) => setNewMilestone({ ...newMilestone, actionType: e.target.value as typeof newMilestone.actionType })}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Keine spezielle Aktion</option>
                    <option value="upload">📁 Dateien hochladen</option>
                    <option value="feedback">💬 Feedback abgeben</option>
                    <option value="approval">✅ Freigabe erteilen</option>
                    <option value="calendly">📅 Termin buchen (Calendly)</option>
                    <option value="link">🔗 Externer Link</option>
                  </select>
                  <p className="text-xs text-dark-400 mt-1">
                    {newMilestone.actionType === 'upload' && 'Kunde kann Dateien direkt im Portal hochladen'}
                    {newMilestone.actionType === 'feedback' && 'Kunde kann schriftliches Feedback geben'}
                    {newMilestone.actionType === 'approval' && 'Kunde erteilt eine formelle Freigabe'}
                    {newMilestone.actionType === 'calendly' && 'Kunde bucht einen Termin über Calendly'}
                    {newMilestone.actionType === 'link' && 'Kunde wird zu externem Link weitergeleitet'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    {newMilestone.actionType === 'calendly' ? 'Calendly URL' : 'Action URL (optional)'}
                  </label>
                  <input
                    type="url"
                    value={newMilestone.actionUrl}
                    onChange={(e) => setNewMilestone({ ...newMilestone, actionUrl: e.target.value })}
                    placeholder={newMilestone.actionType === 'calendly' ? 'https://calendly.com/...' : 'https://...'}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Button-Text (optional)</label>
                  <input
                    type="text"
                    value={newMilestone.actionLabel}
                    onChange={(e) => setNewMilestone({ ...newMilestone, actionLabel: e.target.value })}
                    placeholder={
                      newMilestone.actionType === 'upload' ? 'Dateien hochladen' :
                      newMilestone.actionType === 'feedback' ? 'Feedback abgeben' :
                      newMilestone.actionType === 'approval' ? 'Freigabe erteilen' :
                      newMilestone.actionType === 'calendly' ? 'Termin buchen' :
                      'Link öffnen'
                    }
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddMilestone(false)}
                className="px-4 py-2 text-dark-600 hover:text-dark-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddMilestone}
                disabled={!newMilestone.title.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-900">Projektfortschritt</h2>
          <span className="text-sm text-dark-500">
            {completedMilestones}/{milestones.length} Meilensteine abgeschlossen
          </span>
        </div>
        <div className="h-3 bg-dark-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cascade Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-dark-900">Automatische Deadline-Kaskade</h3>
                <p className="text-sm text-dark-500 mt-1">
                  Bei Verzögerungen werden alle nachfolgenden Meilensteine automatisch verschoben.
                </p>
              </div>
              <button
                onClick={handleCascadeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  project.cascadePolicyEnabled ? 'bg-primary-500' : 'bg-dark-300'
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
          <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-900">Timeline</h2>
              <button
                onClick={() => setShowAddMilestone(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Meilenstein
              </button>
            </div>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <MilestoneEditor
                  key={milestone.id}
                  milestone={milestone}
                  onUpdate={updateMilestone}
                  onStatusChange={updateMilestoneStatus}
                  onDelete={() => handleDeleteMilestone(milestone.id)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Assignment */}
          <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Zugewiesenes Team</h2>
            <div className="space-y-2">
              {employees.map((employee) => {
                const isAssigned = (project.assignedEmployeeIds || []).includes(employee.id);
                const isLead = project.leadEmployeeId === employee.id;
                
                return (
                  <div
                    key={employee.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isAssigned ? 'bg-primary-50 border border-primary-200' : 'hover:bg-dark-50'
                    }`}
                    onClick={() => handleAssignEmployee(employee.id)}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: employee.color }}
                    >
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 truncate">{employee.name}</p>
                      <p className="text-xs text-dark-500">{employee.role}</p>
                    </div>
                    {isAssigned && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetLeadEmployee(employee.id); }}
                        className={`px-2 py-1 text-xs rounded ${
                          isLead 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                        }`}
                      >
                        {isLead ? 'Lead' : 'Lead setzen'}
                      </button>
                    )}
                  </div>
                );
              })}
              {employees.length === 0 && (
                <p className="text-sm text-dark-500 text-center py-4">
                  Keine Mitarbeiter vorhanden
                </p>
              )}
            </div>
          </div>

          {/* Kunden-Dokumente (Angebot, Vertrag) */}
          <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-900">Kunden-Dokumente</h2>
              <button
                onClick={() => setShowDocumentUpload(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Hinzufügen
              </button>
            </div>
            <div className="space-y-2">
              {projectDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    doc.type === 'offer' ? 'bg-blue-100 text-blue-600' :
                    doc.type === 'contract' ? 'bg-primary-100 text-primary-600' :
                    doc.type === 'invoice' ? 'bg-amber-100 text-amber-600' :
                    'bg-dark-100 text-dark-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900">{doc.name}</p>
                    <p className="text-xs text-dark-500">{getDocumentTypeLabel(doc.type)} • {doc.fileName}</p>
                  </div>
                  <button
                    onClick={() => deleteProjectDocument(doc.id)}
                    className="p-1 text-dark-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {projectDocuments.length === 0 && (
                <p className="text-sm text-dark-500 text-center py-4">
                  Noch keine Dokumente für den Kunden
                </p>
              )}
            </div>

            {/* Document Upload Modal */}
            {showDocumentUpload && (
              <div className="mt-4 p-4 border border-dark-200 rounded-lg bg-dark-50">
                <h4 className="font-medium text-dark-900 mb-3">Dokument hochladen</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-dark-600 mb-1">Dokumenttyp</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as ProjectDocumentType)}
                      className="w-full px-3 py-2 border border-dark-300 rounded-lg text-sm"
                    >
                      <option value="offer">Angebot</option>
                      <option value="contract">Vertrag</option>
                      <option value="invoice">Rechnung</option>
                      <option value="other">Sonstiges</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-dark-600 mb-1">Bezeichnung (optional)</label>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder={getDocumentTypeLabel(documentType)}
                      className="w-full px-3 py-2 border border-dark-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm cursor-pointer transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Datei wählen
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => { setShowDocumentUpload(false); setDocumentName(''); }}
                      className="px-4 py-2 text-dark-600 hover:bg-dark-200 rounded-lg text-sm transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Files */}
          <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Arbeitsdateien</h2>
            <div className="space-y-2 mb-4">
              {projectFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-2 bg-dark-50 rounded-lg group">
                  <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 truncate">{file.name}</p>
                    <p className="text-xs text-dark-500">{(file.size / 1024).toFixed(1)} KB • {file.uploadedBy === 'client' ? 'Kunde' : 'Agentur'}</p>
                  </div>
                  <button
                    onClick={() => deleteProjectFile(file.id)}
                    className="p-1 text-dark-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {projectFiles.length === 0 && (
                <p className="text-sm text-dark-500 text-center py-2">Keine Dateien</p>
              )}
            </div>
            <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-dark-300 rounded-lg text-sm text-dark-500 hover:text-primary-600 hover:border-primary-300 cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Dateien hochladen
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, 'other')}
                className="hidden"
              />
            </label>
          </div>

          {/* Infrastructure Checklist */}
          <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Infrastruktur</h2>
            <InfrastructureChecklist
              tasks={infrastructureTasks}
              projectId={project.id}
              onToggle={updateInfrastructureTask}
              onAdd={(title) => addInfrastructureTask({ projectId: project.id, title, completed: false })}
              onDelete={deleteInfrastructureTask}
            />
          </div>
          
          {/* Activity Log */}
          <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Aktivitätsprotokoll</h2>
            <div className="max-h-96 overflow-y-auto">
              <ActivityLog projectId={project.id} onDelete={deleteActivityLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
