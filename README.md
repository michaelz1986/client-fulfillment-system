# Client Fulfillment System - Prototyp

Ein intelligentes, prozessgesteuertes Kunden-Projektportal für digitale Agenturen.

## Vision

Dieses System soll den manuellen Aufwand im Projektmanagement drastisch reduzieren. Es ist ein digitaler Begleiter, der Kunden unmissverständlich durch den gesamten Projektlebenszyklus führt und Klarheit schafft, wo heute Chaos herrscht.

## Features

### Admin-Dashboard
- Zentrale Projektübersicht mit Fortschrittsanzeigen
- Warnsymbole für überfällige Meilensteine (gelb/rot)
- Eskalations-Monitor mit automatischer Benachrichtigungslogik
- Projekt-Wizard für schnelle Projekterstellung
- Kundenverwaltung mit CRUD-Funktionen

### Kunden-Portal
- "Eine-Aufgabe-Prinzip" - Fokussierte Ansicht auf den nächsten Schritt
- Minimalistische Timeline mit Fortschrittsanzeige
- "Ich bin fertig"-Button für Aufgabenabschluss
- Benachrichtigungseinstellungen (E-Mail/SMS)

### Intelligente Automatisierung
- **Deadline-Kaskade**: Bei Verzögerungen werden alle nachfolgenden Meilensteine automatisch verschoben
- **Dreistufige Eskalation**:
  - Stufe 1 (1 Tag): Freundliche Erinnerung
  - Stufe 2 (3 Tage): Dringende Warnung
  - Stufe 3 (7 Tage): Kritische Eskalation mit interner Benachrichtigung

### Projekt-Vorlagen
1. **Landingpage** (~4 Wochen, 7 Meilensteine)
2. **Website** (~8 Wochen, 8 Meilensteine)
3. **Software Development** (~12 Wochen, 9 Meilensteine)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **State Management**: React Context + localStorage
- **Build Tool**: Vite 5
- **Datum/Zeit**: date-fns

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Demo-Zugangsdaten

**Admin (Alex)**
- E-Mail: alex@agentur.de
- Passwort: admin123

**Kunde (Julia)**
- E-Mail: julia@techvision.de
- Passwort: client123

## Projektstruktur

\`\`\`
src/
├── components/
│   ├── admin/           # Admin-Komponenten
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── ClientList.tsx
│   │   ├── EscalationPanel.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── ProjectList.tsx
│   │   └── ProjectWizard.tsx
│   ├── client/          # Kunden-Komponenten
│   │   ├── ClientDashboard.tsx
│   │   ├── ClientLayout.tsx
│   │   └── ClientSettings.tsx
│   ├── Login.tsx
│   └── ProtectedRoute.tsx
├── context/
│   └── AppContext.tsx   # Zentraler State
├── data/
│   ├── initialData.ts   # Demo-Daten
│   └── templates.ts     # Projekt-Vorlagen
├── hooks/
│   └── useEscalationEngine.ts
├── types/
│   └── index.ts         # TypeScript-Typen
├── App.tsx
└── main.tsx
\`\`\`

## Implementierte Phasen

- [x] **Phase 1**: Fundament (Projektstruktur, Datenmodelle, Login)
- [x] **Phase 2**: Admin-Universum (Dashboard, CRUD, Projekt-Wizard)
- [x] **Phase 3**: Kunden-Oase (Eine-Aufgabe-Ansicht, Timeline)
- [x] **Phase 4**: Intelligenz (Deadline-Kaskade, Eskalations-Engine)

## Nächste Schritte für Produktion

1. Backend-Integration (API, Datenbank)
2. Authentifizierung mit JWT
3. E-Mail- und SMS-Integration
4. Dateiupload für Inhalte
5. Echtzeit-Updates mit WebSockets
6. Umfassende Tests
