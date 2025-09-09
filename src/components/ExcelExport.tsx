import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

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

// Enhanced mobile and browser detection
const detectEnvironment = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
  const isChrome = /chrome/i.test(userAgent);
  const isFirefox = /firefox/i.test(userAgent);
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    userAgent,
    supportsDownload: 'download' in document.createElement('a'),
    supportsBlob: typeof Blob !== 'undefined'
  };
};

// Test function to log environment details
const logEnvironmentInfo = () => {
  const env = detectEnvironment();
  console.log('📱 Mobile Download Environment:', {
    userAgent: env.userAgent,
    isMobile: env.isMobile,
    isIOS: env.isIOS,
    isAndroid: env.isAndroid,
    browser: env.isSafari ? 'Safari' : env.isChrome ? 'Chrome' : env.isFirefox ? 'Firefox' : 'Other',
    supportsDownload: env.supportsDownload,
    supportsBlob: env.supportsBlob,
    timestamp: new Date().toISOString()
  });
  
  return env;
};

export const exportToExcel = async (entries: InventoryEntry[]): Promise<boolean> => {
  try {
    // Data validation
    if (!entries || entries.length === 0) {
      toast({
        title: "Export Error",
        description: "No data available to export",
        variant: "destructive",
      });
      return false;
    }

    // Log environment for testing
    const env = logEnvironmentInfo();

    // Show loading toast
    toast({
      title: "Exporting...",
      description: `Preparing Excel file for ${env.isMobile ? 'mobile' : 'desktop'} download`,
    });
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
    
    const filename = `ZAKR-Shooter-Report-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Enhanced mobile-compatible download with multiple fallback methods
    const downloadSuccess = await attemptDownload(wb, filename, env);
    
    if (downloadSuccess) {
      // Success feedback with iOS-specific messaging
      const message = env.isIOS 
        ? `File "${filename}" download initiated. Check your Downloads or Files app.`
        : `File "${filename}" has been downloaded${env.isMobile ? ' to your device' : ''}`;
      
      toast({
        title: "Export Successful",
        description: message,
      });
      
      // Log success for testing
      console.log('✅ Download successful:', {
        filename,
        environment: env.isMobile ? 'mobile' : 'desktop',
        isIOS: env.isIOS,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } else {
      throw new Error('All download methods failed');
    }
    
  } catch (error) {
    console.error('❌ Export error:', error);
    
    // Error feedback
    toast({
      title: "Export Failed",
      description: error instanceof Error ? error.message : "An unexpected error occurred during export",
      variant: "destructive",
    });
    
    return false;
  }
};

// Enhanced download function with iOS-specific handling
const attemptDownload = async (wb: XLSX.WorkBook, filename: string, env: ReturnType<typeof detectEnvironment>): Promise<boolean> => {
  // For iOS devices, use a special approach
  if (env.isIOS) {
    console.log('🔄 iOS Device Detected - Using iOS-specific download method');
    try {
      // Method for iOS: Create downloadable link that opens in new window
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // For iOS, we need to open in a new window and let user save manually
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Force download attribute and trigger click
      link.setAttribute('download', filename);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      
      // Create a user-initiated event
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      
      link.dispatchEvent(event);
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('✅ iOS download method executed');
      return true;
      
    } catch (error) {
      console.log('❌ iOS download method failed:', error);
      
      // Fallback for iOS: Show instructions to user
      alert(`Download prepared! The file "${filename}" should start downloading. If not, please check your Downloads folder or try again.`);
      return false;
    }
  }
  
  // For non-iOS devices, try multiple methods
  const methods = [
    // Method 1: Standard XLSX.writeFile (works on most devices)
    () => {
      console.log('🔄 Attempting Method 1: XLSX.writeFile');
      XLSX.writeFile(wb, filename);
      return true;
    },
    
    // Method 2: Blob + URL.createObjectURL for mobile browsers
    () => {
      if (!env.supportsBlob) return false;
      console.log('🔄 Attempting Method 2: Blob + URL.createObjectURL');
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      return true;
    },
    
    // Method 3: Data URI for other mobile browsers
    () => {
      console.log('🔄 Attempting Method 3: Data URI');
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      const dataURI = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
      
      const link = document.createElement('a');
      link.href = dataURI;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    }
  ];
  
  // Try each method in sequence
  for (let i = 0; i < methods.length; i++) {
    try {
      const success = methods[i]();
      if (success) {
        console.log(`✅ Download method ${i + 1} succeeded`);
        return true;
      }
    } catch (error) {
      console.log(`⚠️ Download method ${i + 1} failed:`, error);
      continue;
    }
  }
  
  console.log('❌ All download methods failed');
  return false;
};