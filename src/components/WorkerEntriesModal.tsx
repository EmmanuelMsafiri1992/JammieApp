import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Package, User, Weight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface WorkerEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
}

interface Entry {
  id: number;
  created_at: string;
  category: string;
  total: number;
  kilograms: number;
  shooter_name: string;
  chiller: string;
  loaded_out: boolean;
  paid: boolean;
}

const WorkerEntriesModal: React.FC<WorkerEntriesModalProps> = ({ isOpen, onClose, workerName }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkerEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('worker_name', workerName)
        .gt('total', 0) // Filter out entries where total (goats) is 0
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching worker entries:', error);
    } finally {
      setLoading(false);
    }
  }, [workerName]);

  useEffect(() => {
    if (isOpen && workerName) {
      fetchWorkerEntries();
    }
  }, [isOpen, workerName, fetchWorkerEntries]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Red': return 'bg-red-100 text-red-800';
      case 'Western Grey': return 'bg-blue-100 text-blue-800';
      case 'Eastern Grey': return 'bg-gray-100 text-gray-800';
      case 'Goats': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Entries - {workerName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No entries found for {workerName}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Chiller</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(entry.category)}>
                        {entry.category}
                      </Badge>
                    </TableCell>
                    <TableCell>Chiller {entry.chiller}</TableCell>
                    <TableCell className="text-center">{entry.total}</TableCell>
                    <TableCell className="text-center">{entry.kilograms}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerEntriesModal;