import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calculator, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

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
  chiller?: string;
}

interface TotalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: InventoryEntry[];
}

const TotalsModal: React.FC<TotalsModalProps> = ({ isOpen, onClose, entries }) => {
  const { chillerTotals, goatsTotals, kangarooBreakdown } = useAppContext();
  
  // Grand total is sum of all chiller totals plus goats (rounded)
  const grandTotal = Math.round(chillerTotals.chiller1.total + chillerTotals.chiller2.total + chillerTotals.chiller3.total + chillerTotals.chiller4.total + goatsTotals.total);
  const grandKg = chillerTotals.chiller1.kilograms + chillerTotals.chiller2.kilograms + chillerTotals.chiller3.kilograms + chillerTotals.chiller4.kilograms + goatsTotals.kilograms;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            Inventory Totals
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Grand Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{grandTotal} / {grandKg.toFixed(1)} kg</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Kangaroo Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium text-red-600 text-xs sm:text-sm">Red Kangaroos</span>
                <span className="font-semibold text-xs sm:text-sm">{Math.round(kangarooBreakdown.red.total)} / {kangarooBreakdown.red.kilograms.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium text-green-600 text-xs sm:text-sm">Eastern Grey</span>
                <span className="font-semibold text-xs sm:text-sm">{Math.round(kangarooBreakdown.eastern.total)} / {kangarooBreakdown.eastern.kilograms.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium text-blue-600 text-xs sm:text-sm">Western Grey</span>
                <span className="font-semibold text-xs sm:text-sm">{Math.round(kangarooBreakdown.western.total)} / {kangarooBreakdown.western.kilograms.toFixed(1)} kg</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3, 4].map(chillerNum => {
              const chillerName = `Chiller ${chillerNum}`;
              const totals = chillerNum === 1 ? chillerTotals.chiller1 : 
                           chillerNum === 2 ? chillerTotals.chiller2 : 
                           chillerNum === 3 ? chillerTotals.chiller3 : 
                           chillerTotals.chiller4;
              
              return (
                <div key={chillerNum} className="flex justify-between items-center p-2 sm:p-3 border rounded">
                  <span className="font-medium text-xs sm:text-sm">{chillerName}</span>
                  <span className="font-semibold text-xs sm:text-sm">{Math.round(totals.total)} / {totals.kilograms.toFixed(1)} kg</span>
                </div>
              );
            })}
            
            <div className="flex justify-between items-center p-2 sm:p-3 border rounded">
              <span className="font-medium text-xs sm:text-sm">Goats</span>
              <span className="font-semibold text-xs sm:text-sm">{Math.round(goatsTotals.total)} / {goatsTotals.kilograms.toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TotalsModal;