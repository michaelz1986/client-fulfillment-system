import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { ProjectDocumentType } from '../../types/index';

// Dokument-Typen für UI
type DocumentType = ProjectDocumentType | 'agb';

// Demo-Dokumente (In Produktion würden diese aus der DB kommen)
const getDocumentIcon = (type: DocumentType) => {
  switch (type) {
    case 'offer':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'contract':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'agb':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'invoice':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

const getDocumentTypeLabel = (type: DocumentType) => {
  switch (type) {
    case 'offer': return 'Angebot';
    case 'contract': return 'Vertrag';
    case 'agb': return 'AGB';
    case 'invoice': return 'Rechnung';
    default: return 'Dokument';
  }
};

const getDocumentTypeColor = (type: DocumentType) => {
  switch (type) {
    case 'offer': return 'bg-blue-100 text-blue-600';
    case 'contract': return 'bg-primary-100 text-primary-600';
    case 'agb': return 'bg-purple-100 text-purple-600';
    case 'invoice': return 'bg-amber-100 text-amber-600';
    default: return 'bg-dark-100 text-dark-600';
  }
};

function DocumentCard({ document }: { document: DisplayDocument }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getDocumentTypeColor(document.type)}`}>
          {getDocumentIcon(document.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${getDocumentTypeColor(document.type)}`}>
                {getDocumentTypeLabel(document.type)}
              </span>
              <h3 className="font-semibold text-dark-900">{document.name}</h3>
              {document.description && (
                <p className="text-sm text-dark-500 mt-1">{document.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-dark-400">
              Bereitgestellt am {format(parseISO(document.uploadedAt), 'd. MMMM yyyy', { locale: de })}
            </span>
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Herunterladen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DisplayDocument {
  id: string;
  type: DocumentType;
  name: string;
  description?: string;
  url: string;
  uploadedAt: string;
}

export default function ClientDocuments() {
  const { state, getProjectsByClientId, getDocumentsByProjectId } = useApp();

  const clientId = state.currentUser?.clientId;
  const projects = clientId ? getProjectsByClientId(clientId) : [];
  const project = projects[0];

  // Echte Projekt-Dokumente aus dem State
  const projectDocs = project ? getDocumentsByProjectId(project.id) : [];
  
  // Konvertiere zu Display-Format und füge AGB hinzu
  const documents: DisplayDocument[] = [
    // Projekt-Dokumente
    ...projectDocs.map(doc => ({
      id: doc.id,
      type: doc.type as DocumentType,
      name: doc.name,
      description: doc.type === 'offer' 
        ? 'Detaillierte Aufstellung aller Leistungen und Kosten für Ihr Projekt.'
        : doc.type === 'contract'
        ? 'Ihr Vertrag mit uns.'
        : doc.type === 'invoice'
        ? 'Ihre Rechnung.'
        : undefined,
      url: doc.url,
      uploadedAt: doc.uploadedAt
    })),
    // AGB immer anzeigen
    {
      id: 'agb-static',
      type: 'agb' as DocumentType,
      name: 'Allgemeine Geschäftsbedingungen',
      description: 'Unsere aktuellen AGB für die Zusammenarbeit.',
      url: 'https://www.digitalisierungshilfe.at/agb',
      uploadedAt: new Date().toISOString()
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900">Dokumente</h1>
        <p className="text-dark-600 mt-1">
          Alle wichtigen Unterlagen zu Ihrem Projekt
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-primary-900">Ihre Projektunterlagen</h3>
            <p className="text-sm text-primary-700 mt-1">
              Hier finden Sie alle relevanten Dokumente wie Angebote, Verträge und unsere AGB. 
              Bei Fragen wenden Sie sich gerne an Ihren Ansprechpartner.
            </p>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-dark-200 p-12 text-center">
          <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">Noch keine Dokumente</h3>
          <p className="text-dark-500">
            Ihre Projektdokumente werden hier angezeigt, sobald sie verfügbar sind.
          </p>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 pt-8 border-t border-dark-200">
        <h3 className="text-sm font-medium text-dark-700 mb-4">Wichtige Links</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.digitalisierungshilfe.at/agb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            AGB
          </a>
          <a
            href="https://www.digitalisierungshilfe.at/datenschutz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Datenschutz
          </a>
          <a
            href="https://www.digitalisierungshilfe.at/impressum"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Impressum
          </a>
        </div>
      </div>
    </div>
  );
}
