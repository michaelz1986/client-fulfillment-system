import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Passwort vergessen Modal
function ForgotPasswordModal({
  onClose,
  onSubmit,
  isLoading,
  success,
  error
}: {
  onClose: () => void;
  onSubmit: (email: string) => void;
  isLoading: boolean;
  success: boolean;
  error: string;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-900">Passwort vergessen</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-dark-900 mb-2">E-Mail gesendet!</h4>
            <p className="text-dark-600 mb-4">
              Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet.
              Bitte überprüfen Sie auch Ihren Spam-Ordner.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-dark-600">
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ihre@email.de"
                className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Senden...' : 'Link senden'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Neues Passwort setzen Modal
function ResetPasswordModal({
  onClose,
  onSubmit,
  isLoading,
  success,
  error
}: {
  onClose: () => void;
  onSubmit: (password: string) => void;
  isLoading: boolean;
  success: boolean;
  error: string;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 8) {
      setValidationError('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Die Passwörter stimmen nicht überein');
      return;
    }

    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-900">Neues Passwort setzen</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-dark-900 mb-2">Passwort geändert!</h4>
            <p className="text-dark-600 mb-4">
              Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Zur Anmeldung
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error || validationError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Neues Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mindestens 8 Zeichen"
                className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Passwort bestätigen</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Passwort wiederholen"
                className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-dark-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Speichern...' : 'Passwort ändern'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');
  
  const { login, sendPasswordResetEmail, validatePasswordResetToken, setNewPasswordWithToken } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Prüfe ob ein Reset-Token in der URL ist
  const resetToken = searchParams.get('token');
  
  // Zeige Reset-Modal wenn Token vorhanden
  useState(() => {
    if (resetToken) {
      const user = validatePasswordResetToken(resetToken);
      if (user) {
        setShowResetPassword(true);
      } else {
        setError('Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.');
        setSearchParams({});
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } else {
      setError('Ungültige E-Mail oder Passwort');
    }
  };

  const handleForgotPassword = (email: string) => {
    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    // Simuliere kurze Verzögerung
    setTimeout(() => {
      const result = sendPasswordResetEmail(email);
      setForgotPasswordLoading(false);
      
      if (result.success) {
        setForgotPasswordSuccess(true);
      } else {
        setForgotPasswordError(result.message);
      }
    }, 500);
  };

  const handleResetPassword = (newPassword: string) => {
    if (!resetToken) return;
    
    setResetPasswordLoading(true);
    setResetPasswordError('');

    // Simuliere kurze Verzögerung
    setTimeout(() => {
      const result = setNewPasswordWithToken(resetToken, newPassword);
      setResetPasswordLoading(false);
      
      if (result.success) {
        setResetPasswordSuccess(true);
        // Token aus URL entfernen
        setSearchParams({});
      } else {
        setResetPasswordError(result.error || 'Fehler beim Ändern des Passworts');
      }
    }, 500);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordSuccess(false);
    setForgotPasswordError('');
  };

  const closeResetPasswordModal = () => {
    setShowResetPassword(false);
    setResetPasswordSuccess(false);
    setResetPasswordError('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img 
            src="/digi_logo_white.png" 
            alt="Digitalisierungshilfe" 
            className="h-20 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white">Kunden-Portal</h1>
          <p className="text-primary-300 mt-2">Dein Projekt. Dein Fortschritt. Volle Transparenz.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-700 mb-2">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-dark-700">
                  Passwort
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Passwort vergessen?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Anmelden
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-dark-200">
            <p className="text-sm text-dark-500 text-center mb-4">Demo-Zugangsdaten:</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-dark-50 p-3 rounded-lg">
                <p className="font-medium text-dark-700">Admin (Alex)</p>
                <p className="text-dark-500">alex@agentur.de</p>
                <p className="text-dark-500">admin123</p>
              </div>
              <div className="bg-dark-50 p-3 rounded-lg">
                <p className="font-medium text-dark-700">Kunde (Julia)</p>
                <p className="text-dark-500">julia@techvision.de</p>
                <p className="text-dark-500">client123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-primary-400 text-sm mt-6">
          Digitalisierungshilfe Kunden-Portal v1.0
        </p>
      </div>

      {/* Passwort vergessen Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={closeForgotPasswordModal}
          onSubmit={handleForgotPassword}
          isLoading={forgotPasswordLoading}
          success={forgotPasswordSuccess}
          error={forgotPasswordError}
        />
      )}

      {/* Passwort zurücksetzen Modal */}
      {showResetPassword && (
        <ResetPasswordModal
          onClose={closeResetPasswordModal}
          onSubmit={handleResetPassword}
          isLoading={resetPasswordLoading}
          success={resetPasswordSuccess}
          error={resetPasswordError}
        />
      )}
    </div>
  );
}
