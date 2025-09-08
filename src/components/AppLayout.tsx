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
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
            <button
              onClick={handleBackToSelector}
              className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
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
          <div className="absolute top-2 left-2 sm:top-6 sm:left-6 z-10">
            <button
              onClick={handleBackToSelector}
              className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
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