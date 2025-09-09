import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const DashboardChiller4Card: React.FC<{ entryCount: number }> = ({ entryCount }) => {
  const { chillerTotals } = useAppContext();

  return (
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
          <Badge variant="secondary" className="mt-2">{entryCount} entries</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardChiller4Card;