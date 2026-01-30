import { AppState, User, Client } from '../types/index';

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
  createdAt: new Date().toISOString()
};

// Initialer App-Zustand
export const initialAppState: AppState = {
  currentUser: null,
  users: [adminUser, clientUser],
  clients: [demoClient],
  projects: [],
  milestones: [],
  infrastructureTasks: [],
  activityLog: [],
  escalationTrackers: []
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
