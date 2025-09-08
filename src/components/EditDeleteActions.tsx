import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InventoryEntry {
  id: string;
  worker_name: string;
  category: string;
  total: number;
  kilograms: number;
  created_at: string;
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
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', entry.id);
      
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-blue-600 hover:text-blue-700 bg-white/10 border-blue-500/50 hover:bg-blue-500/20"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="worker_name" className="text-gray-300">Worker Name</Label>
              <Input
                id="worker_name"
                value={editData.worker_name}
                onChange={(e) => setEditData({...editData, worker_name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="total" className="text-gray-300">Total</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={editData.total}
                onChange={(e) => setEditData({...editData, total: parseFloat(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="kilograms" className="text-gray-300">Kilograms</Label>
              <Input
                id="kilograms"
                type="number"
                step="0.01"
                value={editData.kilograms}
                onChange={(e) => setEditData({...editData, kilograms: parseFloat(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleEdit} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
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
        className="text-red-600 hover:text-red-700 bg-white/10 border-red-500/50 hover:bg-red-500/20"
        onClick={handleDelete}
        disabled={isLoading}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default EditDeleteActions;