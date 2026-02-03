import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';
import { ProjectType, Client } from '../../types/index';
import { defaultTemplates, getAllTemplates, getTemplateByType } from '../../data/templates';

type WizardStep = 1 | 2 | 3;

export default function ProjectWizard() {
  const navigate = useNavigate();
  const { state, createClient, createProject } = useApp();
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  
  // Step 1: Client
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  // Step 2: Project Details
  const [projectTitle, setProjectTitle] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('website');
  
  // Step 3: Timeline
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Validation
  const isStep1Valid = isNewClient 
    ? (newClientName.trim() !== '' && newClientEmail.trim() !== '')
    : selectedClientId !== '';
    
  const isStep2Valid = projectTitle.trim() !== '';
  
  // Get selected template
  const selectedTemplate = getTemplateByType(projectType, state.customTemplates);
  
  // Calculate milestone dates for preview
  const getMilestoneDates = () => {
    if (!selectedTemplate) return [];
    
    let currentDate = new Date(startDate);
    return selectedTemplate.milestones.map((m) => {
      currentDate = addDays(currentDate, m.daysOffset);
      return {
        ...m,
        calculatedDate: new Date(currentDate)
      };
    });
  };
  
  // Handle Step Navigation
  const goToStep = (step: WizardStep) => {
    if (step === 2 && !isStep1Valid) return;
    if (step === 3 && !isStep2Valid) return;
    setCurrentStep(step);
  };
  
  // Handle Submit
  const handleSubmit = () => {
    let clientId = selectedClientId;
    
    // Create new client if needed
    if (isNewClient) {
      const newClient = createClient({
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone || undefined
      });
      clientId = newClient.id;
    }
    
    // Create project
    const project = createProject(
      clientId,
      projectTitle,
      projectType,
      new Date(startDate)
    );
    
    // Navigate to project detail
    navigate(`/admin/projects/${project.id}`);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900">Neues Projekt erstellen</h1>
        <p className="text-dark-600 mt-1">
          Folgen Sie den Schritten, um ein neues Projekt anzulegen.
        </p>
      </div>
      
      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => goToStep(step as WizardStep)}
              disabled={
                (step === 2 && !isStep1Valid) ||
                (step === 3 && (!isStep1Valid || !isStep2Valid))
              }
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                currentStep === step
                  ? 'bg-primary-600 text-white'
                  : currentStep > step
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-200 text-dark-500'
              } ${
                ((step === 2 && !isStep1Valid) || (step === 3 && (!isStep1Valid || !isStep2Valid)))
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:opacity-80'
              }`}
            >
              {currentStep > step ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </button>
            {step < 3 && (
              <div className={`w-24 h-1 mx-2 rounded ${
                currentStep > step ? 'bg-primary-500' : 'bg-dark-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex items-center gap-4 mb-8 text-sm">
        <div className="w-10 text-center">
          <span className={currentStep === 1 ? 'font-medium text-primary-600' : 'text-dark-500'}>
            Kunde
          </span>
        </div>
        <div className="w-24" />
        <div className="w-10 text-center">
          <span className={currentStep === 2 ? 'font-medium text-primary-600' : 'text-dark-500'}>
            Details
          </span>
        </div>
        <div className="w-24" />
        <div className="w-10 text-center">
          <span className={currentStep === 3 ? 'font-medium text-primary-600' : 'text-dark-500'}>
            Timeline
          </span>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-8">
        {/* Step 1: Select or Create Client */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-dark-900 mb-6">
              Schritt 1: Kunde auswählen oder anlegen
            </h2>
            
            {/* Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsNewClient(false)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  !isNewClient
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-dark-200 hover:border-dark-300'
                }`}
              >
                <div className="font-medium text-dark-900">Bestehender Kunde</div>
                <div className="text-sm text-dark-500 mt-1">
                  Aus {state.clients.length} Kunden wählen
                </div>
              </button>
              <button
                onClick={() => setIsNewClient(true)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  isNewClient
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-dark-200 hover:border-dark-300'
                }`}
              >
                <div className="font-medium text-dark-900">Neuer Kunde</div>
                <div className="text-sm text-dark-500 mt-1">
                  Neuen Kunden anlegen
                </div>
              </button>
            </div>
            
            {!isNewClient ? (
              /* Select Existing Client */
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Kunde auswählen
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Bitte wählen...</option>
                  {state.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* Create New Client */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="max@beispiel.de"
                    className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Telefon (optional)
                  </label>
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Step 2: Project Details */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-dark-900 mb-6">
              Schritt 2: Projektdetails
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Projekttitel *
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="z.B. Neue Website für Firma XYZ"
                  className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Projekttyp *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getAllTemplates(state.customTemplates).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setProjectType(template.type)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        projectType === template.type
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-dark-200 hover:border-dark-300'
                      }`}
                    >
                      <div className="font-medium text-dark-900">{template.name}</div>
                      <div className="text-sm text-dark-500 mt-1">
                        {template.milestones.length} Meilensteine
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedTemplate && (
                <div className="bg-dark-50 rounded-lg p-4">
                  <p className="text-sm text-dark-600">{selectedTemplate.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 3: Timeline */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-dark-900 mb-6">
              Schritt 3: Timeline festlegen
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Startdatum
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Milestone Preview */}
              <div>
                <h3 className="text-sm font-medium text-dark-700 mb-4">
                  Meilenstein-Vorschau ({getMilestoneDates().length} Meilensteine)
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getMilestoneDates().map((milestone, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                        milestone.owner === 'client' ? 'bg-amber-50' : 'bg-primary-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                        milestone.owner === 'client' 
                          ? 'bg-amber-200 text-amber-800' 
                          : 'bg-primary-200 text-primary-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-dark-900 truncate">{milestone.title}</div>
                      </div>
                      <div className="text-xs text-dark-500 flex-shrink-0">
                        {format(milestone.calculatedDate, 'd. MMM', { locale: de })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-200">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep((currentStep - 1) as WizardStep) : navigate('/admin/projects')}
            className="px-6 py-2 text-dark-600 hover:text-dark-800 font-medium"
          >
            {currentStep === 1 ? 'Abbrechen' : 'Zurück'}
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={() => goToStep((currentStep + 1) as WizardStep)}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid)
              }
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Weiter
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Projekt erstellen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
