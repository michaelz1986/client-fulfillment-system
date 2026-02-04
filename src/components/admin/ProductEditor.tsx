import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../context/AppContext';
import { defaultTemplates, getTemplateById } from '../../data/templates';
import { ProjectTemplate, MilestoneTemplate, InfrastructureTemplate, MilestoneOwner, MilestoneCategory } from '../../types/index';

const CATEGORIES: { value: MilestoneCategory; label: string }[] = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'content', label: 'Content' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Entwicklung' },
  { value: 'review', label: 'Review' },
  { value: 'conversion', label: 'Conversion-Prüfung' },
  { value: 'deployment', label: 'Deployment' }
];

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, createTemplate, updateTemplate } = useApp();
  
  const isNew = id === 'new';
  const isDefault = !isNew && defaultTemplates.some(t => t.id === id);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<MilestoneTemplate[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureTemplate[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneTemplate | null>(null);
  const [newInfraItem, setNewInfraItem] = useState('');

  // Load existing template
  useEffect(() => {
    if (!isNew && id) {
      const template = getTemplateById(id, state.customTemplates);
      if (template) {
        setName(template.name);
        setDescription(template.description);
        setMilestones(template.milestones.map(m => ({ ...m, id: m.id || uuidv4() })));
        setInfrastructure(template.infrastructureTasks.map(t => 
          typeof t === 'string' ? { id: uuidv4(), title: t } : { ...t, id: t.id || uuidv4() }
        ));
      }
    }
  }, [id, isNew, state.customTemplates]);

  const handleSave = () => {
    const template: ProjectTemplate = {
      id: isNew ? `template-custom-${uuidv4()}` : id!,
      type: 'custom',
      name,
      description,
      milestones: milestones.map((m, idx) => ({ ...m, order: idx + 1 })),
      infrastructureTasks: infrastructure,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      createTemplate(template);
    } else {
      updateTemplate(template);
    }
    
    navigate('/admin/products');
  };

  const addMilestone = () => {
    const newMilestone: MilestoneTemplate = {
      id: uuidv4(),
      order: milestones.length + 1,
      title: 'Neuer Meilenstein',
      description: '',
      owner: 'agency',
      category: 'development',
      daysOffset: 7
    };
    setMilestones([...milestones, newMilestone]);
    setEditingMilestone(newMilestone);
  };

  const updateMilestone = (updated: MilestoneTemplate) => {
    setMilestones(milestones.map(m => m.id === updated.id ? updated : m));
    setEditingMilestone(null);
  };

  const deleteMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
    setEditingMilestone(null);
  };

  const moveMilestone = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= milestones.length) return;
    
    const newMilestones = [...milestones];
    [newMilestones[index], newMilestones[newIndex]] = [newMilestones[newIndex], newMilestones[index]];
    setMilestones(newMilestones);
  };

  const addInfraItem = () => {
    if (!newInfraItem.trim()) return;
    setInfrastructure([...infrastructure, { id: uuidv4(), title: newInfraItem.trim() }]);
    setNewInfraItem('');
  };

  const removeInfraItem = (itemId: string) => {
    setInfrastructure(infrastructure.filter(i => i.id !== itemId));
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-dark-500 hover:text-dark-700 text-sm flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zu Produkten
        </button>
        <h1 className="text-3xl font-bold text-dark-900">
          {isNew ? 'Neues Produkt erstellen' : isDefault ? `${name} (Standard)` : name || 'Produkt bearbeiten'}
        </h1>
        {isDefault && (
          <p className="text-amber-600 mt-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Standard-Vorlagen können nicht bearbeitet werden. Du kannst sie als Basis für ein neues Produkt nutzen.
          </p>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-dark-900 mb-4">Grundinformationen</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Produktname</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isDefault}
              placeholder="z.B. Premium Website Paket"
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-dark-50 disabled:text-dark-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isDefault}
              placeholder="Kurze Beschreibung des Produkts..."
              rows={2}
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-dark-50 disabled:text-dark-500"
            />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-900">
            Meilensteine ({milestones.length})
          </h2>
          {!isDefault && (
            <button
              onClick={addMilestone}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Meilenstein
            </button>
          )}
        </div>

        <div className="space-y-2">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={`border rounded-lg p-4 ${
                editingMilestone?.id === milestone.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-dark-200 hover:border-dark-300'
              }`}
            >
              {editingMilestone?.id === milestone.id && editingMilestone ? (
                <MilestoneEditForm
                  milestone={editingMilestone}
                  onSave={updateMilestone}
                  onCancel={() => setEditingMilestone(null)}
                  onDelete={() => deleteMilestone(milestone.id!)}
                />
              ) : (
                <div className="flex items-center gap-4">
                  {!isDefault && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveMilestone(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveMilestone(index, 'down')}
                        disabled={index === milestones.length - 1}
                        className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="w-8 h-8 bg-dark-100 rounded-full flex items-center justify-center text-sm font-medium text-dark-600">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dark-900">{milestone.title}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        milestone.owner === 'client' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {milestone.owner === 'client' ? 'Kunde' : 'Agentur'}
                      </span>
                    </div>
                    <p className="text-sm text-dark-500 truncate">{milestone.description || 'Keine Beschreibung'}</p>
                  </div>
                  
                  <div className="text-sm text-dark-500">
                    +{milestone.daysOffset} Tage
                  </div>
                  
                  {!isDefault && (
                    <button
                      onClick={() => setEditingMilestone(milestone)}
                      className="p-2 text-dark-400 hover:text-primary-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {milestones.length === 0 && (
            <div className="text-center py-8 text-dark-500">
              Noch keine Meilensteine. Klicke auf "+ Meilenstein" um einen hinzuzufügen.
            </div>
          )}
        </div>
      </div>

      {/* Infrastructure */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-dark-900 mb-4">
          Infrastruktur-Checkliste ({infrastructure.length})
        </h2>
        
        <div className="space-y-2 mb-4">
          {infrastructure.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-3 p-2 bg-dark-50 rounded-lg"
            >
              <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1 text-dark-700">{item.title}</span>
              {!isDefault && (
                <button
                  onClick={() => removeInfraItem(item.id!)}
                  className="p-1 text-dark-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {!isDefault && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newInfraItem}
              onChange={(e) => setNewInfraItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInfraItem()}
              placeholder="Neues Infrastruktur-Item hinzufügen..."
              className="flex-1 px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={addInfraItem}
              className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 rounded-lg transition-colors"
            >
              Hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isDefault && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={!name.trim() || milestones.length === 0}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isNew ? 'Produkt erstellen' : 'Änderungen speichern'}
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 text-dark-600 hover:text-dark-800"
          >
            Abbrechen
          </button>
        </div>
      )}

      {isDefault && (
        <button
          onClick={() => {
            // Clone to new custom template
            navigate('/admin/products/new');
          }}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          Als Vorlage für neues Produkt verwenden
        </button>
      )}
    </div>
  );
}

function MilestoneEditForm({
  milestone,
  onSave,
  onCancel,
  onDelete
}: {
  milestone: MilestoneTemplate;
  onSave: (m: MilestoneTemplate) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(milestone);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Titel</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Tage-Offset</label>
          <input
            type="number"
            value={form.daysOffset}
            onChange={(e) => setForm({ ...form, daysOffset: parseInt(e.target.value) || 0 })}
            min={0}
            className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 mb-1">Beschreibung</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Verantwortlich</label>
          <select
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value as MilestoneOwner })}
            className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="agency">Agentur</option>
            <option value="client">Kunde</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Kategorie</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as MilestoneCategory })}
            className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Action URL (optional)</label>
          <input
            type="url"
            value={form.actionUrl || ''}
            onChange={(e) => setForm({ ...form, actionUrl: e.target.value || undefined })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Action Label (optional)</label>
          <input
            type="text"
            value={form.actionLabel || ''}
            onChange={(e) => setForm({ ...form, actionLabel: e.target.value || undefined })}
            placeholder="z.B. Link öffnen"
            className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Meilenstein löschen
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
