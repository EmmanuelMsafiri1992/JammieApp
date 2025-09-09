import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ChillerTotals {
  chiller1: { total: number; kilograms: number };
  chiller2: { total: number; kilograms: number };
  chiller3: { total: number; kilograms: number };
  chiller4: { total: number; kilograms: number };
}

interface GoatsTotals {
  total: number;
  kilograms: number;
}

interface KangarooBreakdown {
  red: { total: number; kilograms: number };
  eastern: { total: number; kilograms: number };
  western: { total: number; kilograms: number };
}

interface InventoryEntry {
  category: string;
  total: number;
  kilograms: number;
  chiller?: string | number;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  chillerTotals: ChillerTotals;
  goatsTotals: GoatsTotals;
  kangarooBreakdown: KangarooBreakdown;
  updateTotalsFromEntries: () => void;
  addToStoredTotals: (entry: InventoryEntry) => Promise<void>;
  resetAllTotals: () => Promise<void>;
  resetChillerTotals: (chillerNumber: number) => Promise<void>;
  resetGoatsTotals: () => Promise<void>;
  partialLoadout: (chillerNumber: number, quantity: number) => Promise<void>;
  syncStoredTotalsWithDatabase: () => Promise<void>;
  loadStoredTotals: () => Promise<void>;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  chillerTotals: {
    chiller1: { total: 0, kilograms: 0 },
    chiller2: { total: 0, kilograms: 0 },
    chiller3: { total: 0, kilograms: 0 },
    chiller4: { total: 0, kilograms: 0 }
  },
  goatsTotals: { total: 0, kilograms: 0 },
  kangarooBreakdown: {
    red: { total: 0, kilograms: 0 },
    eastern: { total: 0, kilograms: 0 },
    western: { total: 0, kilograms: 0 }
  },
  updateTotalsFromEntries: () => {},
  addToStoredTotals: async () => {},
  resetAllTotals: async () => {},
  resetChillerTotals: async () => {},
  resetGoatsTotals: async () => {},
  partialLoadout: async () => {},
  syncStoredTotalsWithDatabase: async () => {},
  loadStoredTotals: async () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chillerTotals, setChillerTotals] = useState<ChillerTotals>({
    chiller1: { total: 0, kilograms: 0 },
    chiller2: { total: 0, kilograms: 0 },
    chiller3: { total: 0, kilograms: 0 },
    chiller4: { total: 0, kilograms: 0 }
  });
  const [goatsTotals, setGoatsTotals] = useState<GoatsTotals>({ total: 0, kilograms: 0 });
  const [kangarooBreakdown, setKangarooBreakdown] = useState<KangarooBreakdown>({
    red: { total: 0, kilograms: 0 },
    eastern: { total: 0, kilograms: 0 },
    western: { total: 0, kilograms: 0 }
  });

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Load stored totals from database (persistent cumulative totals)
  const loadStoredTotals = async () => {
    try {
      console.log('Attempting to load stored totals from database...');
      const { data, error } = await supabase
        .from('saved_totals')
        .select('*')
        .order('saved_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Supabase error loading stored totals:', error);
        // If table doesn't exist or other error, continue with defaults
        return;
      }

      if (data && data.length > 0) {
        const savedData = data[0];
        console.log('Loaded stored totals from database:', savedData);
        
        // Safely set data with fallbacks
        if (savedData.chiller_totals) {
          setChillerTotals(savedData.chiller_totals);
        }
        if (savedData.goats_totals) {
          setGoatsTotals(savedData.goats_totals);
        }
        if (savedData.kangaroo_breakdown) {
          setKangarooBreakdown(savedData.kangaroo_breakdown);
        }
      } else {
        console.log('No stored totals found in database, using defaults');
      }
    } catch (error) {
      console.error('Error loading stored totals:', error);
      console.log('Continuing with default values...');
      // Don't throw - let the app continue with default values
    }
  };

  // Save current totals to database permanently
  const saveStoredTotals = async () => {
    try {
      // Clear existing saved totals
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new totals
      const { error } = await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: chillerTotals,
          goats_totals: goatsTotals,
          kangaroo_breakdown: kangarooBreakdown,
          saved_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('Stored totals saved to database');
    } catch (error) {
      console.error('Error saving stored totals:', error);
      throw error;
    }
  };

  // Add new entry to stored totals (grand_total = grand_total + new_entry_qty)
  const addToStoredTotals = async (entry: InventoryEntry) => {
    try {
      console.log('=== addToStoredTotals called with entry:', JSON.stringify(entry, null, 2));
      console.log('Entry category (raw):', entry.category, 'Type:', typeof entry.category);
      console.log('Entry chiller (raw):', entry.chiller, 'Type:', typeof entry.chiller);
      console.log('Entry total (raw):', entry.total, 'Type:', typeof entry.total);
      console.log('Entry kilograms (raw):', entry.kilograms, 'Type:', typeof entry.kilograms);
      
      const newChillerTotals = { ...chillerTotals };
      const newGoatsTotals = { ...goatsTotals };
      const newKangarooBreakdown = { ...kangarooBreakdown };

      // Normalize values for comparison
      const category = String(entry.category || '').trim();
      const chiller = String(entry.chiller || '').trim();
      const total = Number(entry.total) || 0;
      const kilograms = Number(entry.kilograms) || 0;

      console.log('Normalized values:');
      console.log('- category:', `"${category}"`);
      console.log('- chiller:', `"${chiller}"`);
      console.log('- total:', total);
      console.log('- kilograms:', kilograms);

      // Add to appropriate chiller (for non-goats entries)
      if (category.toLowerCase() !== 'goats') {
        console.log('Processing non-goats entry for chiller:', chiller);
        
        // Handle chiller assignment - be flexible with string/number conversion
        const chillerNum = chiller === '1' || chiller === 1 ? '1' : 
                          chiller === '2' || chiller === 2 ? '2' : 
                          chiller === '3' || chiller === 3 ? '3' : 
                          chiller === '4' || chiller === 4 ? '4' : null;
        
        if (chillerNum === '1') {
          console.log('Adding to chiller 1:', total, kilograms);
          newChillerTotals.chiller1.total += total;
          newChillerTotals.chiller1.kilograms += kilograms;
        } else if (chillerNum === '2') {
          console.log('Adding to chiller 2:', total, kilograms);
          newChillerTotals.chiller2.total += total;
          newChillerTotals.chiller2.kilograms += kilograms;
        } else if (chillerNum === '3') {
          console.log('Adding to chiller 3:', total, kilograms);
          newChillerTotals.chiller3.total += total;
          newChillerTotals.chiller3.kilograms += kilograms;
        } else if (chillerNum === '4') {
          console.log('Adding to chiller 4:', total, kilograms);
          newChillerTotals.chiller4.total += total;
          newChillerTotals.chiller4.kilograms += kilograms;
        } else {
          console.log('WARNING: No chiller match for entry.chiller:', chiller, 'Normalized:', chillerNum);
        }

        // Add to kangaroo breakdown - be flexible with category names
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('red')) {
          console.log('Adding to red kangaroos:', total, kilograms);
          newKangarooBreakdown.red.total += total;
          newKangarooBreakdown.red.kilograms += kilograms;
        } else if (categoryLower.includes('eastern')) {
          console.log('Adding to eastern grey:', total, kilograms);
          newKangarooBreakdown.eastern.total += total;
          newKangarooBreakdown.eastern.kilograms += kilograms;
        } else if (categoryLower.includes('western')) {
          console.log('Adding to western grey:', total, kilograms);
          newKangarooBreakdown.western.total += total;
          newKangarooBreakdown.western.kilograms += kilograms;
        } else {
          console.log('WARNING: No kangaroo category match for:', category, 'Lowercase:', categoryLower);
        }
      } else {
        // Add to goats totals
        console.log('Adding to goats totals:', total, kilograms);
        newGoatsTotals.total += total;
        newGoatsTotals.kilograms += kilograms;
      }

      console.log('New chiller totals:', newChillerTotals);
      console.log('New goats totals:', newGoatsTotals);
      console.log('New kangaroo breakdown:', newKangarooBreakdown);

      // Update state
      setChillerTotals(newChillerTotals);
      setGoatsTotals(newGoatsTotals);
      setKangarooBreakdown(newKangarooBreakdown);

      // Save to database immediately
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: newChillerTotals,
          goats_totals: newGoatsTotals,
          kangaroo_breakdown: newKangarooBreakdown,
          saved_at: new Date().toISOString()
        });

      console.log('Added entry to stored totals and saved to database');
    } catch (error) {
      console.error('Error adding to stored totals:', error);
      throw error;
    }
  };

  // Update totals from current entries (for display only, doesn't change stored totals)
  const updateTotalsFromEntries = async () => {
    // This function is for compatibility but doesn't change stored totals
    // Stored totals are only changed by addToStoredTotals or resetAllTotals
    console.log('Using stored totals - not recalculating from entries');
  };

  // Reset all totals to zero and save to database
  const resetAllTotals = async () => {
    const zeroTotals = {
      chiller1: { total: 0, kilograms: 0 },
      chiller2: { total: 0, kilograms: 0 },
      chiller3: { total: 0, kilograms: 0 },
      chiller4: { total: 0, kilograms: 0 }
    };
    const zeroGoats = { total: 0, kilograms: 0 };
    const zeroBreakdown = {
      red: { total: 0, kilograms: 0 },
      eastern: { total: 0, kilograms: 0 },
      western: { total: 0, kilograms: 0 }
    };

    try {
      setChillerTotals(zeroTotals);
      setGoatsTotals(zeroGoats);
      setKangarooBreakdown(zeroBreakdown);

      // Save zero totals to database
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: zeroTotals,
          goats_totals: zeroGoats,
          kangaroo_breakdown: zeroBreakdown,
          saved_at: new Date().toISOString()
        });

      console.log('All totals reset to zero and saved to database');
    } catch (error) {
      console.error('Error resetting totals:', error);
      throw error;
    }
  };

  // Reset specific chiller totals to zero and save to database
  const resetChillerTotals = async (chillerNumber: number) => {
    const newChillerTotals = { ...chillerTotals };
    const newKangarooBreakdown = { ...kangarooBreakdown };
    
    try {
      // Get all entries for the specified chiller to calculate what to subtract
      const { data: entries, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('chiller', chillerNumber.toString());

      if (error) throw error;

      // Calculate totals to subtract for this chiller
      let chillerTotal = 0;
      let chillerKg = 0;
      let redTotal = 0, redKg = 0;
      let easternTotal = 0, easternKg = 0;
      let westernTotal = 0, westernKg = 0;

      entries?.forEach(entry => {
        const total = Number(entry.total) || 0;
        const kg = Number(entry.kilograms) || 0;
        
        chillerTotal += total;
        chillerKg += kg;

        const category = String(entry.category || '').toLowerCase();
        if (category.includes('red')) {
          redTotal += total;
          redKg += kg;
        } else if (category.includes('eastern')) {
          easternTotal += total;
          easternKg += kg;
        } else if (category.includes('western')) {
          westernTotal += total;
          westernKg += kg;
        }
      });

      // Reset the specific chiller totals
      const chillerKey = `chiller${chillerNumber}` as keyof ChillerTotals;
      newChillerTotals[chillerKey] = { total: 0, kilograms: 0 };

      // Subtract from kangaroo breakdown
      newKangarooBreakdown.red.total = Math.max(0, newKangarooBreakdown.red.total - redTotal);
      newKangarooBreakdown.red.kilograms = Math.max(0, newKangarooBreakdown.red.kilograms - redKg);
      newKangarooBreakdown.eastern.total = Math.max(0, newKangarooBreakdown.eastern.total - easternTotal);
      newKangarooBreakdown.eastern.kilograms = Math.max(0, newKangarooBreakdown.eastern.kilograms - easternKg);
      newKangarooBreakdown.western.total = Math.max(0, newKangarooBreakdown.western.total - westernTotal);
      newKangarooBreakdown.western.kilograms = Math.max(0, newKangarooBreakdown.western.kilograms - westernKg);

      // Update state
      setChillerTotals(newChillerTotals);
      setKangarooBreakdown(newKangarooBreakdown);

      // Save to database
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: newChillerTotals,
          goats_totals: goatsTotals,
          kangaroo_breakdown: newKangarooBreakdown,
          saved_at: new Date().toISOString()
        });

      // Note: Inventory entries are preserved to maintain shooter/pays data
      console.log(`Chiller ${chillerNumber} totals reset while preserving entries`);
    } catch (error) {
      console.error(`Error resetting chiller ${chillerNumber} totals:`, error);
      throw error;
    }
  };

  // Partial loadout - deduct specific quantity from a chiller
  const partialLoadout = async (chillerNumber: number, quantity: number) => {
    const newChillerTotals = { ...chillerTotals };
    const newKangarooBreakdown = { ...kangarooBreakdown };
    
    try {
      // Get all entries for the specified chiller
      const { data: entries, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('chiller', chillerNumber.toString());

      if (error) throw error;

      if (!entries || entries.length === 0) {
        throw new Error(`No entries found in Chiller ${chillerNumber}`);
      }

      // Calculate actual available totals from database entries
      const totalItems = entries.reduce((sum, entry) => sum + (Number(entry.total) || 0), 0);
      const totalWeight = entries.reduce((sum, entry) => sum + (Number(entry.kilograms) || 0), 0);
      
      // Check if we have enough items available based on stored totals (not database entries)
      const chillerKey = `chiller${chillerNumber}` as keyof ChillerTotals;
      const availableInTotals = newChillerTotals[chillerKey].total;
      
      if (quantity > availableInTotals) {
        throw new Error(`Cannot remove ${quantity} items. Only ${availableInTotals} items available in Chiller ${chillerNumber} (based on current totals)`);
      }

      // Get current chiller totals from stored totals for proportional reduction
      const currentChillerTotal = newChillerTotals[chillerKey].total;
      const currentChillerKg = newChillerTotals[chillerKey].kilograms;

      // Calculate weight to remove based on actual entry ratios
      const avgWeightPerItem = totalItems > 0 ? totalWeight / totalItems : 0;
      const weightToRemove = quantity * avgWeightPerItem;

      // Calculate proportional breakdown reduction
      let redToRemove = 0, easternToRemove = 0, westernToRemove = 0;
      let redKgToRemove = 0, easternKgToRemove = 0, westernKgToRemove = 0;

      entries.forEach(entry => {
        const entryTotal = Number(entry.total) || 0;
        const entryKg = Number(entry.kilograms) || 0;
        const proportion = entryTotal / totalItems;
        
        const category = String(entry.category || '').toLowerCase();
        if (category.includes('red')) {
          redToRemove += quantity * proportion;
          redKgToRemove += weightToRemove * (entryKg / totalWeight);
        } else if (category.includes('eastern')) {
          easternToRemove += quantity * proportion;
          easternKgToRemove += weightToRemove * (entryKg / totalWeight);
        } else if (category.includes('western')) {
          westernToRemove += quantity * proportion;
          westernKgToRemove += weightToRemove * (entryKg / totalWeight);
        }
      });

      // Update chiller totals (reuse existing chillerKey variable)
      newChillerTotals[chillerKey].total = Math.max(0, newChillerTotals[chillerKey].total - quantity);
      newChillerTotals[chillerKey].kilograms = Math.max(0, newChillerTotals[chillerKey].kilograms - weightToRemove);

      // Update kangaroo breakdown
      newKangarooBreakdown.red.total = Math.max(0, newKangarooBreakdown.red.total - redToRemove);
      newKangarooBreakdown.red.kilograms = Math.max(0, newKangarooBreakdown.red.kilograms - redKgToRemove);
      newKangarooBreakdown.eastern.total = Math.max(0, newKangarooBreakdown.eastern.total - easternToRemove);
      newKangarooBreakdown.eastern.kilograms = Math.max(0, newKangarooBreakdown.eastern.kilograms - easternKgToRemove);
      newKangarooBreakdown.western.total = Math.max(0, newKangarooBreakdown.western.total - westernToRemove);
      newKangarooBreakdown.western.kilograms = Math.max(0, newKangarooBreakdown.western.kilograms - westernKgToRemove);

      // Update state
      setChillerTotals(newChillerTotals);
      setKangarooBreakdown(newKangarooBreakdown);

      // Save to database
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: newChillerTotals,
          goats_totals: goatsTotals,
          kangaroo_breakdown: newKangarooBreakdown,
          saved_at: new Date().toISOString()
        });

      console.log(`Partial loadout: Removed ${quantity} items (${weightToRemove.toFixed(2)}kg) from Chiller ${chillerNumber}`);
    } catch (error) {
      console.error(`Error during partial loadout from chiller ${chillerNumber}:`, error);
      throw error;
    }
  };

  // Reset goats totals to zero and save to database (like chillers 1, 2, 3)
  const resetGoatsTotals = async () => {
    try {
      // Get all goat entries to delete them
      const { data: entries, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('category', 'Goats');

      if (error) throw error;

      // Reset goats totals to zero
      const zeroGoats = { total: 0, kilograms: 0 };
      setGoatsTotals(zeroGoats);

      // Save to database
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: chillerTotals,
          goats_totals: zeroGoats,
          kangaroo_breakdown: kangarooBreakdown,
          saved_at: new Date().toISOString()
        });

      // Note: Goat inventory entries are preserved to maintain shooter/pays data
      console.log('Goats totals reset while preserving entries');
    } catch (error) {
      console.error('Error resetting goats totals:', error);
      throw error;
    }
  };

  // Sync stored totals with actual database entries
  const syncStoredTotalsWithDatabase = async () => {
    try {
      console.log('=== Syncing stored totals with database entries ===');
      
      // Get all current inventory entries
      const { data: entries, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('loaded_out', false);

      if (error) throw error;

      // Calculate fresh totals from database entries
      const freshChillerTotals = {
        chiller1: { total: 0, kilograms: 0 },
        chiller2: { total: 0, kilograms: 0 },
        chiller3: { total: 0, kilograms: 0 },
        chiller4: { total: 0, kilograms: 0 }
      };
      const freshGoatsTotals = { total: 0, kilograms: 0 };
      const freshKangarooBreakdown = {
        red: { total: 0, kilograms: 0 },
        eastern: { total: 0, kilograms: 0 },
        western: { total: 0, kilograms: 0 }
      };

      entries?.forEach(entry => {
        const total = Number(entry.total) || 0;
        const kg = Number(entry.kilograms) || 0;
        const category = String(entry.category || '').toLowerCase();
        const chiller = String(entry.chiller || '').trim();

        if (category === 'goats') {
          freshGoatsTotals.total += total;
          freshGoatsTotals.kilograms += kg;
        } else {
          // Add to appropriate chiller
          if (chiller === '1') {
            freshChillerTotals.chiller1.total += total;
            freshChillerTotals.chiller1.kilograms += kg;
          } else if (chiller === '2') {
            freshChillerTotals.chiller2.total += total;
            freshChillerTotals.chiller2.kilograms += kg;
          } else if (chiller === '3') {
            freshChillerTotals.chiller3.total += total;
            freshChillerTotals.chiller3.kilograms += kg;
          } else if (chiller === '4') {
            freshChillerTotals.chiller4.total += total;
            freshChillerTotals.chiller4.kilograms += kg;
          }

          // Add to kangaroo breakdown
          if (category.includes('red')) {
            freshKangarooBreakdown.red.total += total;
            freshKangarooBreakdown.red.kilograms += kg;
          } else if (category.includes('eastern')) {
            freshKangarooBreakdown.eastern.total += total;
            freshKangarooBreakdown.eastern.kilograms += kg;
          } else if (category.includes('western')) {
            freshKangarooBreakdown.western.total += total;
            freshKangarooBreakdown.western.kilograms += kg;
          }
        }
      });

      console.log('Fresh totals calculated from database:', {
        chillerTotals: freshChillerTotals,
        goatsTotals: freshGoatsTotals,
        kangarooBreakdown: freshKangarooBreakdown
      });

      // Update state with fresh totals
      setChillerTotals(freshChillerTotals);
      setGoatsTotals(freshGoatsTotals);
      setKangarooBreakdown(freshKangarooBreakdown);

      // Save fresh totals to database
      await supabase
        .from('saved_totals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('saved_totals')
        .insert({
          chiller_totals: freshChillerTotals,
          goats_totals: freshGoatsTotals,
          kangaroo_breakdown: freshKangarooBreakdown,
          saved_at: new Date().toISOString()
        });

      console.log('Stored totals synced with database successfully');
    } catch (error) {
      console.error('Error syncing stored totals with database:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Load stored totals with error handling to prevent dashboard crashes
    loadStoredTotals().catch(error => {
      console.error('Failed to load stored totals on mount:', error);
      // Continue with default values instead of crashing
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        chillerTotals,
        goatsTotals,
        kangarooBreakdown,
        updateTotalsFromEntries,
        addToStoredTotals,
        resetAllTotals,
        resetChillerTotals,
        resetGoatsTotals,
        partialLoadout,
        syncStoredTotalsWithDatabase,
        loadStoredTotals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};