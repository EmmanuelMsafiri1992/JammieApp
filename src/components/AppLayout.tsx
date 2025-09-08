import React, { useState } from 'react';
import AppSelector from './AppSelector';
import WorkerApp from './WorkerApp';
import Dashboard from './Dashboard';

type AppMode = 'selector' | 'worker' | 'dashboard';

const AppLayout: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<AppMode>('selector');

  const handleSelectApp = (app: 'worker' | 'dashboard') => {
    setCurrentApp(app);
  };

  const handleBackToSelector = () => {
    setCurrentApp('selector');
  };

  switch (currentApp) {
    case 'worker':
      return (
        <div>
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={handleBackToSelector}
              className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              ← Back
            </button>
          </div>
          <WorkerApp />
        </div>
      );
    case 'dashboard':
      return (
        <div>
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={handleBackToSelector}
              className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              ← Back
            </button>
          </div>
          <Dashboard />
        </div>
      );
    default:
      return <AppSelector onSelectApp={handleSelectApp} />;
  }
};

export default AppLayout;