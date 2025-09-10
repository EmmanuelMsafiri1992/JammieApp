import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

interface InventoryEntry {
  id: string;
  worker_name: string;
  category: string;
  total: number;
  kilograms: number;
  created_at: string;
  chiller?: string | number;
}

interface EditDeleteActionsProps {
  entry: InventoryEntry;
  onUpdate: () => void;
}

const EditDeleteActions: React.FC<EditDeleteActionsProps> = ({ entry, onUpdate }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    worker_name: entry.worker_name,
    total: entry.total,
    kilograms: entry.kilograms
  });
  const [isLoading, setIsLoading] = useState(false);
  const { chillerTotals, goatsTotals, kangarooBreakdown } = useAppContext();

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          worker_name: editData.worker_name,
          total: editData.total,
          kilograms: editData.kilograms
        })
        .eq('id', entry.id);
      
      if (error) throw error;
      setIsEditOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    setIsLoading(true);
    try {
      // First delete from inventory table
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', entry.id);
      
      if (error) throw error;

      // Then subtract from stored totals
      await subtractFromStoredTotals(entry);
      
      onUpdate();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to subtract deleted entry from stored totals
  const subtractFromStoredTotals = async (deletedEntry: InventoryEntry) => {
    try {
      console.log('=== Subtracting deleted entry from stored totals ===', deletedEntry);
      
      const newChillerTotals = { ...chillerTotals };
      const newGoatsTotals = { ...goatsTotals };
      const newKangarooBreakdown = { ...kangarooBreakdown };

      // Normalize values
      const category = String(deletedEntry.category || '').trim();
      const chiller = String(deletedEntry.chiller || '').trim();
      const total = Number(deletedEntry.total) || 0;
      const kilograms = Number(deletedEntry.kilograms) || 0;

      // Subtract from appropriate chiller and category totals
      if (category.toLowerCase() !== 'goats') {
        // Handle chiller subtraction
        const chillerNum = chiller === '1' || chiller === 1 ? '1' : 
                          chiller === '2' || chiller === 2 ? '2' : 
                          chiller === '3' || chiller === 3 ? '3' : 
                          chiller === '4' || chiller === 4 ? '4' : null;
        
        if (chillerNum === '1') {
          newChillerTotals.chiller1.total = Math.max(0, newChillerTotals.chiller1.total - total);
          newChillerTotals.chiller1.kilograms = Math.max(0, newChillerTotals.chiller1.kilograms - kilograms);
        } else if (chillerNum === '2') {
          newChillerTotals.chiller2.total = Math.max(0, newChillerTotals.chiller2.total - total);
          newChillerTotals.chiller2.kilograms = Math.max(0, newChillerTotals.chiller2.kilograms - kilograms);
        } else if (chillerNum === '3') {
          newChillerTotals.chiller3.total = Math.max(0, newChillerTotals.chiller3.total - total);
          newChillerTotals.chiller3.kilograms = Math.max(0, newChillerTotals.chiller3.kilograms - kilograms);
        } else if (chillerNum === '4') {
          newChillerTotals.chiller4.total = Math.max(0, newChillerTotals.chiller4.total - total);
          newChillerTotals.chiller4.kilograms = Math.max(0, newChillerTotals.chiller4.kilograms - kilograms);
        }

        // Subtract from kangaroo breakdown
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('red')) {
          newKangarooBreakdown.red.total = Math.max(0, newKangarooBreakdown.red.total - total);
          newKangarooBreakdown.red.kilograms = Math.max(0, newKangarooBreakdown.red.kilograms - kilograms);
        } else if (categoryLower.includes('eastern')) {
          newKangarooBreakdown.eastern.total = Math.max(0, newKangarooBreakdown.eastern.total - total);
          newKangarooBreakdown.eastern.kilograms = Math.max(0, newKangarooBreakdown.eastern.kilograms - kilograms);
        } else if (categoryLower.includes('western')) {
          newKangarooBreakdown.western.total = Math.max(0, newKangarooBreakdown.western.total - total);
          newKangarooBreakdown.western.kilograms = Math.max(0, newKangarooBreakdown.western.kilograms - kilograms);
        }
      } else {
        // Subtract from goats totals
        newGoatsTotals.total = Math.max(0, newGoatsTotals.total - total);
        newGoatsTotals.kilograms = Math.max(0, newGoatsTotals.kilograms - kilograms);
      }

      // Save updated totals to database
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: newChillerTotals,
          goats_totals: newGoatsTotals,
          kangaroo_breakdown: newKangarooBreakdown,
          saved_at: new Date().toISOString()
        });

      console.log('Successfully subtracted deleted entry from stored totals');
    } catch (error) {
      console.error('Error subtracting from stored totals:', error);
      throw error;
    }
  };

  return (
    <div className="flex space-x-1 sm:space-x-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-blue-600 hover:text-blue-700 bg-white/10 border-blue-500/50 hover:bg-blue-500/20 p-1 sm:p-2"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-800 border-slate-700 mx-4 sm:mx-0 max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Edit Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="worker_name" className="text-gray-300 text-sm">Worker Name</Label>
              <Input
                id="worker_name"
                value={editData.worker_name}
                onChange={(e) => setEditData({...editData, worker_name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white text-sm"
              />
            </div>
            <div>
              <Label htmlFor="total" className="text-gray-300 text-sm">Total</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={editData.total}
                onChange={(e) => setEditData({...editData, total: parseFloat(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600 text-white text-sm"
              />
            </div>
            <div>
              <Label htmlFor="kilograms" className="text-gray-300 text-sm">Kilograms</Label>
              <Input
                id="kilograms"
                type="number"
                step="0.01"
                value={editData.kilograms}
                onChange={(e) => setEditData({...editData, kilograms: parseFloat(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600 text-white text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={handleEdit} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="border-slate-600 text-gray-300 hover:bg-slate-700 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="text-red-600 hover:text-red-700 bg-white/10 border-red-500/50 hover:bg-red-500/20 p-1 sm:p-2"
        onClick={handleDelete}
        disabled={isLoading}
      >
        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
};

export default EditDeleteActions;