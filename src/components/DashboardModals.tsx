import React from 'react';
import TotalsModal from './TotalsModal';
import ShootersModal from './ShootersModal';
import PricingModal from './PricingModal';
import PaysModal from './PaysModal';
import LoadedOutModal from './LoadedOutModal';
import RecentEntriesModal from './RecentEntriesModal';

interface InventoryEntry {
  id: string;
  worker_name: string;
  category: string;
  total: number;
  kilograms: number;
  chiller: string;
  created_at: string;
  loaded_out?: boolean;
  paid?: boolean;
  shooter_name?: string;
}

interface DashboardModalsProps {
  entries: InventoryEntry[];
  showTotalsModal: boolean;
  showShootersModal: boolean;
  showPricingModal: boolean;
  showPaysModal: boolean;
  showLoadedOutModal: boolean;
  showRecentEntriesModal: boolean;
  setShowTotalsModal: (show: boolean) => void;
  setShowShootersModal: (show: boolean) => void;
  setShowPricingModal: (show: boolean) => void;
  setShowPaysModal: (show: boolean) => void;
  setShowLoadedOutModal: (show: boolean) => void;
  setShowRecentEntriesModal: (show: boolean) => void;
  onUpdate: () => void;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({
  entries,
  showTotalsModal,
  showShootersModal,
  showPricingModal,
  showPaysModal,
  showLoadedOutModal,
  showRecentEntriesModal,
  setShowTotalsModal,
  setShowShootersModal,
  setShowPricingModal,
  setShowPaysModal,
  setShowLoadedOutModal,
  setShowRecentEntriesModal,
  onUpdate
}) => {
  return (
    <>
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
        onUpdate={onUpdate} 
      />
      
      <RecentEntriesModal 
        isOpen={showRecentEntriesModal} 
        onClose={() => setShowRecentEntriesModal(false)} 
      />
    </>
  );
};

export default DashboardModals;