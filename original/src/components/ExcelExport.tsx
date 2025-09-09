import * as XLSX from 'xlsx';

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

export const exportToExcel = (entries: InventoryEntry[]) => {
  const activeEntries = entries.filter(entry => !entry.loaded_out);
  const kangarooPrice = parseFloat(localStorage.getItem('kangarooPrice') || '2.50');
  const goatPrice = parseFloat(localStorage.getItem('goatPrice') || '3.00');
  const commission = parseFloat(localStorage.getItem('commission') || '0.50');
  
  // Get shooter payments data
  const shooterData: { [key: string]: { kangaroo: { total: number; kg: number }; goat: { total: number; kg: number } } } = {};
  
  activeEntries.forEach(entry => {
    const shooterName = entry.shooter_name || entry.worker_name || 'Unknown';
    if (!shooterData[shooterName]) {
      shooterData[shooterName] = { kangaroo: { total: 0, kg: 0 }, goat: { total: 0, kg: 0 } };
    }
    
    if (['Red', 'Western Grey', 'Eastern Grey', 'Red Kangaroos', 'Western Grey Kangaroos', 'Eastern Grey Kangaroos'].includes(entry.category)) {
      shooterData[shooterName].kangaroo.total += entry.total;
      shooterData[shooterName].kangaroo.kg += entry.kilograms;
    } else if (entry.category === 'Goats') {
      shooterData[shooterName].goat.total += entry.total;
      shooterData[shooterName].goat.kg += entry.kilograms;
    }
  });
  
  // Calculate commission totals
  let totalKangarooKgs = 0;
  let totalGoatKgs = 0;
  
  activeEntries.forEach(entry => {
    if (['Red', 'Western Grey', 'Eastern Grey', 'Red Kangaroos', 'Western Grey Kangaroos', 'Eastern Grey Kangaroos'].includes(entry.category)) {
      totalKangarooKgs += entry.kilograms;
    } else if (entry.category === 'Goats') {
      totalGoatKgs += entry.kilograms;
    }
  });
  
  const kangarooCommission = totalKangarooKgs * commission;
  const goatCommission = totalGoatKgs * commission;
  const totalCommissionSubtotal = kangarooCommission + goatCommission;
  const totalCommissionGst = totalCommissionSubtotal * 0.10;
  const totalCommissionWithGst = totalCommissionSubtotal + totalCommissionGst;
  
  // Species breakdown
  const speciesBreakdown = { red: { total: 0, kg: 0 }, eastern: { total: 0, kg: 0 }, western: { total: 0, kg: 0 }, goat: { total: 0, kg: 0 } };
  
  activeEntries.forEach(entry => {
    if (entry.category === 'Red' || entry.category === 'Red Kangaroos') {
      speciesBreakdown.red.total += entry.total;
      speciesBreakdown.red.kg += entry.kilograms;
    } else if (entry.category === 'Eastern Grey' || entry.category === 'Eastern Grey Kangaroos') {
      speciesBreakdown.eastern.total += entry.total;
      speciesBreakdown.eastern.kg += entry.kilograms;
    } else if (entry.category === 'Western Grey' || entry.category === 'Western Grey Kangaroos') {
      speciesBreakdown.western.total += entry.total;
      speciesBreakdown.western.kg += entry.kilograms;
    } else if (entry.category === 'Goats') {
      speciesBreakdown.goat.total += entry.total;
      speciesBreakdown.goat.kg += entry.kilograms;
    }
  });
  
  const worksheetData = [
    ['ZAKR Wild Game - Shooter Report'],
    [],
    ['SHOOTER LINES'],
    ['Shooter Name', 'Total Kangaroo', 'Kg', 'Price', 'Total Goat', 'Kg', 'Price', 'Sub Total', 'GST', 'Total'],
    ...Object.entries(shooterData).map(([name, data]) => {
      const kangarooValue = data.kangaroo.kg * kangarooPrice;
      const goatValue = data.goat.kg * goatPrice;
      const subtotal = kangarooValue + goatValue;
      const gst = subtotal * 0.10;
      const total = subtotal + gst;
      
      return [
        name,
        data.kangaroo.total,
        data.kangaroo.kg.toFixed(1),
        '$' + kangarooValue.toFixed(2),
        data.goat.total,
        data.goat.kg.toFixed(1),
        '$' + goatValue.toFixed(2),
        '$' + subtotal.toFixed(2),
        '$' + gst.toFixed(2),
        '$' + total.toFixed(2)
      ];
    }),
    [],
    ['COMMISSION'],
    ['Total Kangaroo Kg', 'Commission Rate', 'Kangaroo Commission', 'Total Goat Kg', 'Commission Rate', 'Goat Commission', 'Sub Total', 'GST', 'Total'],
    [
      totalKangarooKgs.toFixed(1),
      '$' + commission.toFixed(2),
      '$' + kangarooCommission.toFixed(2),
      totalGoatKgs.toFixed(1),
      '$' + commission.toFixed(2),
      '$' + goatCommission.toFixed(2),
      '$' + totalCommissionSubtotal.toFixed(2),
      '$' + totalCommissionGst.toFixed(2),
      '$' + totalCommissionWithGst.toFixed(2)
    ],
    [],
    ['SPECIES BREAKDOWN'],
    ['Species', 'Count', 'Weight (kg)'],
    ['Red Kangaroo', speciesBreakdown.red.total, speciesBreakdown.red.kg.toFixed(1)],
    ['Eastern Grey', speciesBreakdown.eastern.total, speciesBreakdown.eastern.kg.toFixed(1)],
    ['Western Grey', speciesBreakdown.western.total, speciesBreakdown.western.kg.toFixed(1)],
    ['Goats', speciesBreakdown.goat.total, speciesBreakdown.goat.kg.toFixed(1)]
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shooter Report');
  
  XLSX.writeFile(wb, `ZAKR-Shooter-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
};