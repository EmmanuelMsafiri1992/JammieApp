import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, Download, Info, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const MobileTestDialog: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestingDownload, setIsTestingDownload] = useState(false);

  const runEnvironmentTest = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const results = {
      userAgent: navigator.userAgent,
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
      isChrome: /chrome/i.test(userAgent),
      isFirefox: /firefox/i.test(userAgent),
      supportsDownload: 'download' in document.createElement('a'),
      supportsBlob: typeof Blob !== 'undefined',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('🔍 Mobile Environment Test Results:', results);
    setTestResults(results);
    return results;
  };

  const testDownload = async () => {
    setIsTestingDownload(true);
    try {
      // Create a simple test Excel file
      const testData = [
        ['Mobile Download Test'],
        ['Device', 'Browser', 'Timestamp'],
        [
          testResults?.isMobile ? 'Mobile' : 'Desktop',
          testResults?.isChrome ? 'Chrome' : testResults?.isSafari ? 'Safari' : 'Other',
          new Date().toISOString()
        ]
      ];

      // Use already imported XLSX
      
      const ws = XLSX.utils.aoa_to_sheet(testData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Test');
      
      const filename = `mobile-test-${Date.now()}.xlsx`;
      
      // Try the same download method as the main export
      XLSX.writeFile(wb, filename);
      
      console.log('✅ Test download completed');
      alert('Test download initiated! Check your Downloads folder.');
      
    } catch (error) {
      console.error('❌ Test download failed:', error);
      alert('Test download failed. Check console for details.');
    } finally {
      setIsTestingDownload(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TestTube className="w-4 h-4" />
          Mobile Test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Mobile Download Testing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Environment Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={runEnvironmentTest} className="w-full">
                <Info className="w-4 h-4 mr-2" />
                Run Environment Test
              </Button>
              
              {testResults && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Device Type:</span>
                    <Badge variant={testResults.isMobile ? "default" : "secondary"}>
                      {testResults.isMobile ? "Mobile" : "Desktop"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Platform:</span>
                    <Badge variant="outline">
                      {testResults.isIOS ? "iOS" : testResults.isAndroid ? "Android" : "Other"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Browser:</span>
                    <Badge variant="outline">
                      {testResults.isSafari ? "Safari" : testResults.isChrome ? "Chrome" : testResults.isFirefox ? "Firefox" : "Other"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Download Support:</span>
                    {testResults.supportsDownload ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Blob Support:</span>
                    {testResults.supportsBlob ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Screen:</span>
                    <span className="text-xs text-muted-foreground">
                      {testResults.screen.width}x{testResults.screen.height}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Viewport:</span>
                    <span className="text-xs text-muted-foreground">
                      {testResults.viewport.width}x{testResults.viewport.height}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {testResults && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Download Test</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={testDownload} 
                  disabled={isTestingDownload}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isTestingDownload ? "Testing..." : "Test Download"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will download a small test Excel file to verify the download functionality works on your device.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Instructions:</strong></p>
            <p>1. Run Environment Test first</p>
            <p>2. Run Download Test to verify functionality</p>
            <p>3. Check your Downloads folder for the test file</p>
            <p>4. Open browser console (F12) for detailed logs</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileTestDialog;