import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Package2, Beef, Wheat, Circle, Zap, FileText } from 'lucide-react';
import InventoryForm from './InventoryForm';
import WorkerEntriesModal from './WorkerEntriesModal';
import { normalizeName } from '@/lib/nameNormalization';

const WorkerApp: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showEntriesModal, setShowEntriesModal] = useState(false);

  useEffect(() => {
    const savedFirstName = localStorage.getItem('workerFirstName');
    const savedLastName = localStorage.getItem('workerLastName');
    if (savedFirstName && savedLastName) {
      setFirstName(savedFirstName);
      setLastName(savedLastName);
      setIsNameSet(true);
    }
  }, []);

  const handleSetName = () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first and last name');
      return;
    }
    
    // Normalize the names to ensure consistency
    const normalizedFirstName = normalizeName(firstName.trim());
    const normalizedLastName = normalizeName(lastName.trim());
    
    localStorage.setItem('workerFirstName', normalizedFirstName);
    localStorage.setItem('workerLastName', normalizedLastName);
    setFirstName(normalizedFirstName);
    setLastName(normalizedLastName);
    setIsNameSet(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleReturnHome = () => {
    setSelectedCategory(null);
  };

  const fullName = `${firstName} ${lastName}`;

  if (selectedCategory) {
    return (
      <InventoryForm
        category={selectedCategory}
        workerName={fullName}
        onBack={handleBackToCategories}
        onHome={handleReturnHome}
      />
    );
  }

  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ZAKR Wild Game
              </CardTitle>
              <p className="text-lg font-semibold text-gray-700">Hillston Chiller</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="border-2 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="border-2 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSetName()}
                />
              </div>
              <Button
                onClick={handleSetName}
                className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Package2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              ZAKR Wild Game Hillston Chiller
            </CardTitle>
            <p className="text-gray-600">Welcome, {fullName}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Select a category to add inventory:
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleCategorySelect('Red')}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <Circle className="w-5 h-5 mr-3 fill-current" />
                Red
              </Button>
              
              <Button
                onClick={() => handleCategorySelect('Western Grey')}
                className="w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Wheat className="w-5 h-5 mr-3" />
                Western Grey
              </Button>
              
              <Button
                onClick={() => handleCategorySelect('Eastern Grey')}
                className="w-full py-4 text-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white"
              >
                <Beef className="w-5 h-5 mr-3" />
                Eastern Grey
              </Button>
              
              <Button
                onClick={() => handleCategorySelect('Goats')}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Zap className="w-5 h-5 mr-3" />
                Goats
              </Button>
            </div>
            
            <div className="pt-4 border-t space-y-3">
              <Button
                onClick={() => setShowEntriesModal(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                View My Entries
              </Button>
              
              <Button
                onClick={() => {
                  localStorage.removeItem('workerFirstName');
                  localStorage.removeItem('workerLastName');
                  setIsNameSet(false);
                  setFirstName('');
                  setLastName('');
                }}
                variant="outline"
                className="w-full"
              >
                Change Name
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <WorkerEntriesModal
        isOpen={showEntriesModal}
        onClose={() => setShowEntriesModal(false)}
        workerName={fullName}
      />
    </div>
  );
};

export default WorkerApp;