import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Login({ setIsAuthenticated, setUserPreferences }: any) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [prefs, setPrefs] = useState({
    footballTeam: '',
    f1Team: '',
    motogpTeam: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setStep(2);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setUserPreferences(prefs);
    setIsAuthenticated(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
        {step === 1 ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to Sports Analytics</CardTitle>
              <CardDescription className="text-slate-400">Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors">
                  Sign In
                </button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Personalize Your Experience</CardTitle>
              <CardDescription className="text-slate-400">Tell us about your favorite teams</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleComplete} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Favorite Football Team</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Real Madrid"
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={prefs.footballTeam}
                    onChange={e => setPrefs({...prefs, footballTeam: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Favorite F1 Team</label>
                  <input 
                    type="text" 
                    placeholder="e.g. McLaren"
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={prefs.f1Team}
                    onChange={e => setPrefs({...prefs, f1Team: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Favorite MotoGP Team</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ducati Lenovo"
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={prefs.motogpTeam}
                    onChange={e => setPrefs({...prefs, motogpTeam: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors">
                  Complete Setup
                </button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
