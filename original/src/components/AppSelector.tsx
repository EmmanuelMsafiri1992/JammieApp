import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Monitor, Lock } from 'lucide-react';

interface AppSelectorProps {
  onSelectApp: (app: 'worker' | 'dashboard') => void;
}

const AppSelector: React.FC<AppSelectorProps> = ({ onSelectApp }) => {
  const [dashboardPassword, setDashboardPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const DASHBOARD_PASSWORD = 'Zoob!369';

  const handleDashboardAccess = () => {
    if (dashboardPassword === DASHBOARD_PASSWORD) {
      onSelectApp('dashboard');
    } else {
      alert('Incorrect password');
      setDashboardPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ZAKR Wild Game</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Hillston Chiller</h2>
          <p className="text-gray-300">Choose your access level</p>
        </div>

        <Card className="border-0 bg-white/10 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">Select Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => onSelectApp('worker')}
              className="w-full py-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              <Smartphone className="w-6 h-6 mr-3" />
              Worker App
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">or</span>
              </div>
            </div>

            {!showPasswordInput ? (
              <Button
                onClick={() => setShowPasswordInput(true)}
                variant="outline"
                className="w-full py-6 border-2 border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              >
                <Monitor className="w-6 h-6 mr-3" />
                Dashboard Access
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Dashboard Password Required</span>
                </div>
                <Input
                  type="password"
                  value={dashboardPassword}
                  onChange={(e) => setDashboardPassword(e.target.value)}
                  placeholder="Enter dashboard password"
                  className="bg-white/10 border-gray-600 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleDashboardAccess()}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleDashboardAccess}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Access Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPasswordInput(false);
                      setDashboardPassword('');
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppSelector;