import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { normalizeName } from '@/lib/nameNormalization';

interface InventoryFormProps {
  category: string;
  workerName: string;
  onBack: () => void;
  onHome: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ category, workerName, onBack, onHome }) => {
  const [total, setTotal] = useState('');
  const [kilograms, setKilograms] = useState('');
  const [chiller, setChiller] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToStoredTotals } = useAppContext();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Red': return 'from-red-500 to-red-600';
      case 'Western Grey': return 'from-blue-500 to-blue-600';
      case 'Eastern Grey': return 'from-gray-500 to-gray-600';
      case 'Goats': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!total || !kilograms) {
      alert('Please fill in all required fields');
      return;
    }

    // Chiller is required for all categories
    if (!chiller) {
      alert('Please select a chiller');
      return;
    }

    setIsSubmitting(true);
    try {
      const insertData: any = {
        worker_name: normalizeName(workerName),
        category: category,
        total: parseFloat(total),
        kilograms: parseFloat(kilograms),
        loaded_out: false,
        paid: false
      };

      // Include chiller for all categories
      insertData.chiller = chiller;

      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('inventory')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Insert successful:', data);

      // Add new entry to stored totals using additive formula
      await addToStoredTotals(data[0]);
      
      alert('Entry saved successfully!');
      setTotal('');
      setKilograms('');
      setChiller('');
      onHome();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert(`Failed to save entry: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${getCategoryColor(category)} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              <Package className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {category} Entry
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chiller">Chiller *</Label>
                <Select value={chiller} onValueChange={setChiller} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chiller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Chiller 1</SelectItem>
                    <SelectItem value="2">Chiller 2</SelectItem>
                    <SelectItem value="3">Chiller 3</SelectItem>
                    <SelectItem value="4">Chiller 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total">Total Count *</Label>
                <Input
                  id="total"
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="Enter total count"
                  min="0"
                  step="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kilograms">Kilograms *</Label>
                <Input
                  id="kilograms"
                  type="number"
                  value={kilograms}
                  onChange={(e) => setKilograms(e.target.value)}
                  placeholder="Enter weight in kg"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onBack}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-gradient-to-r ${getCategoryColor(category)} text-white`}
                >
                  <Save className={`w-4 h-4 mr-2 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryForm;