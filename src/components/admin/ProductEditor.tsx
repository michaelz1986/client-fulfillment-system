import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

const ACTION_TYPES = [
  { value: '', label: 'Keine' },
  { value: 'upload', label: '📁 Dateien hochladen' },
  { value: 'feedback', label: '💬 Feedback abgeben' },
  { value: 'approval', label: '✅ Freigabe erteilen' },
  { value: 'calendly', label: '📅 Termin buchen' },
  { value: 'link', label: '🔗 Externer Link' },
];

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, createTemplate, updateTemplate } = useApp();
  
  const isNew = id === 'new';
  const originalDefaultTemplate = !isNew ? defaultTemplates.find(t => t.id === id) : null;
  const isDefault = !!originalDefaultTemplate;
  const modifiedDefaultId = isDefault ? `modified-${id}` : null;
  const existingModifiedTemplate = modifiedDefaultId 
    ? state.customTemplates?.find(t => t.id === modifiedDefaultId) 
    : null;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<MilestoneTemplate[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureTemplate[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneTemplate | null>(null);
  const [newInfraItem, setNewInfraItem] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isNew && id) {
      if (existingModifiedTemplate) {
        setName(existingModifiedTemplate.name);
        setDescription(existingModifiedTemplate.description);
        setMilestones(existingModifiedTemplate.milestones.map(m => ({ ...m, id: m.id || uuidv4() })));
        setInfrastructure(existingModifiedTemplate.infrastructureTasks.map(t => 
          typeof t === 'string' ? { id: uuidv4(), title: t } : { ...t, id: t.id || uuidv4() }
        ));
      } else {
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
    }
  }, [id, isNew, state.customTemplates, existingModifiedTemplate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setMilestones((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        setHasChanges(true);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    if (isDefault) {
      const modifiedTemplate: ProjectTemplate = {
        id: modifiedDefaultId!,
        type: originalDefaultTemplate!.type,
        name,
        description,
        milestones: milestones.map((m, idx) => ({ ...m, order: idx + 1 })),
        infrastructureTasks: infrastructure,
        isCustom: false,
        isModifiedDefault: true,
        originalDefaultId: id,
        createdAt: existingModifiedTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingModifiedTemplate) {
        updateTemplate(modifiedTemplate);
      } else {
        createTemplate(modifiedTemplate);
      }
    } else {
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
    }
    
    navigate('/admin/products');
  };

  const handleResetToDefault = () => {
    if (originalDefaultTemplate) {
      setName(originalDefaultTemplate.name);
      setDescription(originalDefaultTemplate.description);
      setMilestones(originalDefaultTemplate.milestones.map(m => ({ ...m, id: m.id || uuidv4() })));
      setInfrastructure(originalDefaultTemplate.infrastructureTasks.map(t => 
        typeof t === 'string' ? { id: uuidv4(), title: t } : { ...t, id: t.id || uuidv4() }
      ));
      setHasChanges(true);
    }
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
    setHasChanges(true);
  };

  const updateMilestone = (updated: MilestoneTemplate) => {
    setMilestones(milestones.map(m => m.id === updated.id ? updated : m));
    setEditingMilestone(null);
    setHasChanges(true);
  };

  const deleteMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
    setEditingMilestone(null);
    setHasChanges(true);
  };

  const addInfraItem = () => {
    if (!newInfraItem.trim()) return;
    setInfrastructure([...infrastructure, { id: uuidv4(), title: newInfraItem.trim() }]);
    setNewInfraItem('');
    setHasChanges(true);
  };

  const removeInfraItem = (itemId: string) => {
    setInfrastructure(infrastructure.filter(i => i.id !== itemId));
    setHasChanges(true);
  };

  const isModified = existingModifiedTemplate !== null || hasChanges;

  return (
    <div className="p-8 max-w-4xl">
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
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-dark-900">
            {isNew ? 'Neues Produkt erstellen' : name || 'Produkt bearbeiten'}
          </h1>
          {isDefault && (
            <span className="px-2 py-1 text-xs font-medium bg-dark-100 text-dark-600 rounded">
              Standard
            </span>
          )}
          {isModified && isDefault && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded">
              Angepasst
            </span>
          )}
        </div>
        {isDefault && (
          <p className="text-dark-500 mt-2 text-sm">
            Änderungen an Standard-Vorlagen werden separat gespeichert. Neue Projekte verwenden dann die angepasste Version.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-dark-900 mb-4">Grundinformationen</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Produktname</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setHasChanges(true); }}
              placeholder="z.B. Premium Website Paket"
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setHasChanges(true); }}
              placeholder="Kurze Beschreibung des Produkts..."
              rows={2}
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-900">
            Meilensteine ({milestones.length})
          </h2>
          <button
            onClick={addMilestone}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Meilenstein
          </button>
        </div>

        <p className="text-sm text-dark-500 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Meilensteine per Drag & Drop verschieben
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={milestones.map(m => m.id!)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <SortableMilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  isEditing={editingMilestone?.id === milestone.id}
                  editingMilestone={editingMilestone}
                  onEdit={() => setEditingMilestone(milestone)}
                  onSave={updateMilestone}
                  onCancel={() => setEditingMilestone(null)}
                  onDelete={() => deleteMilestone(milestone.id!)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {milestones.length === 0 && (
          <div className="text-center py-8 text-dark-500">
            Noch keine Meilensteine. Klicke auf "+ Meilenstein" um einen hinzuzufügen.
          </div>
        )}
      </div>

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
              <button
                onClick={() => removeInfraItem(item.id!)}
                className="p-1 text-dark-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

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
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={!name.trim() || milestones.length === 0}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isNew ? 'Produkt erstellen' : 'Änderungen speichern'}
        </button>
        
        {isDefault && existingModifiedTemplate && (
          <button
            onClick={handleResetToDefault}
            className="px-6 py-2 text-amber-600 hover:bg-amber-50 font-medium rounded-lg transition-colors"
          >
            Auf Standard zurücksetzen
          </button>
        )}
        
        <button
          onClick={() => navigate('/admin/products')}
          className="px-6 py-2 text-dark-600 hover:text-dark-800"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

function SortableMilestoneItem({
  milestone,
  index,
  isEditing,
  editingMilestone,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  milestone: MilestoneTemplate;
  index: number;
  isEditing: boolean;
  editingMilestone: MilestoneTemplate | null;
  onEdit: () => void;
  onSave: (m: MilestoneTemplate) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-white ${
        isEditing
          ? 'border-primary-500 bg-primary-50'
          : isDragging
          ? 'border-primary-300 shadow-lg'
          : 'border-dark-200 hover:border-dark-300'
      }`}
    >
      {isEditing && editingMilestone ? (
        <MilestoneEditForm
          milestone={editingMilestone}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      ) : (
        <div className="flex items-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className="p-2 cursor-grab active:cursor-grabbing text-dark-400 hover:text-dark-600 touch-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          
          <div className="w-8 h-8 bg-dark-100 rounded-full flex items-center justify-center text-sm font-medium text-dark-600">
            {index + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-dark-900">{milestone.title}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${
                milestone.owner === 'client' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {milestone.owner === 'client' ? 'Kunde' : 'Agentur'}
              </span>
              {milestone.actionType && (
                <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
                  {ACTION_TYPES.find(a => a.value === milestone.actionType)?.label || milestone.actionType}
                </span>
              )}
            </div>
            <p className="text-sm text-dark-500 truncate">{milestone.description || 'Keine Beschreibung'}</p>
          </div>
          
          <div className="text-sm text-dark-500 whitespace-nowrap">
            +{milestone.daysOffset} Tage
          </div>
          
          <button
            onClick={onEdit}
            className="p-2 text-dark-400 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
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

      <div className="grid grid-cols-3 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Kunden-Aktion</label>
          <select
            value={form.actionType || ''}
            onChange={(e) => setForm({ ...form, actionType: e.target.value as MilestoneTemplate['actionType'] || undefined })}
            className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {ACTION_TYPES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {(form.actionType === 'link' || form.actionType === 'calendly') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              {form.actionType === 'calendly' ? 'Calendly URL' : 'Link URL'}
            </label>
            <input
              type="url"
              value={form.actionUrl || ''}
              onChange={(e) => setForm({ ...form, actionUrl: e.target.value || undefined })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Button-Text</label>
            <input
              type="text"
              value={form.actionLabel || ''}
              onChange={(e) => setForm({ ...form, actionLabel: e.target.value || undefined })}
              placeholder={form.actionType === 'calendly' ? 'Termin buchen' : 'Link öffnen'}
              className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

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
