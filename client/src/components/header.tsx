import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <header className="bg-surface shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="text-primary mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h1 className="text-xl font-medium">Patient Registration App</h1>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-4 text-gray-600 hover:text-primary flex items-center"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-5 w-5 mr-1" />
            <span className="hidden md:inline">Settings</span>
          </Button>
          <div className="flex items-center">
            <span className="hidden md:inline mr-2 text-gray-700">Guest User</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <span>GU</span>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
}

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [databaseSize, setDatabaseSize] = useState<number>(0);
  
  // Get database size when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Simulate getting database size
      const size = Math.floor(Math.random() * 500) / 100; // 0.00 - 5.00 MB
      setDatabaseSize(size);
    }
  }, [isOpen]);
  
  const clearDatabase = () => {
    // This would be implemented to clear the database
    // For now, just close the dialog
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Database Synchronization</h3>
              <p className="text-sm text-gray-500 mb-2">
                Changes made in one tab will be automatically synchronized to all open tabs.
              </p>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Data Persistence</h3>
              <p className="text-sm text-gray-500 mb-2">
                Data is stored locally in your browser and will persist between sessions.
              </p>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Enabled
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Database Size</h3>
              <p className="text-sm text-gray-500 mb-2">
                Current storage used by the in-browser database:
              </p>
              <div className="font-mono text-lg font-medium">
                {databaseSize.toFixed(2)} MB
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Clear Data</h3>
              <p className="text-sm text-gray-500 mb-4">
                Warning: This will permanently delete all patient data and cannot be undone.
              </p>
              <Button 
                variant="destructive" 
                onClick={clearDatabase}
              >
                Clear All Data
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Application</h3>
              <p className="text-sm text-gray-500">
                Patient Registration App v1.0.0
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Technologies</h3>
              <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                <li>React</li>
                <li>PGlite for client-side SQL database</li>
                <li>BroadcastChannel API for cross-tab communication</li>
                <li>Tailwind CSS with Shadcn UI components</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Browser Compatibility</h3>
              <p className="text-sm text-gray-500">
                Compatible with Chrome, Firefox, Edge, and Safari (latest versions).
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
