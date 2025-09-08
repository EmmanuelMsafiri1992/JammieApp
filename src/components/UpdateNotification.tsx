import { useAppUpdater } from '@/hooks/useAppUpdater';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Download } from 'lucide-react';

export const UpdateNotification = () => {
  const { updateAvailable, isChecking, applyUpdate } = useAppUpdater();

  if (!updateAvailable) return null;

  return (
    <Alert className="fixed top-4 right-4 w-auto max-w-sm z-50 bg-blue-50 border-blue-200">
      <Download className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <span>New version available!</span>
        <Button 
          size="sm" 
          onClick={applyUpdate}
          disabled={isChecking}
          className="ml-2"
        >
          {isChecking ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Update Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};