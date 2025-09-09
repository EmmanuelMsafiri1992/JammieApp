import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Thermometer } from 'lucide-react';
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

const DashboardChillerCards: React.FC = () => {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { chillerTotals, goatsTotals } = useAppContext();

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('loaded_out', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading chiller data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getChillerEntryCount = (chillerNum: string) => {
    return entries.filter(entry => entry.chiller === chillerNum).length;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-0 bg-white/10 backdrop-blur-lg animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-white/20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Use stored totals from AppContext instead of calculating from entries
  // Use stored totals from AppContext instead of calculating from entries
  const grandTotal = {
    count: chillerTotals.chiller1.total + chillerTotals.chiller2.total + chillerTotals.chiller3.total + chillerTotals.chiller4.total + goatsTotals.total,
    weight: chillerTotals.chiller1.kilograms + chillerTotals.chiller2.kilograms + chillerTotals.chiller3.kilograms + chillerTotals.chiller4.kilograms + goatsTotals.kilograms
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Chiller 1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white">
            <div className="text-2xl font-bold">{chillerTotals.chiller1.total}/{chillerTotals.chiller1.kilograms.toFixed(1)}kg</div>
            <Badge variant="secondary" className="mt-2">{getChillerEntryCount('1')} entries</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Chiller 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white">
            <div className="text-2xl font-bold">{chillerTotals.chiller2.total}/{chillerTotals.chiller2.kilograms.toFixed(1)}kg</div>
            <Badge variant="secondary" className="mt-2">{getChillerEntryCount('2')} entries</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Chiller 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white">
            <div className="text-2xl font-bold">{chillerTotals.chiller3.total}/{chillerTotals.chiller3.kilograms.toFixed(1)}kg</div>
            <Badge variant="secondary" className="mt-2">{getChillerEntryCount('3')} entries</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Chiller 4
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white">
            <div className="text-2xl font-bold">{chillerTotals.chiller4.total}/{chillerTotals.chiller4.kilograms.toFixed(1)}kg</div>
            <Badge variant="secondary" className="mt-2">{getChillerEntryCount('4')} entries</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Grand Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white">
            <div className="text-2xl font-bold">{grandTotal.count}/{grandTotal.weight.toFixed(1)}kg</div>
            <Badge variant="secondary" className="mt-2">{entries.length} entries</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardChillerCards;
