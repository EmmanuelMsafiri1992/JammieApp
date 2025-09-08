import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Loader2, Package, Calendar } from 'lucide-react';

interface ShooterTallysModalProps {
  shooterName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface InventoryEntry {
  id: string;
  category: string;
  weight: number;
  created_at: string;
  shooter_name: string;
}

const ShooterTallysModal: React.FC<ShooterTallysModalProps> = ({
  shooterName,
  isOpen,
  onClose
}) => {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<Record<string, { count: number; weight: number }>>({});

  const fetchShooterEntries = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('shooter_name', shooterName)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
      
      // Calculate totals by category (count and weight)
      const categoryTotals: Record<string, { count: number; weight: number }> = {};
      (data || []).forEach(entry => {
        if (!categoryTotals[entry.category]) {
          categoryTotals[entry.category] = { count: 0, weight: 0 };
        }
        categoryTotals[entry.category].count += 1;
        categoryTotals[entry.category].weight += entry.weight;
      });
      setTotals(categoryTotals);
    } catch (error) {
      console.error('Error fetching shooter entries:', error);
    } finally {
      setLoading(false);
    }
  }, [shooterName]);

  useEffect(() => {
    if (isOpen && shooterName) {
      fetchShooterEntries();
    }
  }, [isOpen, shooterName, fetchShooterEntries]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Red': return 'bg-red-100 text-red-800 border-red-200';
      case 'Eastern Grey': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Western Grey': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Goats': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const grandTotalCount = Object.values(totals).reduce((sum, total) => sum + total.count, 0);
  const grandTotalWeight = Object.values(totals).reduce((sum, total) => sum + total.weight, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-center">
            My Tallys - {shooterName}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading your tallys...</span>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {/* Totals Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(totals).map(([category, total]) => (
                  <Card key={category} className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {category} Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">{total.count} animals</div>
                      <div className="text-lg font-bold">{total.weight.toFixed(1)} kg</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Grand Total */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600 mb-1">Grand Total</div>
                    <div className="text-2xl font-bold text-green-800">
                      {grandTotalCount} animals / {grandTotalWeight.toFixed(1)} kg
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Entries */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  All Entries ({entries.length})
                </h3>
                
                {entries.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                      No entries found for {shooterName}
                    </CardContent>
                  </Card>
                ) : (
                  entries.map((entry) => (
                    <Card key={entry.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getCategoryColor(entry.category)}>
                              {entry.category}
                            </Badge>
                            <span className="font-semibold text-lg">
                              1 animal / {entry.weight} kg
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(entry.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ShooterTallysModal;