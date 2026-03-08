import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import CustomerView from './components/CustomerView';
import { isFirebaseConfigured } from './lib/firebase';
import { Smartphone, LayoutDashboard, User } from 'lucide-react';
import { cn } from './lib/utils';

function ConfigWarning() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Smartphone size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Firebase Not Configured</h1>
        <p className="text-slate-500 mb-6">
          Please set up your Firebase environment variables in the <code className="bg-slate-100 px-1 rounded">.env</code> file to start using the application.
        </p>
        <div className="text-left bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-600 space-y-1">
          <p>VITE_FIREBASE_API_KEY=...</p>
          <p>VITE_FIREBASE_PROJECT_ID=...</p>
          <p>...</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return <ConfigWarning />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<CustomerView />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
