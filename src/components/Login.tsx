import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img 
            src="/digi_logo.png" 
            alt="Digitalisierungshilfe" 
            className="h-16 mx-auto mb-4"
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
              <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-2">
                Passwort
              </label>
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
    </div>
  );
}
