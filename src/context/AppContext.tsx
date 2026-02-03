import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays, parseISO, differenceInDays } from 'date-fns';
import {
  AppState,
  User,
  Client,
  Project,
  Milestone,
  MilestoneStatus,
  InfrastructureTask,
  ActivityLogEntry,
  ProjectType,
  NotificationPreferences,
  ProjectTemplate,
  Employee,
  ProjectFile
} from '../types/index';
import { loadState, saveState, initialAppState } from '../data/initialData';
import { getTemplateByType, getAllTemplates } from '../data/templates';

// ============================================
// ACTION TYPES
// ============================================

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'CREATE_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'CREATE_PROJECT'; payload: { project: Project; milestones: Milestone[]; infrastructureTasks: InfrastructureTask[] } }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }
  | { type: 'UPDATE_MILESTONE_STATUS'; payload: { milestoneId: string; status: MilestoneStatus } }
  | { type: 'SUBMIT_MILESTONE'; payload: string }
  | { type: 'UPDATE_INFRASTRUCTURE_TASK'; payload: InfrastructureTask }
  | { type: 'ADD_INFRASTRUCTURE_TASK'; payload: InfrastructureTask }
  | { type: 'DELETE_INFRASTRUCTURE_TASK'; payload: string }
  | { type: 'ADD_ACTIVITY_LOG'; payload: ActivityLogEntry }
  | { type: 'DELETE_ACTIVITY_LOG'; payload: string }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: { userId: string; preferences: NotificationPreferences; phone?: string } }
  | { type: 'CASCADE_DEADLINES'; payload: { projectId: string; fromMilestoneOrder: number; delayDays: number } }
  | { type: 'CREATE_TEMPLATE'; payload: ProjectTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: ProjectTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'DELETE_MILESTONE'; payload: string }
  | { type: 'CREATE_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'ADD_PROJECT_FILE'; payload: ProjectFile }
  | { type: 'DELETE_PROJECT_FILE'; payload: string }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_STATE'; payload: AppState };

// ============================================
// REDUCER
// ============================================

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };

    case 'LOGOUT':
      return { ...state, currentUser: null };

    case 'CREATE_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.payload.id ? action.payload : c
        )
      };

    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.payload)
      };

    case 'CREATE_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload.project],
        milestones: [...state.milestones, ...action.payload.milestones],
        infrastructureTasks: [...state.infrastructureTasks, ...action.payload.infrastructureTasks]
      };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        milestones: state.milestones.filter(m => m.projectId !== action.payload),
        infrastructureTasks: state.infrastructureTasks.filter(t => t.projectId !== action.payload),
        activityLog: state.activityLog.filter(a => a.projectId !== action.payload)
      };

    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map(m =>
          m.id === action.payload.id ? action.payload : m
        )
      };

    case 'UPDATE_MILESTONE_STATUS': {
      const milestone = state.milestones.find(m => m.id === action.payload.milestoneId);
      if (!milestone) return state;

      const updatedMilestone: Milestone = {
        ...milestone,
        status: action.payload.status,
        ...(action.payload.status === 'done' ? { completedAt: new Date().toISOString() } : {})
      };

      return {
        ...state,
        milestones: state.milestones.map(m =>
          m.id === action.payload.milestoneId ? updatedMilestone : m
        )
      };
    }

    case 'SUBMIT_MILESTONE': {
      const milestone = state.milestones.find(m => m.id === action.payload);
      if (!milestone) return state;

      const updatedMilestone: Milestone = {
        ...milestone,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      return {
        ...state,
        milestones: state.milestones.map(m =>
          m.id === action.payload ? updatedMilestone : m
        )
      };
    }

    case 'UPDATE_INFRASTRUCTURE_TASK':
      return {
        ...state,
        infrastructureTasks: state.infrastructureTasks.map(t =>
          t.id === action.payload.id ? action.payload : t
        )
      };

    case 'ADD_INFRASTRUCTURE_TASK':
      return {
        ...state,
        infrastructureTasks: [...state.infrastructureTasks, action.payload]
      };

    case 'DELETE_INFRASTRUCTURE_TASK':
      return {
        ...state,
        infrastructureTasks: state.infrastructureTasks.filter(t => t.id !== action.payload)
      };

    case 'ADD_ACTIVITY_LOG':
      return {
        ...state,
        activityLog: [...state.activityLog, action.payload]
      };

    case 'DELETE_ACTIVITY_LOG':
      return {
        ...state,
        activityLog: state.activityLog.filter(a => a.id !== action.payload)
      };

    case 'UPDATE_USER_PREFERENCES': {
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.payload.userId
            ? {
                ...u,
                notificationPreferences: action.payload.preferences,
                phone: action.payload.phone ?? u.phone
              }
            : u
        ),
        currentUser: state.currentUser?.id === action.payload.userId
          ? {
              ...state.currentUser,
              notificationPreferences: action.payload.preferences,
              phone: action.payload.phone ?? state.currentUser.phone
            }
          : state.currentUser
      };
    }

    case 'CASCADE_DEADLINES': {
      const { projectId, fromMilestoneOrder, delayDays } = action.payload;
      
      return {
        ...state,
        milestones: state.milestones.map(m => {
          if (m.projectId === projectId && m.order > fromMilestoneOrder) {
            const currentDueDate = parseISO(m.dueDate);
            const newDueDate = addDays(currentDueDate, delayDays);
            return {
              ...m,
              dueDate: newDueDate.toISOString()
            };
          }
          return m;
        })
      };
    }

    case 'CREATE_TEMPLATE':
      return {
        ...state,
        customTemplates: [...(state.customTemplates || []), action.payload]
      };

    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        customTemplates: (state.customTemplates || []).map(t =>
          t.id === action.payload.id ? action.payload : t
        )
      };

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        customTemplates: (state.customTemplates || []).filter(t => t.id !== action.payload)
      };

    case 'ADD_MILESTONE':
      return {
        ...state,
        milestones: [...state.milestones, action.payload]
      };

    case 'DELETE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.filter(m => m.id !== action.payload)
      };

    case 'CREATE_EMPLOYEE':
      return {
        ...state,
        employees: [...(state.employees || []), action.payload]
      };

    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: (state.employees || []).map(e =>
          e.id === action.payload.id ? action.payload : e
        )
      };

    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: (state.employees || []).filter(e => e.id !== action.payload)
      };

    case 'ADD_PROJECT_FILE':
      return {
        ...state,
        projectFiles: [...(state.projectFiles || []), action.payload]
      };

    case 'DELETE_PROJECT_FILE':
      return {
        ...state,
        projectFiles: (state.projectFiles || []).filter(f => f.id !== action.payload)
      };

    case 'RESET_STATE':
      return initialAppState;

    case 'LOAD_STATE':
      return { 
        ...action.payload, 
        customTemplates: action.payload.customTemplates || [],
        employees: action.payload.employees || [],
        projectFiles: action.payload.projectFiles || []
      };

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface AppContextType {
  state: AppState;
  // Auth
  login: (email: string, password: string) => User | null;
  logout: () => void;
  // Clients
  createClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  // Projects
  createProject: (clientId: string, title: string, type: ProjectType, startDate: Date, customMilestones?: Milestone[], customInfrastructure?: InfrastructureTask[]) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByClientId: (clientId: string) => Project[];
  // Milestones
  addMilestone: (milestone: Omit<Milestone, 'id'>) => Milestone;
  updateMilestone: (milestone: Milestone) => void;
  deleteMilestone: (milestoneId: string) => void;
  updateMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => void;
  submitMilestone: (milestoneId: string) => void;
  getMilestonesByProjectId: (projectId: string) => Milestone[];
  getCurrentMilestoneForClient: (clientId: string) => Milestone | null;
  // Infrastructure Tasks
  addInfrastructureTask: (task: Omit<InfrastructureTask, 'id'>) => InfrastructureTask;
  updateInfrastructureTask: (task: InfrastructureTask) => void;
  deleteInfrastructureTask: (taskId: string) => void;
  getInfrastructureTasksByProjectId: (projectId: string) => InfrastructureTask[];
  // Activity Log
  addActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  deleteActivityLog: (activityId: string) => void;
  getActivityLogByProjectId: (projectId: string) => ActivityLogEntry[];
  // Templates
  createTemplate: (template: ProjectTemplate) => void;
  updateTemplate: (template: ProjectTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  // Employees
  createEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  // Project Files
  addProjectFile: (file: Omit<ProjectFile, 'id' | 'uploadedAt'>) => ProjectFile;
  deleteProjectFile: (fileId: string) => void;
  getFilesByProjectId: (projectId: string) => ProjectFile[];
  getFilesByMilestoneId: (milestoneId: string) => ProjectFile[];
  // User Preferences
  updateUserPreferences: (userId: string, preferences: NotificationPreferences, phone?: string) => void;
  // Utilities
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AppProvider({ children }: { children: ReactNode }) {
  // Lade Zustand direkt beim Initialisieren (nicht in useEffect)
  const [state, dispatch] = useReducer(appReducer, null, () => loadState());
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Markiere als initialisiert nach dem ersten Render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Speichere Zustand bei Änderungen (aber nicht beim initialen Laden)
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = { ...state, currentUser: null };
      saveState(stateToSave);
    }
  }, [state.clients, state.projects, state.milestones, state.infrastructureTasks, state.activityLog, state.users, state.customTemplates, state.employees, state.projectFiles, isInitialized]);

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  const login = (email: string, password: string): User | null => {
    const user = state.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return user;
    }
    return null;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // ============================================
  // CLIENT FUNCTIONS
  // ============================================

  const createClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `client-${uuidv4()}`,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_CLIENT', payload: newClient });
    return newClient;
  };

  const updateClient = (client: Client) => {
    dispatch({ type: 'UPDATE_CLIENT', payload: client });
  };

  const deleteClient = (id: string) => {
    dispatch({ type: 'DELETE_CLIENT', payload: id });
  };

  const getClientById = (id: string): Client | undefined => {
    return state.clients.find(c => c.id === id);
  };

  // ============================================
  // PROJECT FUNCTIONS
  // ============================================

  const createProject = (
    clientId: string, 
    title: string, 
    type: ProjectType, 
    startDate: Date,
    customMilestones?: Milestone[],
    customInfrastructure?: InfrastructureTask[]
  ): Project => {
    const projectId = `project-${uuidv4()}`;
    const now = new Date().toISOString();

    // Projekt erstellen
    const newProject: Project = {
      id: projectId,
      clientId,
      title,
      type,
      cascadePolicyEnabled: true,
      assignedEmployeeIds: [],
      createdAt: now,
      updatedAt: now
    };

    let milestones: Milestone[];
    let infrastructureTasks: InfrastructureTask[];

    if (customMilestones && customMilestones.length > 0) {
      // Custom Milestones verwenden (bereits mit korrekten Daten)
      milestones = customMilestones.map((m, index) => ({
        ...m,
        id: `milestone-${uuidv4()}`,
        projectId,
        status: index === 0 ? 'open' : 'locked'
      }));
    } else {
      // Template-basierte Milestones
      const template = getTemplateByType(type, state.customTemplates);
      if (!template) {
        throw new Error(`Template für Typ ${type} nicht gefunden`);
      }

      let currentDate = startDate;
      milestones = template.milestones.map((tmpl, index) => {
        currentDate = addDays(currentDate, tmpl.daysOffset);
        const dueDate = currentDate.toISOString();

        return {
          id: `milestone-${uuidv4()}`,
          projectId,
          order: tmpl.order,
          title: tmpl.title,
          description: tmpl.description,
          status: index === 0 ? 'open' : 'locked',
          dueDate,
          originalDueDate: dueDate,
          owner: tmpl.owner,
          category: tmpl.category,
          actionUrl: tmpl.actionUrl,
          actionLabel: tmpl.actionLabel
        };
      });
    }

    if (customInfrastructure && customInfrastructure.length > 0) {
      // Custom Infrastructure verwenden
      infrastructureTasks = customInfrastructure.map(t => ({
        ...t,
        id: `infra-${uuidv4()}`,
        projectId
      }));
    } else {
      // Template-basierte Infrastructure
      const template = getTemplateByType(type, state.customTemplates);
      if (template) {
        infrastructureTasks = template.infrastructureTasks.map(task => ({
          id: `infra-${uuidv4()}`,
          projectId,
          title: typeof task === 'string' ? task : task.title,
          completed: false
        }));
      } else {
        infrastructureTasks = [];
      }
    }

    dispatch({
      type: 'CREATE_PROJECT',
      payload: { project: newProject, milestones, infrastructureTasks }
    });

    // Aktivitätslog
    addActivityLog({
      projectId,
      type: 'project_created',
      message: `Projekt "${title}" wurde erstellt.`
    });

    return newProject;
  };

  const updateProject = (project: Project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...project, updatedAt: new Date().toISOString() } });
  };

  const deleteProject = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  };

  const getProjectById = (id: string): Project | undefined => {
    return state.projects.find(p => p.id === id);
  };

  const getProjectsByClientId = (clientId: string): Project[] => {
    return state.projects.filter(p => p.clientId === clientId);
  };

  // ============================================
  // MILESTONE FUNCTIONS
  // ============================================

  const addMilestone = (milestoneData: Omit<Milestone, 'id'>): Milestone => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: `milestone-${uuidv4()}`
    };
    dispatch({ type: 'ADD_MILESTONE', payload: newMilestone });
    return newMilestone;
  };

  const updateMilestone = (milestone: Milestone) => {
    dispatch({ type: 'UPDATE_MILESTONE', payload: milestone });
  };

  const deleteMilestone = (milestoneId: string) => {
    dispatch({ type: 'DELETE_MILESTONE', payload: milestoneId });
  };

  const updateMilestoneStatus = (milestoneId: string, status: MilestoneStatus) => {
    const milestone = state.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const project = state.projects.find(p => p.id === milestone.projectId);
    
    // Wenn Status auf 'done' gesetzt wird und Kaskade aktiviert ist
    if (status === 'done' && project?.cascadePolicyEnabled) {
      const originalDueDate = parseISO(milestone.originalDueDate);
      const completionDate = new Date();
      const delayDays = differenceInDays(completionDate, originalDueDate);

      if (delayDays > 0) {
        // Kaskade auslösen
        dispatch({
          type: 'CASCADE_DEADLINES',
          payload: {
            projectId: milestone.projectId,
            fromMilestoneOrder: milestone.order,
            delayDays
          }
        });

        addActivityLog({
          projectId: milestone.projectId,
          type: 'deadline_cascade',
          message: `Der Zeitplan wurde aufgrund einer Verzögerung in "${milestone.title}" automatisch um ${delayDays} Tage aktualisiert.`,
          metadata: { delayDays, milestoneId }
        });
      }
    }

    dispatch({ type: 'UPDATE_MILESTONE_STATUS', payload: { milestoneId, status } });

    // Nächsten Meilenstein entsperren wenn dieser auf 'done' gesetzt wird
    if (status === 'done') {
      const projectMilestones = getMilestonesByProjectId(milestone.projectId);
      const nextMilestone = projectMilestones.find(m => m.order === milestone.order + 1);
      if (nextMilestone && nextMilestone.status === 'locked') {
        dispatch({
          type: 'UPDATE_MILESTONE_STATUS',
          payload: { milestoneId: nextMilestone.id, status: 'open' }
        });
      }
    }

    addActivityLog({
      projectId: milestone.projectId,
      type: 'milestone_status_changed',
      message: `Status von "${milestone.title}" wurde auf "${status}" geändert.`,
      metadata: { milestoneId, oldStatus: milestone.status, newStatus: status }
    });
  };

  const submitMilestone = (milestoneId: string) => {
    const milestone = state.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    dispatch({ type: 'SUBMIT_MILESTONE', payload: milestoneId });

    addActivityLog({
      projectId: milestone.projectId,
      type: 'milestone_submitted',
      message: `Kunde hat "${milestone.title}" als abgeschlossen markiert.`,
      metadata: { milestoneId }
    });
  };

  const getMilestonesByProjectId = (projectId: string): Milestone[] => {
    return state.milestones
      .filter(m => m.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  };

  const getCurrentMilestoneForClient = (clientId: string): Milestone | null => {
    const projects = getProjectsByClientId(clientId);
    if (projects.length === 0) return null;

    // Finde den ersten offenen Meilenstein mit owner='client'
    for (const project of projects) {
      const milestones = getMilestonesByProjectId(project.id);
      const currentMilestone = milestones.find(
        m => (m.status === 'open' || m.status === 'submitted') && m.owner === 'client'
      );
      if (currentMilestone) return currentMilestone;
    }

    return null;
  };

  // ============================================
  // INFRASTRUCTURE TASK FUNCTIONS
  // ============================================

  const addInfrastructureTask = (taskData: Omit<InfrastructureTask, 'id'>): InfrastructureTask => {
    const newTask: InfrastructureTask = {
      ...taskData,
      id: `infra-${uuidv4()}`
    };
    dispatch({ type: 'ADD_INFRASTRUCTURE_TASK', payload: newTask });
    return newTask;
  };

  const updateInfrastructureTask = (task: InfrastructureTask) => {
    dispatch({ type: 'UPDATE_INFRASTRUCTURE_TASK', payload: task });
  };

  const deleteInfrastructureTask = (taskId: string) => {
    dispatch({ type: 'DELETE_INFRASTRUCTURE_TASK', payload: taskId });
  };

  const getInfrastructureTasksByProjectId = (projectId: string): InfrastructureTask[] => {
    return state.infrastructureTasks.filter(t => t.projectId === projectId);
  };

  // ============================================
  // ACTIVITY LOG FUNCTIONS
  // ============================================

  const addActivityLog = (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: `activity-${uuidv4()}`,
      timestamp: new Date().toISOString()
    };
    dispatch({ type: 'ADD_ACTIVITY_LOG', payload: newEntry });
  };

  const deleteActivityLog = (activityId: string) => {
    dispatch({ type: 'DELETE_ACTIVITY_LOG', payload: activityId });
  };

  const getActivityLogByProjectId = (projectId: string): ActivityLogEntry[] => {
    return state.activityLog
      .filter(a => a.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // ============================================
  // TEMPLATE FUNCTIONS
  // ============================================

  const createTemplate = (template: ProjectTemplate) => {
    dispatch({ type: 'CREATE_TEMPLATE', payload: template });
  };

  const updateTemplate = (template: ProjectTemplate) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: template });
  };

  const deleteTemplate = (templateId: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
  };

  // ============================================
  // EMPLOYEE FUNCTIONS
  // ============================================

  const createEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt'>): Employee => {
    const newEmployee: Employee = {
      ...employeeData,
      id: `employee-${uuidv4()}`,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_EMPLOYEE', payload: newEmployee });
    return newEmployee;
  };

  const updateEmployee = (employee: Employee) => {
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: employee });
  };

  const deleteEmployee = (employeeId: string) => {
    dispatch({ type: 'DELETE_EMPLOYEE', payload: employeeId });
  };

  const getEmployeeById = (id: string): Employee | undefined => {
    return (state.employees || []).find(e => e.id === id);
  };

  // ============================================
  // PROJECT FILE FUNCTIONS
  // ============================================

  const addProjectFile = (fileData: Omit<ProjectFile, 'id' | 'uploadedAt'>): ProjectFile => {
    const newFile: ProjectFile = {
      ...fileData,
      id: `file-${uuidv4()}`,
      uploadedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PROJECT_FILE', payload: newFile });
    return newFile;
  };

  const deleteProjectFile = (fileId: string) => {
    dispatch({ type: 'DELETE_PROJECT_FILE', payload: fileId });
  };

  const getFilesByProjectId = (projectId: string): ProjectFile[] => {
    return (state.projectFiles || []).filter(f => f.projectId === projectId);
  };

  const getFilesByMilestoneId = (milestoneId: string): ProjectFile[] => {
    return (state.projectFiles || []).filter(f => f.milestoneId === milestoneId);
  };

  // ============================================
  // USER PREFERENCES FUNCTIONS
  // ============================================

  const updateUserPreferences = (userId: string, preferences: NotificationPreferences, phone?: string) => {
    dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: { userId, preferences, phone } });
  };

  // ============================================
  // UTILITIES
  // ============================================

  const resetAppState = () => {
    dispatch({ type: 'RESET_STATE' });
    localStorage.removeItem('client-fulfillment-system');
  };

  const value: AppContextType = {
    state,
    login,
    logout,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByClientId,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneStatus,
    submitMilestone,
    getMilestonesByProjectId,
    getCurrentMilestoneForClient,
    addInfrastructureTask,
    updateInfrastructureTask,
    deleteInfrastructureTask,
    getInfrastructureTasksByProjectId,
    addActivityLog,
    deleteActivityLog,
    getActivityLogByProjectId,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    addProjectFile,
    deleteProjectFile,
    getFilesByProjectId,
    getFilesByMilestoneId,
    updateUserPreferences,
    resetState: resetAppState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
