import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import EditDeleteActions from './EditDeleteActions';

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
  // Show all entries (removed filter that was hiding entries with total = 0)
  const filteredEntries = entries;
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/20">
            <TableHead className="text-gray-300">Worker</TableHead>
            <TableHead className="text-gray-300">Shooter</TableHead>
            <TableHead className="text-gray-300">Category</TableHead>
            <TableHead className="text-gray-300">Chiller</TableHead>
            <TableHead className="text-gray-300">Total</TableHead>
            <TableHead className="text-gray-300">KG</TableHead>
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-gray-300">Date</TableHead>
            <TableHead className="text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.map((entry) => (
            <TableRow key={entry.id} className="border-white/10 hover:bg-white/5">
              <TableCell className="text-white font-medium">{entry.worker_name}</TableCell>
              <TableCell className="text-white">{entry.shooter_name || 'N/A'}</TableCell>
              <TableCell>
                <Badge className={getCategoryColor(entry.category)}>
                  {entry.category}
                </Badge>
              </TableCell>
              <TableCell className="text-white">Chiller {entry.chiller || 'N/A'}</TableCell>
              <TableCell className="text-white font-semibold">{entry.total}</TableCell>
              <TableCell className="text-white font-semibold">{entry.kilograms.toFixed(1)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(entry.loaded_out, entry.paid)}>
                  {getStatusText(entry.loaded_out, entry.paid)}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-300">
                {new Date(entry.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <EditDeleteActions entry={entry} onUpdate={onUpdate} />
              </TableCell>
            </TableRow>
          ))}

        </TableBody>
      </Table>
      
      {filteredEntries.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No inventory entries found
        </div>
      )}
    </div>
  );
};

export default DashboardTable;