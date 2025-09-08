import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  const loadRecentEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .gt('total', 0) // Filter out entries where total (goats) is 0
        .order('created_at', { ascending: false })
        .limit(100);
      
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
      setSearchTerm(''); // Clear search when modal opens
    }
  }, [isOpen]);

  // Filter entries based on search term
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) {
      return entries;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return entries.filter(entry => 
      entry.worker_name.toLowerCase().includes(searchLower) ||
      entry.category.toLowerCase().includes(searchLower) ||
      entry.chiller.toString().includes(searchLower) ||
      entry.total.toString().includes(searchLower) ||
      entry.kilograms.toString().includes(searchLower) ||
      new Date(entry.created_at).toLocaleDateString().includes(searchLower)
    );
  }, [entries, searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recent Inventory Entries</DialogTitle>
          
          {/* Search Input - positioned right after title */}
          <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by worker, category, chiller, count, weight, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {searchTerm ? `${filteredEntries.length} of ${entries.length}` : `${entries.length} entries`}
            </div>
          </div>
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
              {filteredEntries.map((entry) => (
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
        
        {!isLoading && filteredEntries.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">No entries found matching "{searchTerm}"</div>
            <Button variant="outline" size="sm" onClick={clearSearch}>
              Clear search
            </Button>
          </div>
        )}
        
        {!isLoading && entries.length === 0 && !searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No recent entries found
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecentEntriesModal;