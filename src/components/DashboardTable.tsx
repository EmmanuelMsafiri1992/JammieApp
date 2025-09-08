import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import EditDeleteActions from './EditDeleteActions';
import Pagination from './Pagination';

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
  chiller?: number;
}

interface DashboardTableProps {
  entries: InventoryEntry[];
  onUpdate: () => void;
}

const DashboardTable: React.FC<DashboardTableProps> = ({ entries, onUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter entries based on search term
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) {
      return entries;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return entries.filter(entry => 
      entry.worker_name.toLowerCase().includes(searchLower) ||
      (entry.shooter_name && entry.shooter_name.toLowerCase().includes(searchLower)) ||
      entry.category.toLowerCase().includes(searchLower) ||
      entry.chiller?.toString().includes(searchLower) ||
      entry.total.toString().includes(searchLower) ||
      entry.kilograms.toString().includes(searchLower) ||
      new Date(entry.created_at).toLocaleDateString().includes(searchLower) ||
      (entry.loaded_out ? 'loaded out' : entry.paid ? 'paid' : 'active').includes(searchLower)
    );
  }, [entries, searchTerm]);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  // Reset to first page when entries change significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing search
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Red': return 'bg-red-100 text-red-800 border-red-200';
      case 'Western Grey': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Eastern Grey': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Goats': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (loadedOut?: boolean, paid?: boolean) => {
    if (loadedOut) return 'bg-red-100 text-red-800 border-red-200';
    if (paid) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getStatusText = (loadedOut?: boolean, paid?: boolean) => {
    if (loadedOut) return 'Loaded Out';
    if (paid) return 'Paid';
    return 'Active';
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="text-xs sm:text-sm text-gray-300 whitespace-nowrap text-center sm:text-left">
          {searchTerm ? `${filteredEntries.length} of ${entries.length}` : `${entries.length} entries`}
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <Table className="min-w-full">
        <TableHeader>
          <TableRow className="border-white/20">
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">Worker</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">Shooter</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">Category</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">Chiller</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">Total</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">KG</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">Status</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">Date</TableHead>
            <TableHead className="text-gray-300 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEntries.map((entry) => (
            <TableRow key={entry.id} className="border-white/10 hover:bg-white/5">
              <TableCell className="text-white font-medium text-xs sm:text-sm px-2 sm:px-4">{entry.worker_name}</TableCell>
              <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">{entry.shooter_name || 'N/A'}</TableCell>
              <TableCell className="px-2 sm:px-4">
                <Badge className={`${getCategoryColor(entry.category)} text-xs`}>
                  {entry.category}
                </Badge>
              </TableCell>
              <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 hidden md:table-cell">Chiller {entry.chiller || 'N/A'}</TableCell>
              <TableCell className="text-white font-semibold text-xs sm:text-sm px-2 sm:px-4">{entry.total}</TableCell>
              <TableCell className="text-white font-semibold text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">{entry.kilograms.toFixed(1)}</TableCell>
              <TableCell className="px-2 sm:px-4">
                <Badge className={`${getStatusColor(entry.loaded_out, entry.paid)} text-xs`}>
                  {getStatusText(entry.loaded_out, entry.paid)}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-300 text-xs sm:text-sm px-2 sm:px-4 hidden md:table-cell">
                {new Date(entry.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <EditDeleteActions entry={entry} onUpdate={onUpdate} />
              </TableCell>
            </TableRow>
          ))}

        </TableBody>
        </Table>
      </div>
      
      {filteredEntries.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-400">
          <div className="mb-2">No entries found matching "{searchTerm}"</div>
          <Button variant="outline" size="sm" onClick={clearSearch} className="text-gray-300 border-gray-600 hover:bg-white/10">
            Clear search
          </Button>
        </div>
      )}
      
      {filteredEntries.length === 0 && !searchTerm && (
        <div className="text-center py-8 text-gray-400">
          No inventory entries found
        </div>
      )}
      
      {filteredEntries.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredEntries.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default DashboardTable;