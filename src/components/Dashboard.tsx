import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Calculator, Users, Settings, Download, DollarSign, PackageOpen, Clock, CreditCard, Refrigerator, ArrowLeftRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { exportToExcel } from './ExcelExport';
import TotalsModal from './TotalsModal';
import ShootersModal from './ShootersModal';
import PricingModal from './PricingModal';
import PaysModal from './PaysModal';
import LoadedOutModal from './LoadedOutModal';
import RecentEntriesModal from './RecentEntriesModal';
import LoadoutSelectionModal from './LoadoutSelectionModal';
import TransferModal from './TransferModal';
import MobileTestDialog from './MobileTestDialog';

import DashboardTable from './DashboardTable';

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

const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isPaidResetting, setIsPaidResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTotalsModal, setShowTotalsModal] = useState(false);
  const [showShootersModal, setShowShootersModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaysModal, setShowPaysModal] = useState(false);
  const [showLoadedOutModal, setShowLoadedOutModal] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [showLoadoutModal, setShowLoadoutModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);


  const { updateTotalsFromEntries, resetAllTotals, loadStoredTotals } = useAppContext();

  const loadInventoryData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading inventory data from database...');
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error loading inventory:', error);
        // If table doesn't exist or connection fails, show empty data instead of crashing
        setEntries([]);
        return;
      }
      
      console.log(`Loaded ${data?.length || 0} inventory entries`);
      setEntries(data || []);
      // Note: We don't call updateChillerTotals() or updateGoatsTotals() here
      // because totals should be managed by AppContext and preserved when using saved totals
    } catch (error) {
      console.error('Error loading inventory data:', error);
      console.log('Setting empty entries due to error');
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInventory = async () => {
    if (!confirm('Are you sure you want to reset EVERYTHING? This will delete all shooter entries, all pay data, and reset all totals to zero. This action cannot be undone.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      // Step 1: Delete all entries from database
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) throw deleteError;
      
      // Step 2: Reset all totals to zero and clear from database
      await resetAllTotals();
      
      // Step 3: Clear local state
      setEntries([]);
      
      // Step 4: Update totals calculations to reflect empty data
      await updateTotalsFromEntries();
      
      alert('Everything has been reset! All entries deleted, all pays cleared, and all totals set to zero.');
    } catch (error) {
      console.error('Error resetting everything:', error);
      alert('Failed to reset everything. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const paidReset = async () => {
    if (!confirm('Are you sure you want to delete all shooter entries and reset Pays? This will permanently delete all entries from the database and reset all shooter assignments and paid status. Totals will remain unchanged. This action cannot be undone.')) {
      return;
    }
    
    setIsPaidResetting(true);
    try {
      // Step 1: Current totals are already stored persistently
      // No need to save again since they're already in database
      
      // Step 2: Delete all entries from the database
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (deleteError) throw deleteError;
      
      // Step 3: Update the last_paid_timestamp to track when Paid was pressed
      const { error: timestampError } = await supabase
        .from('last_paid_timestamp')
        .update({ last_paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', 1);

      if (timestampError) {
        console.error('Timestamp update error:', timestampError);
        // Don't throw here - the main operation succeeded
      }
      
      // Step 4: Clear local state
      setEntries([]);
      
      // Step 5: Reload saved totals to ensure display shows the preserved totals
      await loadStoredTotals();
      
      alert('All shooter entries have been deleted and Pays have been reset! Totals remain unchanged.');
    } catch (error) {
      console.error('Error during paid reset:', error);
      alert('Failed to delete entries and reset pays. Please try again.');
    } finally {
      setIsPaidResetting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(entries);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadout = async () => {
    if (!confirm('Are you sure you want to reset all totals to zero? This will clear Grand Total, Chiller 1, Chiller 2, Chiller 3, Chiller 4, Goat Total, and Kangaroo breakdown totals from the database and set them to zero. All entries remain unchanged. This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Reset all totals to zero and clear from persistent storage (database)
      // This will:
      // 1. Delete all saved totals from database
      // 2. Insert new zero totals into database 
      // 3. Clear localStorage and set to zero values
      // 4. Update state to zero values
      // 5. Ensure page reload shows zero totals
      await resetAllTotals();
      alert('All totals have been reset to zero and cleared from database! All entries remain unchanged. Page reload will show zero totals.');
    } catch (error) {
      console.error('Error during loadout:', error);
      alert('Failed to complete loadout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
    const interval = setInterval(loadInventoryData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">ZAKR Wild Game Hillston Chiller</h1>
            <p className="text-sm sm:text-base text-gray-300">Real-time inventory tracking dashboard</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 w-full lg:max-w-md">
            <div className="space-y-2">
              <Button onClick={() => setShowTotalsModal(true)} className="w-full py-2 px-3 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Totals
              </Button>

              <Button onClick={() => setShowShootersModal(true)} className="w-full py-2 px-3 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Shooters
              </Button>
              <Button onClick={() => setShowPricingModal(true)} className="w-full py-2 px-3 text-xs sm:text-sm bg-orange-600 hover:bg-orange-700">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Pricing
              </Button>
              <Button onClick={() => setShowPaysModal(true)} className="w-full py-2 px-3 text-xs sm:text-sm bg-green-600 hover:bg-green-700">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Pays
              </Button>
              <Button onClick={() => setShowRecentModal(true)} className="w-full py-2 px-3 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Recent
              </Button>
            </div>
            <div className="space-y-2">
              <Button onClick={() => setShowLoadoutModal(true)} disabled={isLoading} className="w-full py-2 px-3 text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-700">
                <PackageOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Loadout
              </Button>
              <Button onClick={() => setShowTransferModal(true)} disabled={isLoading} className="w-full py-2 px-3 text-xs sm:text-sm bg-pink-600 hover:bg-pink-700">
                <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Transfer
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting} 
                  className="flex-1 py-2 px-3 text-xs sm:text-sm bg-teal-600 hover:bg-teal-700"
                >
                  <Download className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
                {import.meta.env.DEV && <MobileTestDialog />}
              </div>
              <Button 
                onClick={paidReset} 
                disabled={isPaidResetting} 
                className="w-full py-2 px-3 text-xs sm:text-sm bg-yellow-600 hover:bg-yellow-700"
              >
                <CreditCard className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isPaidResetting ? 'animate-pulse' : ''}`} />
                Paid
              </Button>
              <Button 
                onClick={resetInventory} 
                disabled={isResetting} 
                className="w-full py-2 px-3 text-xs sm:text-sm bg-red-600 hover:bg-red-700"
              >
                <Trash2 className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isResetting ? 'animate-pulse' : ''}`} />
                Reset
              </Button>
              <Button onClick={loadInventoryData} disabled={isLoading} className="w-full py-2 px-3 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700">
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Recent Entries</h2>
          <DashboardTable entries={entries} onUpdate={loadInventoryData} />
        </div>
      </div>
      
      <TotalsModal 
        isOpen={showTotalsModal} 
        onClose={() => setShowTotalsModal(false)} 
        entries={entries} 
      />
      
      <ShootersModal 
        isOpen={showShootersModal} 
        onClose={() => setShowShootersModal(false)} 
        entries={entries} 
      />
      
      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />
      
      <PaysModal 
        isOpen={showPaysModal} 
        onClose={() => setShowPaysModal(false)} 
        entries={entries} 
      />
      
      <LoadedOutModal 
        isOpen={showLoadedOutModal} 
        onClose={() => setShowLoadedOutModal(false)} 
        entries={entries} 
        onUpdate={loadInventoryData} 
      />
      
      <RecentEntriesModal 
        isOpen={showRecentModal} 
        onClose={() => setShowRecentModal(false)} 
      />

      <LoadoutSelectionModal 
        isOpen={showLoadoutModal} 
        onClose={() => setShowLoadoutModal(false)} 
      />

      <TransferModal 
        isOpen={showTransferModal} 
        onClose={() => setShowTransferModal(false)} 
      />
    </div>
  );
};

export default Dashboard;