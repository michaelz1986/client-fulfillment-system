import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types/index';

// Client Form Modal
function ClientFormModal({
  client,
  onSave,
  onClose
}: {
  client?: Client;
  onSave: (data: Omit<Client, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      phone: phone || undefined
    });
    onClose();
  };
  
  const isValid = name.trim() !== '' && email.trim() !== '';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">
          {client ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              E-Mail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@beispiel.de"
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Telefon (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 170 1234567"
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-dark-600 hover:text-dark-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed"
            >
              {client ? 'Speichern' : 'Anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  client,
  projectCount,
  onConfirm,
  onClose
}: {
  client: Client;
  projectCount: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-dark-900 mb-2">Kunde löschen?</h3>
        <p className="text-dark-600 mb-4">
          Sind Sie sicher, dass Sie den Kunden "{client.name}" löschen möchten?
        </p>
        {projectCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4">
            <strong>Achtung:</strong> Dieser Kunde hat {projectCount} aktive{' '}
            {projectCount === 1 ? 'Projekt' : 'Projekte'}. Diese werden nicht gelöscht.
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-dark-600 hover:text-dark-800"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

// Credentials Modal - Zeigt Zugangsdaten an
function CredentialsModal({
  client,
  credentials,
  onClose
}: {
  client: Client;
  credentials: { email: string; password: string };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `Zugangsdaten für ${client.name}\n\nPortal: ${window.location.origin}\nE-Mail: ${credentials.email}\nPasswort: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Zugangsdaten erstellt</h3>
            <p className="text-sm text-dark-500">{client.name}</p>
          </div>
        </div>
        
        <div className="bg-dark-50 rounded-lg p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs text-dark-500 uppercase tracking-wider mb-1">Portal</label>
            <p className="text-sm font-mono text-dark-900">{window.location.origin}</p>
          </div>
          <div>
            <label className="block text-xs text-dark-500 uppercase tracking-wider mb-1">E-Mail</label>
            <p className="text-sm font-mono text-dark-900">{credentials.email}</p>
          </div>
          <div>
            <label className="block text-xs text-dark-500 uppercase tracking-wider mb-1">Passwort</label>
            <p className="text-sm font-mono text-dark-900 bg-amber-50 px-2 py-1 rounded">{credentials.password}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Wichtig:</strong> Speichern Sie diese Zugangsdaten oder senden Sie sie dem Kunden. 
            Das Passwort kann nicht erneut angezeigt werden.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kopiert!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Kopieren
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientList() {
  const { state, createClient, updateClient, deleteClient, getProjectsByClientId, createClientUser, getUserByClientId } = useApp();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCredentials, setNewCredentials] = useState<{ client: Client; email: string; password: string } | null>(null);
  
  // Filter clients
  const filteredClients = state.clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateClient = (data: Omit<Client, 'id' | 'createdAt'>) => {
    createClient(data);
    setShowCreateModal(false);
  };
  
  const handleUpdateClient = (data: Omit<Client, 'id' | 'createdAt'>) => {
    if (editingClient) {
      updateClient({
        ...editingClient,
        ...data
      });
      setEditingClient(null);
    }
  };
  
  const handleDeleteClient = () => {
    if (deletingClient) {
      deleteClient(deletingClient.id);
      setDeletingClient(null);
    }
  };

  const handleCreateCredentials = (client: Client) => {
    const { password } = createClientUser(client.id, client.email, client.name);
    setNewCredentials({ client, email: client.email, password });
  };
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Kunden</h1>
          <p className="text-dark-600 mt-1">
            {state.clients.length} {state.clients.length === 1 ? 'Kunde' : 'Kunden'} insgesamt
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neuer Kunde
        </button>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kunden suchen..."
            className="w-full pl-10 pr-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      
      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-12 text-center">
          <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">
            {searchTerm ? 'Keine Kunden gefunden' : 'Noch keine Kunden'}
          </h3>
          <p className="text-dark-500 mb-6">
            {searchTerm 
              ? 'Versuchen Sie einen anderen Suchbegriff.'
              : 'Legen Sie Ihren ersten Kunden an.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Neuen Kunden anlegen
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-dark-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Portal-Zugang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Projekte
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => {
                const projectCount = getProjectsByClientId(client.id).length;
                const clientUser = getUserByClientId(client.id);
                
                return (
                  <tr key={client.id} className="hover:bg-dark-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-dark-900">{client.name}</div>
                          <div className="text-xs text-dark-400">
                            Seit {format(parseISO(client.createdAt), 'd. MMM yyyy', { locale: de })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-900">{client.email}</div>
                      {client.phone && (
                        <div className="text-sm text-dark-500">{client.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {clientUser ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                            <span className="text-sm text-dark-700">Zugang aktiv</span>
                          </div>
                          {clientUser.lastLoginAt ? (
                            <div className="text-xs text-dark-500 mt-1">
                              Letzter Login: {format(parseISO(clientUser.lastLoginAt), 'd. MMM, HH:mm', { locale: de })}
                            </div>
                          ) : (
                            <div className="text-xs text-amber-600 mt-1">
                              Noch nie eingeloggt
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCreateCredentials(client)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Zugang erstellen
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        projectCount > 0 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-dark-100 text-dark-600'
                      }`}>
                        {projectCount} {projectCount === 1 ? 'Projekt' : 'Projekte'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingClient(client)}
                          className="p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingClient(client)}
                          className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modals */}
      {showCreateModal && (
        <ClientFormModal
          onSave={handleCreateClient}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {editingClient && (
        <ClientFormModal
          client={editingClient}
          onSave={handleUpdateClient}
          onClose={() => setEditingClient(null)}
        />
      )}
      
      {deletingClient && (
        <DeleteConfirmModal
          client={deletingClient}
          projectCount={getProjectsByClientId(deletingClient.id).length}
          onConfirm={handleDeleteClient}
          onClose={() => setDeletingClient(null)}
        />
      )}

      {newCredentials && (
        <CredentialsModal
          client={newCredentials.client}
          credentials={{ email: newCredentials.email, password: newCredentials.password }}
          onClose={() => setNewCredentials(null)}
        />
      )}
    </div>
  );
}
