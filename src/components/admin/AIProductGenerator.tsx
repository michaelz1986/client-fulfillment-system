import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../context/AppContext';
import { ProjectTemplate, MilestoneTemplate, InfrastructureTemplate } from '../../types/index';

interface AIGeneratedProduct {
  name: string;
  description: string;
  milestones: {
    title: string;
    description: string;
    owner: 'agency' | 'client';
    category: 'onboarding' | 'content' | 'design' | 'development' | 'review' | 'conversion' | 'deployment';
    daysOffset: number;
  }[];
  infrastructureTasks: string[];
}

export default function AIProductGenerator() {
  const navigate = useNavigate();
  const { createTemplate } = useApp();
  
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProduct, setGeneratedProduct] = useState<AIGeneratedProduct | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  const generateProduct = async () => {
    if (!prompt.trim() || !apiKey) return;
    
    setIsLoading(true);
    setError(null);
    setGeneratedProduct(null);

    const systemPrompt = `Du bist ein Experte für Projektmanagement in einer Digitalagentur. 
Deine Aufgabe ist es, basierend auf einer Beschreibung ein strukturiertes Produkt/Dienstleistungs-Template zu erstellen.

Antworte NUR mit einem validen JSON-Objekt (ohne Markdown-Codeblöcke) im folgenden Format:
{
  "name": "Produktname",
  "description": "Kurze Beschreibung (1-2 Sätze)",
  "milestones": [
    {
      "title": "Meilenstein-Titel",
      "description": "Was wird hier gemacht? (für den Kunden verständlich)",
      "owner": "agency" oder "client",
      "category": "onboarding", "content", "design", "development", "review", "conversion" oder "deployment",
      "daysOffset": Anzahl Tage nach dem vorherigen Meilenstein
    }
  ],
  "infrastructureTasks": ["Aufgabe 1", "Aufgabe 2"]
}

Regeln:
- Erstelle 5-10 sinnvolle Meilensteine
- Wechsle zwischen agency und client als owner ab (Kunde liefert Inhalte/Feedback, Agentur arbeitet)
- daysOffset ist die Zeit NACH dem vorherigen Meilenstein (erster = 0)
- Infrastruktur-Tasks sind technische Voraussetzungen (Domain, Hosting, etc.)
- Beschreibungen sollen kundenfreundlich und verständlich sein
- Kategorien sinnvoll wählen basierend auf der Aufgabe
- WICHTIG: Füge vor dem finalen Go-Live IMMER einen Meilenstein "Customer Journey Prüfung" mit category "conversion" hinzu (owner: agency). In diesem Schritt prüft unser Marketing-Experte die Conversion-Optimierung.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Erstelle ein Produkt-Template für: ${prompt}` }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API-Fehler');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Keine Antwort von der KI erhalten');
      }

      // Parse JSON (entferne mögliche Markdown-Codeblöcke)
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed: AIGeneratedProduct = JSON.parse(cleanedContent);
      
      setGeneratedProduct(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAsTemplate = () => {
    if (!generatedProduct) return;

    const template: ProjectTemplate = {
      id: `template-ai-${uuidv4()}`,
      type: 'custom',
      name: generatedProduct.name,
      description: generatedProduct.description,
      milestones: generatedProduct.milestones.map((m, index) => ({
        id: `ms-${index}`,
        order: index + 1,
        ...m
      })) as MilestoneTemplate[],
      infrastructureTasks: generatedProduct.infrastructureTasks.map((title, index) => ({
        id: `infra-${index}`,
        title
      })) as InfrastructureTemplate[],
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    createTemplate(template);
    navigate('/admin/products');
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-primary-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-dark-900">KI Produkt-Generator</h1>
            <p className="text-dark-500">Beschreibe dein Produkt und lass die KI die Meilensteine erstellen</p>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      {showApiKeyInput ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            OpenAI API Key benötigt
          </h3>
          <p className="text-amber-700 text-sm mb-4">
            Um die KI-Funktion zu nutzen, benötigst du einen OpenAI API Key. 
            Der Key wird nur lokal in deinem Browser gespeichert.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
            <button
              onClick={saveApiKey}
              disabled={!apiKey.startsWith('sk-')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-lg transition-colors"
            >
              Speichern
            </button>
          </div>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline text-sm mt-2 inline-block"
          >
            → API Key bei OpenAI erstellen
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 mb-6">
          <span className="text-primary-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            API Key konfiguriert
          </span>
          <button
            onClick={() => setShowApiKeyInput(true)}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            Ändern
          </button>
        </div>
      )}

      {/* Prompt Input */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-200 p-6 mb-6">
        <label className="block text-lg font-semibold text-dark-900 mb-2">
          Beschreibe dein Produkt / deine Dienstleistung
        </label>
        <p className="text-dark-500 text-sm mb-4">
          Je detaillierter du beschreibst, desto besser wird das Ergebnis. 
          Nenne z.B. den Projekttyp, Zielgruppe, besondere Anforderungen.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="z.B. Ein E-Commerce Shop für ein kleines Modeunternehmen mit Produktkatalog, Warenkorb, Checkout und Anbindung an ein Warenwirtschaftssystem. Der Kunde soll Produktfotos und -texte liefern."
          className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          disabled={isLoading}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={generateProduct}
            disabled={!prompt.trim() || !apiKey || isLoading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-700 hover:to-primary-700 disabled:from-dark-300 disabled:to-dark-400 text-white font-medium rounded-lg transition-all"
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generiere...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mit KI generieren
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Generated Result */}
      {generatedProduct && (
        <div className="bg-white rounded-xl shadow-sm border border-dark-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-primary-50 p-6 border-b border-dark-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-dark-900">{generatedProduct.name}</h2>
                <p className="text-dark-600 mt-1">{generatedProduct.description}</p>
              </div>
              <button
                onClick={saveAsTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Als Produkt speichern
              </button>
            </div>
          </div>

          {/* Milestones Preview */}
          <div className="p-6">
            <h3 className="font-semibold text-dark-900 mb-4">
              {generatedProduct.milestones.length} Meilensteine
            </h3>
            <div className="space-y-3">
              {generatedProduct.milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-dark-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    milestone.owner === 'client' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-primary-100 text-primary-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dark-900">{milestone.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        milestone.owner === 'client' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {milestone.owner === 'client' ? 'Kunde' : 'Agentur'}
                      </span>
                      <span className="text-xs text-dark-400">+{milestone.daysOffset} Tage</span>
                    </div>
                    <p className="text-sm text-dark-500 mt-1">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Preview */}
          {generatedProduct.infrastructureTasks.length > 0 && (
            <div className="p-6 border-t border-dark-200 bg-dark-50">
              <h3 className="font-semibold text-dark-900 mb-3">Infrastruktur</h3>
              <div className="flex flex-wrap gap-2">
                {generatedProduct.infrastructureTasks.map((task, index) => (
                  <span key={index} className="px-3 py-1 bg-white border border-dark-200 rounded-full text-sm text-dark-700">
                    {task}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
