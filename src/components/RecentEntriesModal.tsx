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
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base md:text-lg">Recent Inventory Entries</DialogTitle>
          
          {/* Search Input - positioned right after title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                type="text"
                placeholder="Search by worker, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 pr-8 sm:pr-10 text-xs sm:text-sm h-8 sm:h-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
              {searchTerm ? `${filteredEntries.length} of ${entries.length}` : `${entries.length} entries`}
            </div>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-4 text-xs sm:text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Worker</TableHead>
                  <TableHead className="text-xs sm:text-sm">Category</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Chiller</TableHead>
                  <TableHead className="text-xs sm:text-sm">Count</TableHead>
                  <TableHead className="text-xs sm:text-sm">Weight</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs sm:text-sm">{entry.worker_name}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{entry.category}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">Ch {entry.chiller}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{entry.total}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{entry.kilograms.toFixed(1)}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs ${
                        entry.loaded_out ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.loaded_out ? 'Out' : 'Active'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {!isLoading && filteredEntries.length === 0 && searchTerm && (
          <div className="text-center py-4 sm:py-8 text-gray-500">
            <div className="mb-2 text-xs sm:text-sm">No entries found matching "{searchTerm}"</div>
            <Button variant="outline" size="sm" onClick={clearSearch} className="text-xs sm:text-sm h-6 sm:h-8">
              Clear search
            </Button>
          </div>
        )}
        
        {!isLoading && entries.length === 0 && !searchTerm && (
          <div className="text-center py-4 sm:py-8 text-gray-500 text-xs sm:text-sm">
            No recent entries found
          </div>
        )}
        
        <div className="flex justify-end pt-2 sm:pt-4">
          <Button onClick={onClose} className="text-xs sm:text-sm h-8 sm:h-10">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecentEntriesModal;