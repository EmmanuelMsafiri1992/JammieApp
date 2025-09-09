import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';

interface InventoryEntry {
  id: string;
  worker_name: string;
  category: string;
  total: number;
  kilograms: number;
  chiller: string;
  created_at: string;
  loaded_out?: boolean;
}

interface RecentEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecentEntriesModal: React.FC<RecentEntriesModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecentEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .gt('total', 0) // Filter out entries where total (goats) is 0
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading recent entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecentEntries();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recent Inventory Entries</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Chiller</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.worker_name}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>Chiller {entry.chiller}</TableCell>
                  <TableCell>{entry.total}</TableCell>
                  <TableCell>{entry.kilograms.toFixed(1)}</TableCell>
                  <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      entry.loaded_out ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.loaded_out ? 'Loaded Out' : 'Active'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecentEntriesModal;