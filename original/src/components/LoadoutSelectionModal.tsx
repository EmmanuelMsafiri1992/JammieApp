import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

interface LoadoutSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoadoutSelectionModal: React.FC<LoadoutSelectionModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChiller, setSelectedChiller] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const { partialLoadout, resetChillerTotals, resetAllTotals } = useAppContext();

  const handlePartialLoadout = async () => {
    if (!selectedChiller || !quantity) {
      alert('Please select a chiller and enter a quantity');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);
    try {
      await partialLoadout(parseInt(selectedChiller), quantityNum);
      
      // Send SMS notification
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: process.env.SMS_RECIPIENT || 'default@example.com',
            subject: `Partial Loadout - Chiller ${selectedChiller}`,
            message: `${quantityNum} items loaded out from Chiller ${selectedChiller}.`
          }
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }
      
      alert(`Successfully loaded out ${quantityNum} items from Chiller ${selectedChiller}`);
      setSelectedChiller('');
      setQuantity('');
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Error during partial loadout:', error);
      alert(error.message || 'Failed to complete partial loadout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChillerLoadout = async (chiller: string) => {
    setIsLoading(true);
    try {
      await resetChillerTotals(parseInt(chiller));
      
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: process.env.SMS_RECIPIENT || 'default@example.com',
            subject: `Chiller ${chiller} Full Loadout Complete`,
            message: `Chiller ${chiller} has been fully loaded out and totals reset.`
          }
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Error during full loadout:', error);
      alert('Failed to complete full loadout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllLoadout = async () => {
    setIsLoading(true);
    try {
      await resetAllTotals();
      
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: process.env.SMS_RECIPIENT || 'default@example.com',
            subject: 'All Chillers Loadout Complete',
            message: 'All chillers have been loaded out and totals reset.'
          }
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }
      
      onClose();
    } catch (error) {
      console.error('Error during all loadout:', error);
      alert('Failed to complete loadout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Loadout Options</DialogTitle>
        </DialogHeader>
        
        {/* Partial Loadout Section */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">Partial Loadout</h3>
          <div className="space-y-2">
            <Label htmlFor="chiller-select">Select Chiller</Label>
            <Select value={selectedChiller} onValueChange={setSelectedChiller}>
              <SelectTrigger>
                <SelectValue placeholder="Choose chiller..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Chiller 1</SelectItem>
                <SelectItem value="2">Chiller 2</SelectItem>
                <SelectItem value="3">Chiller 3</SelectItem>
                <SelectItem value="4">Chiller 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Remove</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity..."
              min="1"
            />
          </div>
          <Button 
            onClick={handlePartialLoadout}
            disabled={isLoading || !selectedChiller || !quantity}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Partial Loadout'}
          </Button>
        </div>

        {/* Full Loadout Section */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">Full Loadout</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleChillerLoadout('1')} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chiller 1'}
            </Button>
            <Button onClick={() => handleChillerLoadout('2')} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chiller 2'}
            </Button>
            <Button onClick={() => handleChillerLoadout('3')} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chiller 3'}
            </Button>
            <Button onClick={() => handleChillerLoadout('4')} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chiller 4'}
            </Button>
          </div>
          <Button onClick={handleAllLoadout} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'All Chillers'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadoutSelectionModal;