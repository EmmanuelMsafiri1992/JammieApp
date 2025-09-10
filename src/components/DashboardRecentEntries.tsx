import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
  chiller: string;
}

const DashboardRecentEntries: React.FC = () => {
  const [recentEntries, setRecentEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .gte('created_at', twoDaysAgo.toISOString())
        .gt('total', 0) // Filter out entries where total (goats) is 0
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (error) {
      console.error('Error fetching recent entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Red': return 'bg-red-100 text-red-800';
      case 'Western Grey': return 'bg-blue-100 text-blue-800';
      case 'Eastern Grey': return 'bg-gray-100 text-gray-800';
      case 'Goats': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-0 bg-white/10 backdrop-blur-lg animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {recentEntries.slice(0, 4).map((entry, index) => (
        <Card key={entry.id} className={`border-0 text-white ${
          index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
          index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
          index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
          'bg-gradient-to-r from-yellow-500 to-orange-600'
        }`}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-1 text-xs opacity-90">
                    <Calendar className="w-3 h-3" />
                    {formatDate(entry.created_at)}
                  </div>
                  <Badge className={getCategoryColor(entry.category)}>
                    {entry.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs">
                    <User className="w-3 h-3" />
                    {entry.shooter_name || entry.worker_name}
                  </div>
                  <div className="text-sm font-bold">
                    {entry.total}/{entry.kilograms.toFixed(0)}kg
                  </div>
                  <div className="text-xs opacity-90">
                    Chiller {entry.chiller}
                  </div>
                </div>
                <div className="ml-2">
                  <EditDeleteActions 
                    entry={entry} 
                    onUpdate={fetchRecentEntries}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardRecentEntries;