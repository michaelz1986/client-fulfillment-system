import { useEffect, useCallback } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Milestone, EscalationLevel } from '../types/index';

// Eskalations-Konfiguration
const ESCALATION_CONFIG = {
  level1: { days: 1, type: 'reminder' as const },
  level2: { days: 3, type: 'warning' as const },
  level3: { days: 7, type: 'critical' as const }
};

// Nachrichten-Templates
const getEscalationMessage = (
  level: EscalationLevel, 
  milestoneName: string, 
  daysOverdue: number,
  clientName: string
): { subject: string; body: string; internalAlert?: string } => {
  switch (level) {
    case 1:
      return {
        subject: 'Freundliche Erinnerung',
        body: `Hallo ${clientName}, eine freundliche Erinnerung: "${milestoneName}" ist seit gestern fällig. Bitte melden Sie sich im Portal an und erledigen Sie diesen Schritt.`
      };
    case 2:
      return {
        subject: 'DRINGEND: Aktion erforderlich',
        body: `DRINGEND: Hallo ${clientName}, wir warten seit ${daysOverdue} Tagen auf "${milestoneName}", um weitermachen zu können. Bitte reichen Sie es heute ein, um das Projekt nicht weiter zu verzögern.`
      };
    case 3:
      return {
        subject: 'KRITISCH: Projektfortschritt blockiert',
        body: `KRITISCH: Der Projektfortschritt ist blockiert. "${milestoneName}" ist seit ${daysOverdue} Tagen überfällig. Bitte kontaktieren Sie uns umgehend.`,
        internalAlert: `ACHTUNG: Kunde "${clientName}" ist ${daysOverdue} Tage überfällig bei "${milestoneName}". Projekt ist kritisch blockiert.`
      };
  }
};

export interface EscalationEvent {
  milestoneId: string;
  projectId: string;
  clientId: string;
  level: EscalationLevel;
  daysOverdue: number;
  message: {
    subject: string;
    body: string;
    internalAlert?: string;
  };
  timestamp: string;
}

export function useEscalationEngine() {
  const { 
    state, 
    getClientById, 
    getProjectById,
    addActivityLog 
  } = useApp();

  // Prüfe alle überfälligen Meilensteine
  const checkOverdueMilestones = useCallback((): EscalationEvent[] => {
    const events: EscalationEvent[] = [];
    const now = new Date();

    // Filtere auf Kunden-Meilensteine die offen oder eingereicht sind
    const clientMilestones = state.milestones.filter(
      m => m.owner === 'client' && (m.status === 'open' || m.status === 'submitted')
    );

    for (const milestone of clientMilestones) {
      const dueDate = parseISO(milestone.dueDate);
      const daysOverdue = differenceInDays(now, dueDate);

      // Nur überfällige Meilensteine
      if (daysOverdue <= 0) continue;

      const project = getProjectById(milestone.projectId);
      if (!project) continue;

      const client = getClientById(project.clientId);
      if (!client) continue;

      // Bestimme Eskalationsstufe
      let level: EscalationLevel | null = null;
      
      if (daysOverdue >= ESCALATION_CONFIG.level3.days) {
        level = 3;
      } else if (daysOverdue >= ESCALATION_CONFIG.level2.days) {
        level = 2;
      } else if (daysOverdue >= ESCALATION_CONFIG.level1.days) {
        level = 1;
      }

      if (level) {
        const message = getEscalationMessage(level, milestone.title, daysOverdue, client.name);
        
        events.push({
          milestoneId: milestone.id,
          projectId: project.id,
          clientId: client.id,
          level,
          daysOverdue,
          message,
          timestamp: now.toISOString()
        });
      }
    }

    return events;
  }, [state.milestones, getProjectById, getClientById]);

  // Simuliere das Senden von Benachrichtigungen (in Produktion: echte E-Mails/SMS)
  const processEscalation = useCallback((event: EscalationEvent) => {
    const levelNames: Record<EscalationLevel, string> = {
      1: 'Freundliche Erinnerung',
      2: 'Dringende Warnung',
      3: 'Kritische Eskalation'
    };

    // Logge die Eskalation
    addActivityLog({
      projectId: event.projectId,
      type: 'escalation_sent',
      message: `${levelNames[event.level]} gesendet: ${event.message.subject} (${event.daysOverdue} Tage überfällig)`,
      metadata: {
        milestoneId: event.milestoneId,
        level: event.level,
        daysOverdue: event.daysOverdue
      }
    });

    // In Produktion würde hier die E-Mail/SMS gesendet werden
    console.log(`[ESCALATION] Level ${event.level}:`, event.message);
    
    if (event.message.internalAlert) {
      console.log(`[INTERNAL ALERT]`, event.message.internalAlert);
    }
  }, [addActivityLog]);

  // Hole alle aktuellen Eskalationen für das Dashboard
  const getEscalationStatus = useCallback((milestoneId: string): {
    level: EscalationLevel | null;
    daysOverdue: number;
  } => {
    const milestone = state.milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.owner !== 'client') {
      return { level: null, daysOverdue: 0 };
    }

    if (milestone.status !== 'open' && milestone.status !== 'submitted') {
      return { level: null, daysOverdue: 0 };
    }

    const dueDate = parseISO(milestone.dueDate);
    const daysOverdue = differenceInDays(new Date(), dueDate);

    if (daysOverdue <= 0) {
      return { level: null, daysOverdue: 0 };
    }

    let level: EscalationLevel | null = null;
    if (daysOverdue >= 7) level = 3;
    else if (daysOverdue >= 3) level = 2;
    else if (daysOverdue >= 1) level = 1;

    return { level, daysOverdue };
  }, [state.milestones]);

  // Automatischer Check alle 60 Sekunden (für Demo-Zwecke)
  useEffect(() => {
    const checkAndEscalate = () => {
      const events = checkOverdueMilestones();
      // In einer echten Anwendung würden wir hier prüfen, ob diese Eskalation
      // bereits gesendet wurde (z.B. mit dem escalationTrackers State)
      // Für den Prototyp loggen wir nur
      if (events.length > 0) {
        console.log(`[ESCALATION ENGINE] Found ${events.length} overdue milestones`);
      }
    };

    // Initial check
    checkAndEscalate();

    // Periodic check (alle 60 Sekunden für Demo)
    const interval = setInterval(checkAndEscalate, 60000);

    return () => clearInterval(interval);
  }, [checkOverdueMilestones]);

  return {
    checkOverdueMilestones,
    processEscalation,
    getEscalationStatus
  };
}
