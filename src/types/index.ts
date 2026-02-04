// Benutzerrollen
export type UserRole = 'admin' | 'client';

// Benachrichtigungspräferenzen
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

// Benutzer-Container
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
  notificationPreferences: NotificationPreferences;
  clientId?: string;
  lastLoginAt?: string;  // Letzter Login
  createdAt: string;
}

// Mitarbeiter (Projektmanager)
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;  // z.B. "Projektmanager", "Designer", "Entwickler"
  avatarUrl?: string;
  calendlyUrl?: string;
  color: string;  // Für UI-Darstellung
  isActive: boolean;
  createdAt: string;
}

// Kunden-Container
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedEmployeeId?: string;  // Hauptansprechpartner
  createdAt: string;
}

// Datei-Upload Kategorien
export type FileCategory = 'corporate_identity' | 'photos' | 'documents' | 'other';

// Datei-Upload
export interface ProjectFile {
  id: string;
  projectId: string;
  milestoneId?: string;
  category: FileCategory;  // Kategorie für bessere Organisation
  name: string;
  size: number;
  type: string;
  uploadedBy: 'client' | 'agency';
  uploadedAt: string;
  url: string;  // Simuliert - in Produktion wäre das ein echter Storage-Link
}

// Projekt-Dokumente (Angebote, Verträge, etc.)
export type ProjectDocumentType = 'offer' | 'contract' | 'invoice' | 'other';

export interface ProjectDocument {
  id: string;
  projectId: string;
  type: ProjectDocumentType;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

// Projekttypen
export type ProjectType = 'landingpage' | 'website' | 'software' | 'custom';

// Projekt-Container
export interface Project {
  id: string;
  clientId: string;
  title: string;
  type: ProjectType;
  cascadePolicyEnabled: boolean;
  assignedEmployeeIds: string[];  // Zugewiesene Mitarbeiter
  leadEmployeeId?: string;  // Hauptverantwortlicher
  createdAt: string;
  updatedAt: string;
}

// Meilenstein-Status
export type MilestoneStatus = 'locked' | 'open' | 'submitted' | 'in_review' | 'done';

// Meilenstein-Besitzer
export type MilestoneOwner = 'agency' | 'client';

// Meilenstein-Kategorie
export type MilestoneCategory = 'onboarding' | 'content' | 'design' | 'development' | 'review' | 'conversion' | 'deployment';

// Meilenstein-Container
export interface Milestone {
  id: string;
  projectId: string;
  order: number;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  originalDueDate: string;
  owner: MilestoneOwner;
  category: MilestoneCategory;
  assignedEmployeeId?: string;  // Zugewiesener Mitarbeiter für diesen Meilenstein
  actionUrl?: string;
  actionLabel?: string;
  actionType?: 'calendly' | 'upload' | 'link' | 'feedback';  // Art der Action
  feedbackNote?: string;  // Feedback/Notiz für den Kunden
  submittedAt?: string;
  completedAt?: string;
}

// Infrastruktur-Aufgaben-Container
export interface InfrastructureTask {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
}

// Aktivitätsprotokoll-Eintrag
export type ActivityType = 
  | 'project_created'
  | 'milestone_status_changed'
  | 'milestone_submitted'
  | 'deadline_cascade'
  | 'escalation_sent'
  | 'client_notified'
  | 'infrastructure_updated';

export interface ActivityLogEntry {
  id: string;
  projectId: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Eskalationsstufen
export type EscalationLevel = 1 | 2 | 3;

// Eskalations-Tracker
export interface EscalationTracker {
  milestoneId: string;
  currentLevel: EscalationLevel;
  lastEscalationAt: string;
  notificationsSent: {
    level1?: string;
    level2?: string;
    level3?: string;
  };
}

// Meilenstein-Vorlagen
export interface MilestoneTemplate {
  id?: string;  // Für benutzerdefinierte Templates
  order: number;
  title: string;
  description: string;
  owner: MilestoneOwner;
  category: MilestoneCategory;
  daysOffset: number;
  actionUrl?: string;
  actionLabel?: string;
}

export interface InfrastructureTemplate {
  id?: string;
  title: string;
}

export interface ProjectTemplate {
  id: string;
  type: ProjectType | 'custom';
  name: string;
  description: string;
  milestones: MilestoneTemplate[];
  infrastructureTasks: InfrastructureTemplate[];
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// App-Zustand
export interface AppState {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  employees: Employee[];  // Mitarbeiter
  projects: Project[];
  milestones: Milestone[];
  infrastructureTasks: InfrastructureTask[];
  projectFiles: ProjectFile[];  // Hochgeladene Dateien
  projectDocuments: ProjectDocument[];  // Angebote, Verträge etc.
  activityLog: ActivityLogEntry[];
  escalationTrackers: EscalationTracker[];
  customTemplates: ProjectTemplate[];  // Benutzerdefinierte Produkt-Templates
}
