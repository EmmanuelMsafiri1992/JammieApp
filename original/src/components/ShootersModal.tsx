import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { groupSimilarNames } from '@/lib/nameNormalization';

interface InventoryEntry {
  id: string;
  worker_name: string;
  category: string;
  total: number;
  kilograms: number;
  created_at: string;
  shooter_name?: string;
  loaded_out?: boolean;
}

interface ShootersModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: InventoryEntry[];
}

const ShootersModal: React.FC<ShootersModalProps> = ({ isOpen, onClose, entries }) => {
  const getShooterTotals = () => {
    const activeEntries = entries.filter(entry => !entry.loaded_out);
    
    // Get all unique names and group similar ones
    const allNames = activeEntries.map(entry => entry.shooter_name || entry.worker_name || 'Unknown');
    const nameGroups = groupSimilarNames(allNames);
    
    const shooterTotals: { [key: string]: { kangaroo: { total: number; kg: number }; goat: { total: number; kg: number } } } = {};
    
    activeEntries.forEach(entry => {
      const rawName = entry.shooter_name || entry.worker_name || 'Unknown';
      
      // Find the canonical name for this entry
      let canonicalName = rawName;
      for (const [canonical, variants] of Object.entries(nameGroups)) {
        if (variants.includes(rawName)) {
          canonicalName = canonical;
          break;
        }
      }
      
      if (!shooterTotals[canonicalName]) {
        shooterTotals[canonicalName] = { 
          kangaroo: { total: 0, kg: 0 }, 
          goat: { total: 0, kg: 0 } 
        };
      }
      
      if (entry.category === 'Red' || entry.category === 'Western Grey' || entry.category === 'Eastern Grey') {
        shooterTotals[canonicalName].kangaroo.total += entry.total;
        shooterTotals[canonicalName].kangaroo.kg += entry.kilograms;
      } else if (entry.category === 'Goats') {
        shooterTotals[canonicalName].goat.total += entry.total;
        shooterTotals[canonicalName].goat.kg += entry.kilograms;
      }
    });
    
    return shooterTotals;
  };

  const shooterTotals = getShooterTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Shooters Totals
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(shooterTotals).map(([shooterName, data]) => (
            <Card key={shooterName} className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  {shooterName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="font-semibold text-blue-800 mb-1">Kangaroo</div>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span>{data.kangaroo.total.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Weight:</span>
                      <span>{data.kangaroo.kg.toFixed(0)} kg</span>
                    </div>
                  </div>
                  {data.goat.total > 0 && (
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-semibold text-green-800 mb-1">Goat</div>
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span>{data.goat.total.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Weight:</span>
                        <span>{data.goat.kg.toFixed(0)} kg</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {Object.keys(shooterTotals).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No shooter data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShootersModal;