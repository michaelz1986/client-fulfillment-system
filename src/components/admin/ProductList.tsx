import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { defaultTemplates, getAllTemplates } from '../../data/templates';
import { ProjectTemplate } from '../../types/index';

export default function ProductList() {
  const { state, deleteTemplate } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const allTemplates = getAllTemplates(state.customTemplates);
  const customTemplates = state.customTemplates || [];

  const handleDelete = (templateId: string) => {
    deleteTemplate(templateId);
    setShowDeleteModal(null);
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      landingpage: 'Landingpage',
      website: 'Website',
      software: 'Software',
      custom: 'Custom'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      landingpage: 'bg-primary-100 text-primary-700',
      website: 'bg-purple-100 text-purple-700',
      software: 'bg-amber-100 text-amber-700',
      custom: 'bg-dark-100 text-dark-700'
    };
    return colors[type] || 'bg-dark-100 text-dark-700';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Produkte / Templates</h1>
          <p className="text-dark-600 mt-1">
            {allTemplates.length} Produkt-Vorlagen verfügbar
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/products/ai"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-700 hover:to-primary-700 text-white font-medium rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mit KI erstellen
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Manuell erstellen
          </Link>
        </div>
      </div>

      {/* Default Templates */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-dark-900 mb-4">Standard-Vorlagen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultTemplates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              isDefault={true}
              getTypeLabel={getTypeLabel}
              getTypeColor={getTypeColor}
            />
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <h2 className="text-lg font-semibold text-dark-900 mb-4">
          Eigene Produkte 
          <span className="text-dark-400 font-normal ml-2">({customTemplates.length})</span>
        </h2>
        
        {customTemplates.length === 0 ? (
          <div className="bg-dark-50 border border-dashed border-dark-300 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-medium text-dark-900 mb-1">Noch keine eigenen Produkte</h3>
            <p className="text-dark-500 text-sm mb-4">
              Erstelle ein eigenes Produkt mit individuellen Meilensteinen.
            </p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Neues Produkt erstellen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                isDefault={false}
                getTypeLabel={getTypeLabel}
                getTypeColor={getTypeColor}
                onDelete={() => setShowDeleteModal(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-900 mb-2">Produkt löschen?</h3>
            <p className="text-dark-600 mb-6">
              Dieses Produkt wird endgültig gelöscht. Bestehende Projekte sind davon nicht betroffen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ 
  template, 
  isDefault,
  getTypeLabel,
  getTypeColor,
  onDelete
}: { 
  template: ProjectTemplate; 
  isDefault: boolean;
  getTypeLabel: (type: string) => string;
  getTypeColor: (type: string) => string;
  onDelete?: () => void;
}) {
  const totalDays = template.milestones.reduce((sum, m) => sum + m.daysOffset, 0);
  const weeks = Math.ceil(totalDays / 7);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(template.type)}`}>
          {getTypeLabel(template.type)}
        </span>
        {isDefault && (
          <span className="text-xs text-dark-400">Standard</span>
        )}
      </div>
      
      <h3 className="font-semibold text-dark-900 mb-1">{template.name}</h3>
      <p className="text-sm text-dark-500 mb-4 line-clamp-2">{template.description}</p>
      
      <div className="flex items-center gap-4 text-sm text-dark-600 mb-4">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {template.milestones.length} Meilensteine
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ~{weeks} Wochen
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/admin/products/${template.id}`}
          className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          {isDefault ? 'Ansehen' : 'Bearbeiten'}
        </Link>
        {!isDefault && onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Löschen
          </button>
        )}
      </div>
    </div>
  );
}
