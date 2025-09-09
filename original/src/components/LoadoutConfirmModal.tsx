import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

interface LoadoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChiller: string;
  onUpdate: () => void;
}

const LoadoutConfirmModal: React.FC<LoadoutConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedChiller, 
  onUpdate 
}) => {
  const { resetAllTotals } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      // Get the last paid timestamp to preserve entries added after that
      const { data: timestampData, error: timestampError } = await supabase
        .from('last_paid_timestamp')
        .select('last_paid_at')
        .order('id', { ascending: false })
        .limit(1);

      if (timestampError) {
        console.error('Error getting last paid timestamp:', timestampError);
      }

      const lastPaidAt = timestampData?.[0]?.last_paid_at;

      if (lastPaidAt) {
        // Only delete entries that were created BEFORE the last paid timestamp
        // This preserves entries added after the last time Paid was pressed
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .lt('created_at', lastPaidAt);

        if (deleteError) {
          console.error('Error deleting old entries:', deleteError);
        }
      }

      // Reset ALL totals to zero in the database (this is the main purpose of Loadout)
      await resetAllTotals();
      
      onUpdate();
      onClose();
      setShowSecondConfirm(false);
      
      alert('Loadout complete! All totals have been reset to zero. Recent entries added after the last Paid have been preserved.');
    } catch (error) {
      console.error('Error during loadout reset:', error);
      alert('Failed to complete loadout reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstConfirm = () => {
    setShowSecondConfirm(true);
  };

  const handleCancel = () => {
    setShowSecondConfirm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            {showSecondConfirm ? 'Final Confirmation' : 'Confirm Loadout Reset'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!showSecondConfirm ? (
            <>
              <p className="text-gray-700">
                Are you sure you want to reset all totals for the loadout?
              </p>
              <p className="text-sm text-orange-600 font-medium">
                This will reset all totals in the Totals tab to zero, but preserve recent entries added after the last Paid.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleFirstConfirm}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 font-medium">
                This is your final warning. Clicking "Reset All Totals" will reset all totals to zero for the truck loadout.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReset}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isLoading ? 'Resetting...' : 'Reset All Totals'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadoutConfirmModal;