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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageOpen className="w-5 h-5" />
              Mark as Loaded Out
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowChillerSelection(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Chiller Totals
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Shooter</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>KG</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.worker_name}</TableCell>
                    <TableCell>{entry.shooter_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell>{entry.total}</TableCell>
                    <TableCell>{entry.kilograms.toFixed(1)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleMarkLoadedOut(entry.id)}
                        disabled={isLoading}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Load Out
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {activeEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
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