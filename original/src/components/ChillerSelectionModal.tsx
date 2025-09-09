import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';

interface ChillerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedChillers: string[]) => void;
  isLoading: boolean;
}

const ChillerSelectionModal: React.FC<ChillerSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading 
}) => {
  const [selectedChillers, setSelectedChillers] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const chillers = ['1', '2', '3', '4'];

  const handleChillerToggle = (chiller: string) => {
    setSelectedChillers(prev => 
      prev.includes(chiller) 
        ? prev.filter(c => c !== chiller)
        : [...prev, chiller]
    );
  };

  const handleSelectAll = () => {
    setSelectedChillers(prev => 
      prev.length === chillers.length ? [] : [...chillers]
    );
  };

  const handleNext = () => {
    if (selectedChillers.length === 0) {
      alert('Please select at least one chiller to reset.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onConfirm(selectedChillers);
    setSelectedChillers([]);
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setSelectedChillers([]);
    setShowConfirmation(false);
    onClose();
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Confirm Chiller Reset
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to reset the following chillers?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="font-medium text-gray-800 mb-2">Selected Chillers:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {selectedChillers.map(chiller => (
                  <li key={chiller}>Chiller {chiller}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-red-600">
              This action cannot be undone. Only the selected chiller totals will be reset.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)} 
              disabled={isLoading}
            >
              Back
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Processing...' : 'Confirm Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Chillers to Reset</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Choose which chiller totals to reset during loadout:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedChillers.length === chillers.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="font-medium text-gray-800">
                Select All Chillers
              </label>
            </div>
            
            <div className="border-t pt-3 space-y-2">
              {chillers.map(chiller => (
                <div key={chiller} className="flex items-center space-x-2">
                  <Checkbox
                    id={`chiller-${chiller}`}
                    checked={selectedChillers.includes(chiller)}
                    onCheckedChange={() => handleChillerToggle(chiller)}
                  />
                  <label htmlFor={`chiller-${chiller}`} className="text-gray-700">
                    Chiller {chiller}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChillerSelectionModal;