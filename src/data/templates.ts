import { ProjectTemplate } from '../types/index';

// ============================================
// MEILENSTEIN-VORLAGEN gemäß Mandat Kapitel 6
// ============================================

export const projectTemplates: ProjectTemplate[] = [
  // Vorlage 1: Landingpage (ca. 4 Wochen)
  {
    type: 'landingpage',
    name: 'Landingpage',
    description: 'Eine fokussierte Landingpage mit ca. 4 Wochen Projektdauer.',
    milestones: [
      {
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
        order: 3,
        title: 'Erster Design-Entwurf',
        description: 'Wir erstellen basierend auf Ihren Inhalten den ersten visuellen Entwurf Ihrer Landingpage.',
        owner: 'agency',
        category: 'design',
        daysOffset: 10
      },
      {
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
        order: 5,
        title: 'Umsetzung der Änderungen',
        description: 'Wir setzen Ihr Feedback um und finalisieren das Design.',
        owner: 'agency',
        category: 'design',
        daysOffset: 5
      },
      {
        order: 6,
        title: 'Finale Abnahme',
        description: 'Bitte prüfen Sie die finale Version und geben Sie die Freigabe für den Go-Live.',
        owner: 'client',
        category: 'review',
        daysOffset: 2,
        actionLabel: 'Vorschau ansehen'
      },
      {
        order: 7,
        title: 'Go-Live & Übergabe',
        description: 'Ihre Landingpage geht live! Wir übergeben Ihnen alle Zugangsdaten und Dokumentationen.',
        owner: 'agency',
        category: 'deployment',
        daysOffset: 0
      }
    ],
    infrastructureTasks: [
      'Domain gekauft',
      'Hosting konfiguriert',
      'SSL-Zertifikat aktiv',
      'Analytics eingerichtet'
    ]
  },

  // Vorlage 2: Website (ca. 8 Wochen)
  {
    type: 'website',
    name: 'Website',
    description: 'Eine vollständige Website mit ca. 8 Wochen Projektdauer.',
    milestones: [
      {
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
        order: 3,
        title: 'Wireframes & UX-Konzept',
        description: 'Wir entwickeln die Informationsarchitektur und erstellen klickbare Wireframes.',
        owner: 'agency',
        category: 'design',
        daysOffset: 10
      },
      {
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
        order: 5,
        title: 'Screendesign',
        description: 'Basierend auf dem genehmigten UX-Konzept erstellen wir das visuelle Design Ihrer Website.',
        owner: 'agency',
        category: 'design',
        daysOffset: 14
      },
      {
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
        order: 7,
        title: 'Technische Entwicklung',
        description: 'Wir entwickeln Ihre Website auf Basis des genehmigten Designs.',
        owner: 'agency',
        category: 'development',
        daysOffset: 21
      },
      {
        order: 8,
        title: 'Finale Abnahme & Go-Live',
        description: 'Testen Sie die fertige Website und geben Sie die finale Freigabe für den Launch.',
        owner: 'client',
        category: 'deployment',
        daysOffset: 5,
        actionLabel: 'Staging-Seite ansehen'
      }
    ],
    infrastructureTasks: [
      'Domain gekauft',
      'Hosting konfiguriert',
      'SSL-Zertifikat aktiv',
      'E-Mail-Konten eingerichtet',
      'Analytics eingerichtet',
      'Backup-System konfiguriert'
    ]
  },

  // Vorlage 3: Software Development (agil, ca. 12 Wochen)
  {
    type: 'software',
    name: 'Software Development',
    description: 'Agile Softwareentwicklung mit ca. 12 Wochen Projektdauer.',
    milestones: [
      {
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
        order: 2,
        title: 'UI/UX Design & Prototyping',
        description: 'Wir erstellen interaktive Prototypen und das visuelle Designsystem.',
        owner: 'agency',
        category: 'design',
        daysOffset: 14
      },
      {
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
        order: 4,
        title: 'Sprint 1: Kernfunktionen',
        description: 'Entwicklung der grundlegenden Funktionen und Infrastruktur.',
        owner: 'agency',
        category: 'development',
        daysOffset: 14
      },
      {
        order: 5,
        title: 'Sprint 1 Review & Feedback',
        description: 'Präsentation der Sprint-Ergebnisse. Bitte testen Sie die Funktionen und geben Sie Feedback.',
        owner: 'client',
        category: 'review',
        daysOffset: 5,
        actionLabel: 'Demo ansehen'
      },
      {
        order: 6,
        title: 'Sprint 2: Erweiterungen',
        description: 'Entwicklung erweiterter Funktionen basierend auf Ihrem Feedback.',
        owner: 'agency',
        category: 'development',
        daysOffset: 14
      },
      {
        order: 7,
        title: 'Sprint 2 Review & Feedback',
        description: 'Zweite Sprint-Präsentation. Bitte testen und geben Sie finales Feedback.',
        owner: 'client',
        category: 'review',
        daysOffset: 5,
        actionLabel: 'Demo ansehen'
      },
      {
        order: 8,
        title: 'User Acceptance Testing (UAT)',
        description: 'Intensive Testphase. Bitte testen Sie alle Funktionen und melden Sie gefundene Probleme.',
        owner: 'client',
        category: 'review',
        daysOffset: 10,
        actionLabel: 'Test-Umgebung öffnen'
      },
      {
        order: 9,
        title: 'Deployment & Live-Schaltung',
        description: 'Ihre Software geht live! Wir führen das finale Deployment durch und übergeben alle Dokumentationen.',
        owner: 'agency',
        category: 'deployment',
        daysOffset: 0
      }
    ],
    infrastructureTasks: [
      'Cloud-Infrastruktur eingerichtet',
      'CI/CD Pipeline konfiguriert',
      'Datenbank bereitgestellt',
      'Monitoring eingerichtet',
      'Backup-Strategie implementiert',
      'SSL-Zertifikate konfiguriert',
      'Domain konfiguriert'
    ]
  }
];

export const getTemplateByType = (type: string): ProjectTemplate | undefined => {
  return projectTemplates.find(t => t.type === type);
};
