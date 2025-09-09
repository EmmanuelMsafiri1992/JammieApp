import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { isKangarooCategory, isGoatCategory } from '@/lib/animalTypeUtils';
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
}

interface PaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: InventoryEntry[];
}

const PaysModal: React.FC<PaysModalProps> = ({ isOpen, onClose, entries }) => {
  const { updateTotalsFromEntries } = useAppContext();
  const [kangarooPrice, setKangarooPrice] = useState(2.50);
  const [goatPrice, setGoatPrice] = useState(3.00);
  const [commission, setCommission] = useState(0.50);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const savedKangarooPrice = parseFloat(localStorage.getItem('kangarooPrice') || '2.50');
    const savedGoatPrice = parseFloat(localStorage.getItem('goatPrice') || '3.00');
    const savedCommission = parseFloat(localStorage.getItem('commission') || '0.50');
    
    setKangarooPrice(savedKangarooPrice);
    setGoatPrice(savedGoatPrice);
    setCommission(savedCommission);
  }, [isOpen]);

  const getShooterPayments = () => {
    const shooterData: { [key: string]: { kangarooCount: number; goatCount: number; kangarooKgs: number; goatKgs: number; kangarooSubtotal: number; goatSubtotal: number; kangarooGst: number; goatGst: number; kangarooTotal: number; goatTotal: number; grandTotal: number } } = {};
    
    const activeEntries = entries.filter(entry => !entry.loaded_out);
    
    const uniqueShooters = [...new Set(activeEntries.map(entry => entry.shooter_name || entry.worker_name).filter(Boolean))];
    
    uniqueShooters.forEach(shooterName => {
      const shooterEntries = activeEntries.filter(entry => 
        (entry.shooter_name || entry.worker_name) === shooterName
      );
      
      let kangarooCount = 0;
      let goatCount = 0;
      let kangarooKgs = 0;
      let goatKgs = 0;
      
      shooterEntries.forEach(entry => {
        if (isKangarooCategory(entry.category)) {
          kangarooCount += entry.total;
          kangarooKgs += entry.kilograms;
        } else if (isGoatCategory(entry.category)) {
          goatCount += entry.total;
          goatKgs += entry.kilograms;
        }
      });
      
      const kangarooSubtotal = kangarooKgs * kangarooPrice;
      const goatSubtotal = goatKgs * goatPrice;
      const kangarooGst = kangarooSubtotal * 0.10;
      const goatGst = goatSubtotal * 0.10;
      const kangarooTotal = kangarooSubtotal + kangarooGst;
      const goatTotal = goatSubtotal + goatGst;
      const grandTotal = kangarooTotal + goatTotal;
      
      shooterData[shooterName] = {
        kangarooCount,
        goatCount,
        kangarooKgs,
        goatKgs,
        kangarooSubtotal,
        goatSubtotal,
        kangarooGst,
        goatGst,
        kangarooTotal,
        goatTotal,
        grandTotal
      };
    });
    
    return shooterData;
  };

  const getCommissionSummary = () => {
    const activeEntries = entries.filter(entry => !entry.loaded_out);
    
    let totalKangarooCount = 0;
    let totalGoatCount = 0;
    let totalKangarooKgs = 0;
    let totalGoatKgs = 0;
    
    activeEntries.forEach(entry => {
      if (isKangarooCategory(entry.category)) {
        totalKangarooCount += entry.total;
        totalKangarooKgs += entry.kilograms;
      } else if (isGoatCategory(entry.category)) {
        totalGoatCount += entry.total;
        totalGoatKgs += entry.kilograms;
      }
    });
    
    const kangarooCommission = totalKangarooKgs * commission;
    const goatCommission = totalGoatKgs * commission;
    const totalCommissionSubtotal = kangarooCommission + goatCommission;
    const totalCommissionGst = totalCommissionSubtotal * 0.10;
    const totalCommissionWithGst = totalCommissionSubtotal + totalCommissionGst;
    
    return {
      totalKangarooCount,
      totalGoatCount,
      totalKangarooKgs,
      totalGoatKgs,
      kangarooCommission,
      goatCommission,
      totalCommissionSubtotal,
      totalCommissionGst,
      totalCommissionWithGst
    };
  };


  const handlePaysReset = async () => {
    if (!confirm('Are you sure you want to reset pays data? This will DELETE ALL shooter entries and pay records, but keep totals intact.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      // Delete ALL inventory entries (this clears all shooter entries)
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000'); // This will match all UUIDs

      if (deleteError) {
        console.error('Database delete error:', deleteError);
        throw deleteError;
      }

      // Update the last_paid_timestamp to track when Paid was pressed
      const { error: timestampError } = await supabase
        .from('last_paid_timestamp')
        .update({ last_paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', 1);

      if (timestampError) {
        console.error('Timestamp update error:', timestampError);
        // Don't throw here - the main operation succeeded
      }

      // Note: We do NOT call update totals functions here because the Paid button
      // should only delete entries and pay data, not affect totals in the Totals tab.
      // Only the Loadout button should reset totals.
      
      alert('All shooter entries and pay data have been deleted successfully! Totals remain intact.');
      onClose();
    } catch (error) {
      console.error('Error resetting pays data:', error);
      alert('Failed to reset pays data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const shooterPayments = getShooterPayments();
  const commissionSummary = getCommissionSummary();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Shooter Payments
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {Object.entries(shooterPayments).map(([shooterName, data]) => (
            <Card key={shooterName} className="border bg-white">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3">{shooterName}</h3>
                
                  <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600 border-b pb-1">
                    <span>Animal Type</span>
                    <span>Number</span>
                    <span>Kg</span>
                    <span>Sub Total</span>
                    <span>GST</span>
                    <span>Total</span>
                  </div>
                  
                  {data.kangarooCount > 0 && (
                    <div className="grid grid-cols-6 gap-4 text-sm">
                      <span className="font-medium text-orange-600">Kangaroo</span>
                      <span>{data.kangarooCount}</span>
                      <span>{data.kangarooKgs.toFixed(1)}</span>
                      <span>${data.kangarooSubtotal.toFixed(2)}</span>
                      <span>${data.kangarooGst.toFixed(2)}</span>
                      <span className="font-semibold">${data.kangarooTotal.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {data.goatCount > 0 && (
                    <div className="grid grid-cols-6 gap-4 text-sm">
                      <span className="font-medium text-green-600">Goat</span>
                      <span>{data.goatCount}</span>
                      <span>{data.goatKgs.toFixed(1)}</span>
                      <span>${data.goatSubtotal.toFixed(2)}</span>
                      <span>${data.goatGst.toFixed(2)}</span>
                      <span className="font-semibold">${data.goatTotal.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-6 gap-4 text-sm border-t pt-2 font-bold">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span>Total:</span>
                    <span className="text-lg">${data.grandTotal.toFixed(2)}</span>
                  </div>

              </CardContent>
            </Card>
          ))}
          
          {/* Commission Summary */}
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-3 text-orange-800">Commission</h3>
              
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-600 border-b pb-1">
                  <span>Number</span>
                  <span>Kg</span>
                  <span>Sub Total</span>
                  <span>GST</span>
                  <span>Total</span>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <span>{commissionSummary.totalKangarooCount + commissionSummary.totalGoatCount}</span>
                  <span>{(commissionSummary.totalKangarooKgs + commissionSummary.totalGoatKgs).toFixed(1)}</span>
                  <span>${commissionSummary.totalCommissionSubtotal.toFixed(2)}</span>
                  <span>${commissionSummary.totalCommissionGst.toFixed(2)}</span>
                  <span className="font-semibold text-lg">${commissionSummary.totalCommissionWithGst.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {Object.keys(shooterPayments).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No shooter payment data available
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            onClick={handlePaysReset}
            disabled={isResetting}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className={`w-4 h-4 mr-2 ${isResetting ? 'animate-pulse' : ''}`} />
            {isResetting ? 'Resetting...' : 'Reset Pays Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaysModal;