import { AppState, User, Client, Employee } from '../types/index';

// ============================================
// INITIALE DEMO-DATEN für den Prototyp
// ============================================

// Demo-Admin: Alex, der überlastete Projektmanager
const adminUser: User = {
  id: 'user-admin-1',
  email: 'alex@agentur.de',
  password: 'admin123', // In Produktion: gehasht!
  role: 'admin',
  name: 'Alex Müller',
  phone: '+49 170 1234567',
  notificationPreferences: {
    email: true,
    sms: false
  },
  createdAt: new Date().toISOString()
};

// Demo-Kundin: Julia, die beschäftigte Marketing-Leiterin
const clientUser: User = {
  id: 'user-client-1',
  email: 'julia@techvision.de',
  password: 'client123', // In Produktion: gehasht!
  role: 'client',
  name: 'Julia Weber',
  phone: '+49 171 9876543',
  notificationPreferences: {
    email: true,
    sms: true
  },
  clientId: 'client-1',
  createdAt: new Date().toISOString()
};

// Demo-Kunde
const demoClient: Client = {
  id: 'client-1',
  name: 'Julia Weber',
  email: 'julia@techvision.de',
  phone: '+49 171 9876543',
  assignedEmployeeId: 'employee-1',
  createdAt: new Date().toISOString()
};

// Demo-Mitarbeiter
const demoEmployees: Employee[] = [
  {
    id: 'employee-1',
    name: 'Nils Berger',
    email: 'nils@digitalisierungshilfe.at',
    phone: '+43 660 1234567',
    role: 'Projektmanager',
    calendlyUrl: 'https://calendly.com/nils-digitalisierungshilfe',
    color: '#0d9488',  // Primary teal
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'employee-2',
    name: 'Sarah Klein',
    email: 'sarah@digitalisierungshilfe.at',
    phone: '+43 660 7654321',
    role: 'Projektmanagerin',
    calendlyUrl: 'https://calendly.com/sarah-digitalisierungshilfe',
    color: '#7c3aed',  // Purple
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'employee-3',
    name: 'Max Weber',
    email: 'max@digitalisierungshilfe.at',
    phone: '+43 660 9876543',
    role: 'Designer',
    calendlyUrl: 'https://calendly.com/max-digitalisierungshilfe',
    color: '#f59e0b',  // Amber
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Initialer App-Zustand
export const initialAppState: AppState = {
  currentUser: null,
  users: [adminUser, clientUser],
  clients: [demoClient],
  employees: demoEmployees,
  projects: [],
  milestones: [],
  infrastructureTasks: [],
  projectFiles: [],
  activityLog: [],
  escalationTrackers: [],
  customTemplates: []
};

// Storage Keys
export const STORAGE_KEY = 'client-fulfillment-system';

// Hilfsfunktion zum Laden des Zustands aus localStorage
export const loadState = (): AppState => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Fehler beim Laden des Zustands:', error);
  }
  return initialAppState;
};

// Hilfsfunktion zum Speichern des Zustands in localStorage
export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Fehler beim Speichern des Zustands:', error);
  }
};

// Hilfsfunktion zum Zurücksetzen auf Initialzustand
export const resetState = (): AppState => {
  localStorage.removeItem(STORAGE_KEY);
  return initialAppState;
};
