import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PackageOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ChillerSelectionModal from './ChillerSelectionModal';
import LoadoutConfirmModal from './LoadoutConfirmModal';

interface InventoryEntry {
  id: string;
  worker_name: string;
  category: string;
  total: number;
  kilograms: number;
  created_at: string;
  loaded_out?: boolean;
  paid?: boolean;
  shooter_name?: string;
}

interface LoadedOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: InventoryEntry[];
  onUpdate: () => void;
}

const LoadedOutModal: React.FC<LoadedOutModalProps> = ({ isOpen, onClose, entries, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showChillerSelection, setShowChillerSelection] = useState(false);
  const [showLoadoutConfirm, setShowLoadoutConfirm] = useState(false);
  const [selectedChiller, setSelectedChiller] = useState('');

  const handleMarkLoadedOut = async (entryId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ loaded_out: true })
        .eq('id', entryId);
      
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChillerReset = (selectedChillers: string[]) => {
    if (selectedChillers.length === 1) {
      setSelectedChiller(selectedChillers[0]);
      setShowChillerSelection(false);
      setShowLoadoutConfirm(true);
    } else {
      // Handle multiple chillers - for now just take the first one
      setSelectedChiller(selectedChillers[0]);
      setShowChillerSelection(false);
      setShowLoadoutConfirm(true);
    }
  };

  const activeEntries = entries.filter(entry => !entry.loaded_out);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <PackageOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              Mark as Loaded Out
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 sm:space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowChillerSelection(true)}
                className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm h-8 sm:h-10"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Reset Chiller Totals</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Worker</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Shooter</TableHead>
                    <TableHead className="text-xs sm:text-sm">Category</TableHead>
                    <TableHead className="text-xs sm:text-sm">Total</TableHead>
                    <TableHead className="text-xs sm:text-sm">KG</TableHead>
                    <TableHead className="text-xs sm:text-sm">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs sm:text-sm">{entry.worker_name}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{entry.shooter_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{entry.total}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{entry.kilograms.toFixed(1)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleMarkLoadedOut(entry.id)}
                          disabled={isLoading}
                          className="bg-orange-600 hover:bg-orange-700 h-6 sm:h-8 text-xs px-2 sm:px-3"
                        >
                          <span className="hidden sm:inline">Load Out</span>
                          <span className="sm:hidden">Load</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {activeEntries.length === 0 && (
              <div className="text-center py-4 sm:py-8 text-gray-500 text-xs sm:text-sm">
                No active entries to load out
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <ChillerSelectionModal
        isOpen={showChillerSelection}
        onClose={() => setShowChillerSelection(false)}
        onConfirm={handleChillerReset}
        isLoading={isLoading}
      />
      
      <LoadoutConfirmModal
        isOpen={showLoadoutConfirm}
        onClose={() => setShowLoadoutConfirm(false)}
        selectedChiller={selectedChiller}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default LoadedOutModal;