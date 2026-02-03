import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types/index';

const COLORS = [
  { value: '#0d9488', label: 'Teal' },
  { value: '#7c3aed', label: 'Lila' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Rot' },
  { value: '#3b82f6', label: 'Blau' },
  { value: '#10b981', label: 'Grün' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6366f1', label: 'Indigo' },
];

export default function EmployeeList() {
  const { state, createEmployee, updateEmployee, deleteEmployee } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const employees = state.employees || [];

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Projektmanager',
    calendlyUrl: '',
    color: '#0d9488',
    isActive: true
  });

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'Projektmanager',
      calendlyUrl: '',
      color: '#0d9488',
      isActive: true
    });
    setEditingEmployee(null);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      calendlyUrl: employee.calendlyUrl || '',
      color: employee.color,
      isActive: employee.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return;

    if (editingEmployee) {
      updateEmployee({
        ...editingEmployee,
        ...form
      });
    } else {
      createEmployee(form);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    setShowDeleteConfirm(null);
  };

  // Zähle Projekte pro Mitarbeiter
  const getProjectCount = (employeeId: string) => {
    return (state.projects || []).filter(p => 
      p.assignedEmployeeIds?.includes(employeeId) || p.leadEmployeeId === employeeId
    ).length;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Team</h1>
          <p className="text-dark-600 mt-1">
            {employees.length} Mitarbeiter
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Mitarbeiter hinzufügen
        </button>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white rounded-xl shadow-sm border border-dark-200 overflow-hidden"
          >
            <div 
              className="h-2"
              style={{ backgroundColor: employee.color }}
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                    style={{ backgroundColor: employee.color }}
                  >
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900">{employee.name}</h3>
                    <p className="text-sm text-dark-500">{employee.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  employee.isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-dark-100 text-dark-500'
                }`}>
                  {employee.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {employee.email}
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-dark-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {employee.phone}
                  </div>
                )}
                {employee.calendlyUrl && (
                  <a 
                    href={employee.calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendly öffnen
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-100">
                <span className="text-sm text-dark-500">
                  {getProjectCount(employee.id)} Projekte
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(employee)}
                    className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Bearbeiten"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(employee.id)}
                    className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Löschen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {employees.length === 0 && (
          <div className="col-span-full bg-dark-50 border border-dashed border-dark-300 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-dark-900 mb-1">Noch keine Mitarbeiter</h3>
            <p className="text-dark-500 text-sm mb-4">
              Füge Teammitglieder hinzu um sie Projekten zuzuweisen.
            </p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ersten Mitarbeiter hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-900 mb-4">
              {editingEmployee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Max Mustermann"
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">E-Mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="max@firma.de"
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+43 660 ..."
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Rolle</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Projektmanager"
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Calendly URL</label>
                <input
                  type="url"
                  value={form.calendlyUrl}
                  onChange={(e) => setForm({ ...form, calendlyUrl: e.target.value })}
                  placeholder="https://calendly.com/..."
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Farbe</label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setForm({ ...form, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        form.color === color.value 
                          ? 'border-dark-900 scale-110' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-dark-700">Aktiv</span>
              </label>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.email.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-300 text-white rounded-lg transition-colors"
              >
                {editingEmployee ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-900 mb-2">Mitarbeiter löschen?</h3>
            <p className="text-dark-600 mb-6">
              Der Mitarbeiter wird aus allen Projekten entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
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
