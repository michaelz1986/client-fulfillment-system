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
  createdAt: string;
}

// Kunden-Container
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// Projekttypen
export type ProjectType = 'landingpage' | 'website' | 'software';

// Projekt-Container
export interface Project {
  id: string;
  clientId: string;
  title: string;
  type: ProjectType;
  cascadePolicyEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Meilenstein-Status
export type MilestoneStatus = 'locked' | 'open' | 'submitted' | 'in_review' | 'done';

// Meilenstein-Besitzer
export type MilestoneOwner = 'agency' | 'client';

// Meilenstein-Kategorie
export type MilestoneCategory = 'onboarding' | 'content' | 'design' | 'development' | 'review' | 'deployment';

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
  actionUrl?: string;
  actionLabel?: string;
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
  order: number;
  title: string;
  description: string;
  owner: MilestoneOwner;
  category: MilestoneCategory;
  daysOffset: number;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ProjectTemplate {
  type: ProjectType;
  name: string;
  description: string;
  milestones: MilestoneTemplate[];
  infrastructureTasks: string[];
}

// App-Zustand
export interface AppState {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  projects: Project[];
  milestones: Milestone[];
  infrastructureTasks: InfrastructureTask[];
  activityLog: ActivityLogEntry[];
  escalationTrackers: EscalationTracker[];
}
