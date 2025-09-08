import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [kangarooPrice, setKangarooPrice] = useState('2.50');
  const [goatPrice, setGoatPrice] = useState('3.00');
  const [commission, setCommission] = useState('0.50');

  useEffect(() => {
    if (isOpen) {
      const savedKangarooPrice = localStorage.getItem('kangarooPrice') || '2.50';
      const savedGoatPrice = localStorage.getItem('goatPrice') || '3.00';
      const savedCommission = localStorage.getItem('commission') || '0.50';
      
      setKangarooPrice(savedKangarooPrice);
      setGoatPrice(savedGoatPrice);
      setCommission(savedCommission);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('kangarooPrice', kangarooPrice);
    localStorage.setItem('goatPrice', goatPrice);
    localStorage.setItem('commission', commission);
    
    alert('Pricing updated successfully!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-xs sm:max-w-sm mx-4 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black text-sm sm:text-base">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            Pricing
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 sm:space-y-3">
          <div className="border border-gray-200 p-2 sm:p-3 rounded">
            <Label className="text-xs sm:text-sm text-black font-medium">Kangaroo (per kg)</Label>
            <div className="flex items-center mt-1">
              <span className="text-black mr-1 text-xs sm:text-sm">$</span>
              <Input
                type="number"
                step="0.01"
                value={kangarooPrice}
                onChange={(e) => setKangarooPrice(e.target.value)}
                className="text-black bg-white border-gray-300 w-12 sm:w-16 h-6 sm:h-8 text-xs sm:text-sm"
              />
            </div>
          </div>
          
          <div className="border border-gray-200 p-2 sm:p-3 rounded">
            <Label className="text-xs sm:text-sm text-black font-medium">Goat (per kg)</Label>
            <div className="flex items-center mt-1">
              <span className="text-black mr-1 text-xs sm:text-sm">$</span>
              <Input
                type="number"
                step="0.01"
                value={goatPrice}
                onChange={(e) => setGoatPrice(e.target.value)}
                className="text-black bg-white border-gray-300 w-12 sm:w-16 h-6 sm:h-8 text-xs sm:text-sm"
              />
            </div>
          </div>
          
          <div className="border border-gray-200 p-2 sm:p-3 rounded">
            <Label className="text-xs sm:text-sm text-black font-medium">Commission (per kg)</Label>
            <div className="flex items-center mt-1">
              <span className="text-black mr-1 text-xs sm:text-sm">$</span>
              <Input
                type="number"
                step="0.01"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="text-black bg-white border-gray-300 w-12 sm:w-16 h-6 sm:h-8 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button onClick={onClose} variant="outline" className="flex-1 text-black border-gray-300 h-8 sm:h-10 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-black text-white hover:bg-gray-800 h-8 sm:h-10 text-xs sm:text-sm">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;