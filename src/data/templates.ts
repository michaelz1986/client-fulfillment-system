import { ProjectTemplate, InfrastructureTemplate } from '../types/index';

// ============================================
// MEILENSTEIN-VORLAGEN gemäß Mandat Kapitel 6
// ============================================

// Hilfsfunktion um Infrastructure-Strings in Objects zu konvertieren
const toInfrastructure = (tasks: string[]): InfrastructureTemplate[] => 
  tasks.map((title, index) => ({ id: `infra-${index}`, title }));

export const defaultTemplates: ProjectTemplate[] = [
  // Vorlage 1: Landingpage (ca. 4 Wochen)
  {
    id: 'template-landingpage',
    type: 'landingpage',
    name: 'Landingpage',
    description: 'Eine fokussierte Landingpage mit ca. 4 Wochen Projektdauer.',
    milestones: [
      {
        id: 'ms-1',
        order: 1,
        title: 'Onboarding Call',
        description: 'Erstes Kennenlernen und Projektbesprechung. Wir klären Ihre Ziele, Zielgruppe und den gewünschten Stil.',
        owner: 'agency',
        category: 'onboarding',
        daysOffset: 0,
        actionUrl: 'https://calendly.com',
        actionLabel: 'Termin buchen'
      },
      {
        id: 'ms-2',
        order: 2,
        title: 'Inhalte hochladen',
        description: 'Bitte laden Sie alle Texte, Bilder und Dokumente in den für Sie vorbereiteten Ordner hoch.',
        owner: 'client',
        category: 'content',
        daysOffset: 7,
        actionUrl: 'https://drive.google.com',
        actionLabel: 'Zum Google Drive Ordner'
      },
      {
        id: 'ms-3',
        order: 3,
        title: 'Erster Design-Entwurf',
        description: 'Wir erstellen basierend auf Ihren Inhalten den ersten visuellen Entwurf Ihrer Landingpage.',
        owner: 'agency',
        category: 'design',
        daysOffset: 10
      },
      {
        id: 'ms-4',
        order: 4,
        title: 'Feedback zum Design',
        description: 'Bitte prüfen Sie den Design-Entwurf und geben Sie uns Ihr detailliertes Feedback.',
        owner: 'client',
        category: 'review',
        daysOffset: 5,
        actionUrl: 'https://figma.com',
        actionLabel: 'Design ansehen'
      },
      {
        id: 'ms-5',
        order: 5,
        title: 'Umsetzung der Änderungen',
        description: 'Wir setzen Ihr Feedback um und finalisieren das Design.',
        owner: 'agency',
        category: 'design',
        daysOffset: 5
      },
      {
        id: 'ms-6',
        order: 6,
        title: 'Finale Abnahme',
        description: 'Bitte prüfen Sie die finale Version und geben Sie die Freigabe für den Go-Live.',
        owner: 'client',
        category: 'review',
        daysOffset: 2,
        actionLabel: 'Vorschau ansehen'
      },
      {
        id: 'ms-7',
        order: 7,
        title: 'Customer Journey Prüfung',
        description: 'Unser Marketing-Experte prüft die komplette Customer Journey Ihrer Landingpage auf Conversion-Optimierung. Wir stellen sicher, dass Ihre Seite optimal konvertiert.',
        owner: 'agency',
        category: 'conversion',
        daysOffset: 2
      },
      {
        id: 'ms-8',
        order: 8,
        title: 'Go-Live & Übergabe',
        description: 'Ihre Landingpage geht live! Wir übergeben Ihnen alle Zugangsdaten und Dokumentationen.',
        owner: 'agency',
        category: 'deployment',
        daysOffset: 0
      }
    ],
    infrastructureTasks: toInfrastructure([
      'Domain gekauft',
      'Hosting konfiguriert',
      'SSL-Zertifikat aktiv',
      'Analytics eingerichtet',
      'Conversion Tracking eingerichtet'
    ])
  },

  // Vorlage 2: Website (ca. 8 Wochen)
  {
    id: 'template-website',
    type: 'website',
    name: 'Website',
    description: 'Eine vollständige Website mit ca. 8 Wochen Projektdauer.',
    milestones: [
      {
        id: 'ms-1',
        order: 1,
        title: 'Onboarding & Strategie-Workshop',
        description: 'Umfassender Workshop zur Erfassung Ihrer Anforderungen, Zielgruppen und Unternehmensziele.',
        owner: 'agency',
        category: 'onboarding',
        daysOffset: 0,
        actionUrl: 'https://calendly.com',
        actionLabel: 'Workshop-Termin buchen'
      },
      {
        id: 'ms-2',
        order: 2,
        title: 'Inhalte & Struktur liefern',
        description: 'Bitte stellen Sie alle Texte, Bilder, Dokumente und die gewünschte Seitenstruktur bereit.',
        owner: 'client',
        category: 'content',
        daysOffset: 14,
        actionUrl: 'https://drive.google.com',
        actionLabel: 'Zum Google Drive Ordner'
      },
      {
        id: 'ms-3',
        order: 3,
        title: 'Wireframes & UX-Konzept',
        description: 'Wir entwickeln die Informationsarchitektur und erstellen klickbare Wireframes.',
        owner: 'agency',
        category: 'design',
        daysOffset: 10
      },
      {
        id: 'ms-4',
        order: 4,
        title: 'Feedback zu Wireframes',
        description: 'Bitte prüfen Sie die Wireframes und geben Sie uns Ihr Feedback zur Struktur und Nutzerführung.',
        owner: 'client',
        category: 'review',
        daysOffset: 5,
        actionUrl: 'https://figma.com',
        actionLabel: 'Wireframes ansehen'
      },
      {
        id: 'ms-5',
        order: 5,
        title: 'Screendesign',
        description: 'Basierend auf dem genehmigten UX-Konzept erstellen wir das visuelle Design Ihrer Website.',
        owner: 'agency',
        category: 'design',
        daysOffset: 14
      },
      {
        id: 'ms-6',
        order: 6,
        title: 'Feedback zum Design',
        description: 'Bitte prüfen Sie das finale Design und geben Sie uns Ihr detailliertes Feedback.',
        owner: 'client',
        category: 'review',
        daysOffset: 7,
        actionUrl: 'https://figma.com',
        actionLabel: 'Design ansehen'
      },
      {
        id: 'ms-7',
        order: 7,
        title: 'Technische Entwicklung',
        description: 'Wir entwickeln Ihre Website auf Basis des genehmigten Designs.',
        owner: 'agency',
        category: 'development',
        daysOffset: 21
      },
      {
        id: 'ms-8',
        order: 8,
        title: 'Finale Abnahme',
        description: 'Testen Sie die fertige Website und geben Sie die finale Freigabe.',
        owner: 'client',
        category: 'review',
        daysOffset: 5,
        actionLabel: 'Staging-Seite ansehen'
      },
      {
        id: 'ms-9',
        order: 9,
        title: 'Customer Journey Prüfung',
        description: 'Unser Marketing-Experte analysiert die komplette User Experience und Customer Journey. Wir optimieren die Conversion-Rate und stellen sicher, dass Besucher zu Kunden werden.',
        owner: 'agency',
        category: 'conversion',
        daysOffset: 3
      },
      {
        id: 'ms-10',
        order: 10,
        title: 'Go-Live & Übergabe',
        description: 'Ihre Website geht live! Wir führen den finalen Launch durch und übergeben alle Zugangsdaten.',
        owner: 'agency',
        category: 'deployment',
        daysOffset: 0
      }
    ],
    infrastructureTasks: toInfrastructure([
      'Domain gekauft',
      'Hosting konfiguriert',
      'SSL-Zertifikat aktiv',
      'E-Mail-Konten eingerichtet',
      'Analytics eingerichtet',
      'Conversion Tracking eingerichtet',
      'Backup-System konfiguriert'
    ])
  },

  // Vorlage 3: Software Development (agil, ca. 12 Wochen)
  {
    id: 'template-software',
    type: 'software',
    name: 'Software Development',
    description: 'Agile Softwareentwicklung mit ca. 12 Wochen Projektdauer.',
    milestones: [
      {
        id: 'ms-1',
        order: 1,
        title: 'Discovery & Anforderungs-Workshop',
        description: 'Umfassende Anforderungsanalyse, User Stories und technische Machbarkeitsprüfung.',
        owner: 'agency',
        category: 'onboarding',
        daysOffset: 0,
        actionUrl: 'https://calendly.com',
        actionLabel: 'Workshop-Termin buchen'
      },
      {
        id: 'ms-2',
        order: 2,
        title: 'UI/UX Design & Prototyping',
        description: 'Wir erstellen interaktive Prototypen und das visuelle Designsystem.',
        owner: 'agency',
        category: 'design',
        daysOffset: 14
      },
      {
        id: 'ms-3',
        order: 3,
        title: 'Design-Freigabe',
        description: 'Bitte prüfen und genehmigen Sie das finale Design, bevor wir mit der Entwicklung beginnen.',
        owner: 'client',
        category: 'review',
        daysOffset: 7,
        actionUrl: 'https://figma.com',
        actionLabel: 'Prototyp testen'
      },
      {
        id: 'ms-4',
        order: 4,
        title: 'Sprint 1: Kernfunktionen',
        description: 'Entwicklung der grundlegenden Funktionen und Infrastruktur.',
        owner: 'agency',
        category: 'development',
        daysOffset: 14
      },
      {
        id: 'ms-5',
        order: 5,
        title: 'Sprint 1 Review & Feedback',
        description: 'Präsentation der Sprint-Ergebnisse. Bitte testen Sie die Funktionen und geben Sie Feedback.',
        owner: 'client',
        category: 'review',
        daysOffset: 5,
        actionLabel: 'Demo ansehen'
      },
      {
        id: 'ms-6',
        order: 6,
        title: 'Sprint 2: Erweiterungen',
        description: 'Entwicklung erweiterter Funktionen basierend auf Ihrem Feedback.',
        owner: 'agency',
        category: 'development',
        daysOffset: 14
      },
      {
        id: 'ms-7',
        order: 7,
        title: 'Sprint 2 Review & Feedback',
        description: 'Zweite Sprint-Präsentation. Bitte testen und geben Sie finales Feedback.',
        owner: 'client',
        category: 'review',
        daysOffset: 5,
        actionLabel: 'Demo ansehen'
      },
      {
        id: 'ms-8',
        order: 8,
        title: 'User Acceptance Testing (UAT)',
        description: 'Intensive Testphase. Bitte testen Sie alle Funktionen und melden Sie gefundene Probleme.',
        owner: 'client',
        category: 'review',
        daysOffset: 10,
        actionLabel: 'Test-Umgebung öffnen'
      },
      {
        id: 'ms-9',
        order: 9,
        title: 'Deployment & Live-Schaltung',
        description: 'Ihre Software geht live! Wir führen das finale Deployment durch und übergeben alle Dokumentationen.',
        owner: 'agency',
        category: 'deployment',
        daysOffset: 0
      }
    ],
    infrastructureTasks: toInfrastructure([
      'Cloud-Infrastruktur eingerichtet',
      'CI/CD Pipeline konfiguriert',
      'Datenbank bereitgestellt',
      'Monitoring eingerichtet',
      'Backup-Strategie implementiert',
      'SSL-Zertifikate konfiguriert',
      'Domain konfiguriert'
    ])
  }
];

// Getter für alle verfügbaren Templates (Default + Custom)
export const getTemplateByType = (type: string, customTemplates: ProjectTemplate[] = []): ProjectTemplate | undefined => {
  // Erst in Custom-Templates suchen
  const customTemplate = customTemplates.find(t => t.type === type || t.id === type);
  if (customTemplate) return customTemplate;
  
  // Dann in Default-Templates suchen
  return defaultTemplates.find(t => t.type === type);
};

export const getTemplateById = (id: string, customTemplates: ProjectTemplate[] = []): ProjectTemplate | undefined => {
  // Erst in Custom-Templates suchen
  const customTemplate = customTemplates.find(t => t.id === id);
  if (customTemplate) return customTemplate;
  
  // Dann in Default-Templates suchen
  return defaultTemplates.find(t => t.id === id);
};

export const getAllTemplates = (customTemplates: ProjectTemplate[] = []): ProjectTemplate[] => {
  return [...defaultTemplates, ...customTemplates];
};
