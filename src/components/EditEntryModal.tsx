import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface Entry {
  id: string;
  category: string;
  total: number;
  weight: number;
  kilograms: number;
  created_at: string;
}

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Entry | null;
  onSave: () => void;
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave
}) => {
  const [total, setTotal] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setTotal(String(entry.total || 0));
      setWeight(String(entry.weight || entry.kilograms || 0));
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        total: Number(total) || 0,
      };
      
      // Update both weight and kilograms fields for compatibility
      if (entry.weight !== undefined) {
        updateData.weight = Number(weight) || 0;
      }
      if (entry.kilograms !== undefined) {
        updateData.kilograms = Number(weight) || 0;
      }

      const { error } = await supabase
        .from('inventory')
        .update(updateData)
        .eq('id', entry.id);

      if (error) throw error;
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Entry - {entry.category}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total">Total Count</Label>
            <Input
              id="total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Enter total count"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntryModal;