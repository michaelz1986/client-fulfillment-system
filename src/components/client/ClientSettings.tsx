import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function ClientSettings() {
  const { state, updateUserPreferences } = useApp();
  const [phone, setPhone] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state.currentUser) {
      setPhone(state.currentUser.phone || '');
      setEmailEnabled(state.currentUser.notificationPreferences.email);
      setSmsEnabled(state.currentUser.notificationPreferences.sms);
    }
  }, [state.currentUser]);

  const handleSave = () => {
    if (state.currentUser) {
      updateUserPreferences(
        state.currentUser.id,
        { email: emailEnabled, sms: smsEnabled },
        phone || undefined
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>
        <p className="text-slate-600 mt-1">
          Verwalten Sie Ihre Benachrichtigungseinstellungen.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Benachrichtigungen
        </h2>

        {/* Telefonnummer */}
        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
            Telefonnummer (für SMS)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+49 170 1234567"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-sm text-slate-500 mt-1">
            Geben Sie Ihre Telefonnummer ein, um SMS-Benachrichtigungen zu erhalten.
          </p>
        </div>

        {/* Benachrichtigungskanäle */}
        <div className="space-y-4 mb-8">
          <p className="text-sm font-medium text-slate-700">
            Wie möchten Sie benachrichtigt werden?
          </p>

          <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-slate-900">E-Mail</span>
              <p className="text-sm text-slate-500">{state.currentUser?.email}</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-slate-900">SMS</span>
              <p className="text-sm text-slate-500">
                {phone || 'Keine Telefonnummer hinterlegt'}
              </p>
            </div>
          </label>
        </div>

        {/* Speichern-Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Änderungen speichern
          </button>

          {saved && (
            <span className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Gespeichert!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
