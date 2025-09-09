import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2, ArrowRight } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fromChiller, setFromChiller] = useState<string>('');
  const [toChiller, setToChiller] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const { transferBetweenChillers, chillerTotals } = useAppContext();

  const handleTransfer = async () => {
    if (!fromChiller || !toChiller || !quantity) {
      alert('Please select both chillers and enter a quantity');
      return;
    }

    if (fromChiller === toChiller) {
      alert('Source and destination chillers must be different');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);
    try {
      await transferBetweenChillers(parseInt(fromChiller), parseInt(toChiller), quantityNum);
      alert(`Successfully transferred ${quantityNum} items from Chiller ${fromChiller} to Chiller ${toChiller}`);
      setFromChiller('');
      setToChiller('');
      setQuantity('');
      onClose();
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error during transfer:', error);
      alert((error instanceof Error ? error.message : String(error)) || 'Failed to complete transfer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getChillerTotals = (chillerNum: string) => {
    if (!chillerNum) return { total: 0, kilograms: 0 };
    const chillerKey = `chiller${chillerNum}` as keyof typeof chillerTotals;
    return chillerTotals[chillerKey] || { total: 0, kilograms: 0 };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">Transfer Between Chillers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="from-chiller" className="text-xs sm:text-sm">From Chiller</Label>
            <Select value={fromChiller} onValueChange={setFromChiller}>
              <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select source chiller..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  Chiller 1 ({getChillerTotals('1').total} items)
                </SelectItem>
                <SelectItem value="2">
                  Chiller 2 ({getChillerTotals('2').total} items)
                </SelectItem>
                <SelectItem value="3">
                  Chiller 3 ({getChillerTotals('3').total} items)
                </SelectItem>
                <SelectItem value="4">
                  Chiller 4 ({getChillerTotals('4').total} items)
                </SelectItem>
              </SelectContent>
            </Select>
            {fromChiller && (
              <p className="text-xs text-gray-600">
                Available: {getChillerTotals(fromChiller).total} items / {getChillerTotals(fromChiller).kilograms.toFixed(1)} kg
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-chiller" className="text-xs sm:text-sm">To Chiller</Label>
            <Select value={toChiller} onValueChange={setToChiller}>
              <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select destination chiller..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" disabled={fromChiller === '1'}>
                  Chiller 1 ({getChillerTotals('1').total} items)
                </SelectItem>
                <SelectItem value="2" disabled={fromChiller === '2'}>
                  Chiller 2 ({getChillerTotals('2').total} items)
                </SelectItem>
                <SelectItem value="3" disabled={fromChiller === '3'}>
                  Chiller 3 ({getChillerTotals('3').total} items)
                </SelectItem>
                <SelectItem value="4" disabled={fromChiller === '4'}>
                  Chiller 4 ({getChillerTotals('4').total} items)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-xs sm:text-sm">Quantity to Transfer</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity..."
              min="1"
              max={fromChiller ? getChillerTotals(fromChiller).total : undefined}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            />
          </div>

          <Button 
            onClick={handleTransfer}
            disabled={isLoading || !fromChiller || !toChiller || !quantity || fromChiller === toChiller}
            className="w-full bg-cyan-600 hover:bg-cyan-700 h-8 sm:h-10 text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-2" />
                Transferring...
              </>
            ) : (
              'Transfer Items'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;