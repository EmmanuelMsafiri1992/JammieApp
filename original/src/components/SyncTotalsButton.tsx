import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { RefreshCw } from 'lucide-react';

const SyncTotalsButton: React.FC = () => {
  const { syncStoredTotalsWithDatabase } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncStoredTotalsWithDatabase();
      alert('Totals synced successfully! Chiller totals are now accurate.');
    } catch (error) {
      console.error('Error syncing totals:', error);
      alert('Error syncing totals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync Totals'}
    </Button>
  );
};

export default SyncTotalsButton;