import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, FileText } from 'lucide-react';

export function Integrations() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportSchedule, setExportSchedule] = useState('daily');
  const [apiKey, setApiKey] = useState('');
  const [copyStatus, setCopyStatus] = useState<{[key: string]: boolean}>({});
  
  const handleCopyToClipboard = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    
    if (success) {
      // Set copy status for the specific button
      setCopyStatus(prev => ({ ...prev, [key]: true }));
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [key]: false }));
      }, 2000);
      
      toast({
        title: 'Copied to clipboard',
        description: 'Text has been copied to clipboard',
      });
    } else {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy text to clipboard',
        variant: 'destructive',
      });
    }
  };
  
  const generateApiKey = () => {
    // Generate a random API key
    const randomKey = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    setApiKey(randomKey);
    
    toast({
      title: 'API Key Generated',
      description: 'Your new API key has been generated',
    });
  };
  
  const setupDatabaseConnection = () => {
    toast({
      title: 'Not Available',
      description: 'This feature is not available in the client-side version',
    });
  };
  
  const handleWebhookSetup = () => {
    if (!webhookUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a webhook URL',
        variant: 'destructive',
      });
      return;
    }
    
    if (webhookEvents.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one event to trigger the webhook',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Webhook Configured',
      description: 'Your webhook has been set up successfully',
    });
  };
  
  const handleExportSetup = () => {
    toast({
      title: 'Export Configured',
      description: `Scheduled ${exportSchedule} export in ${exportFormat} format`,
    });
  };
  
  const toggleWebhookEvent = (event: string) => {
    setWebhookEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event) 
        : [...prev, event]
    );
  };
  
  const jsCodeSample = `// Fetch patients using the REST API
const fetchPatients = async () => {
  const response = await fetch('https://api.pglitenative.io/v1/patients', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  
  return await response.json();
};

// Example usage
fetchPatients()
  .then(data => console.log(data))
  .catch(error => console.error(error));`;
  
  const pythonCodeSample = `import requests

def create_patient(patient_data):
    """
    Create a new patient record using the REST API
    
    Args:
        patient_data (dict): Patient information
        
    Returns:
        dict: Created patient data
    """
    
    url = "https://api.pglitenative.io/v1/patients"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=patient_data, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Example usage
new_patient = {
    "firstName": "John",
    "lastName": "Smith",
    "dob": "1990-05-15",
    "gender": "male",
    "phone": "(555) 123-4567",
    "email": "john.smith@example.com"
}

try:
    result = create_patient(new_patient)
    print(f"Patient created with ID: {result['id']}")
except requests.exceptions.HTTPError as e:
    print(f"Error creating patient: {e}")`;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-medium mb-6">Technical Integrations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">REST API</h3>
                  <p className="text-gray-600 mb-4">Connect your application using our REST API endpoints</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${apiKey ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {apiKey ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Base URL</h4>
                <div className="flex">
                  <Input
                    value="https://api.pglitenative.io/v1"
                    readOnly
                    className="flex-grow bg-gray-50 text-gray-500 rounded-r-none"
                  />
                  <Button
                    variant="outline"
                    className="rounded-l-none"
                    onClick={() => handleCopyToClipboard('https://api.pglitenative.io/v1', 'baseUrl')}
                  >
                    {copyStatus['baseUrl'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {apiKey && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">API Key</h4>
                  <div className="flex">
                    <Input
                      value={apiKey}
                      readOnly
                      className="flex-grow bg-gray-50 text-gray-500 rounded-r-none"
                    />
                    <Button
                      variant="outline"
                      className="rounded-l-none"
                      onClick={() => handleCopyToClipboard(apiKey, 'apiKey')}
                    >
                      {copyStatus['apiKey'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Documentation</h4>
                <a href="#" className="text-primary hover:underline flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  View API Documentation
                </a>
              </div>
              
              <div>
                <Button
                  className="w-full"
                  onClick={generateApiKey}
                >
                  {apiKey ? 'Regenerate API Key' : 'Generate API Key'}
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">Database Connection</h3>
                  <p className="text-gray-600 mb-4">Direct database connection for read-only access</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Inactive
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Connection String</h4>
                <div className="flex">
                  <Input
                    placeholder="No connection configured"
                    readOnly
                    className="flex-grow bg-gray-50 text-gray-500 rounded-r-none"
                  />
                  <Button
                    variant="outline"
                    className="rounded-l-none"
                    disabled
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mb-4 text-sm text-gray-600">
                <p>Enable read-only access to the database for your technical team.</p>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={setupDatabaseConnection}
                >
                  Configure Connection
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">Webhook Integration</h3>
                  <p className="text-gray-600 mb-4">Receive real-time notifications for data changes</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${webhookUrl && webhookEvents.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {webhookUrl && webhookEvents.length > 0 ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Webhook URL</h4>
                <Input
                  placeholder="Enter your webhook URL"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Events</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="patient-created" 
                      checked={webhookEvents.includes('created')}
                      onCheckedChange={() => toggleWebhookEvent('created')}
                    />
                    <Label htmlFor="patient-created">Patient Created</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="patient-updated" 
                      checked={webhookEvents.includes('updated')}
                      onCheckedChange={() => toggleWebhookEvent('updated')}
                    />
                    <Label htmlFor="patient-updated">Patient Updated</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="patient-deleted" 
                      checked={webhookEvents.includes('deleted')}
                      onCheckedChange={() => toggleWebhookEvent('deleted')}
                    />
                    <Label htmlFor="patient-deleted">Patient Deleted</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleWebhookSetup}
                >
                  Save & Activate
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">Data Export</h3>
                  <p className="text-gray-600 mb-4">Schedule automated data exports</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Inactive
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Export Format</h4>
                <Select 
                  value={exportFormat} 
                  onValueChange={setExportFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Schedule</h4>
                <Select 
                  value={exportSchedule} 
                  onValueChange={setExportSchedule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportSetup}
                >
                  Configure Export
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Code Samples</h3>
            
            <Tabs defaultValue="javascript">
              <TabsList className="mb-4">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              
              <TabsContent value="javascript">
                <div className="mb-2 flex justify-between">
                  <h4 className="text-gray-700 font-medium">Fetch Patients (JavaScript)</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyToClipboard(jsCodeSample, 'jsSample')}
                  >
                    {copyStatus['jsSample'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="font-mono p-3 border border-gray-300 rounded-md bg-gray-50 text-sm overflow-auto">
                  {jsCodeSample}
                </pre>
              </TabsContent>
              
              <TabsContent value="python">
                <div className="mb-2 flex justify-between">
                  <h4 className="text-gray-700 font-medium">Create Patient (Python)</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyToClipboard(pythonCodeSample, 'pythonSample')}
                  >
                    {copyStatus['pythonSample'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="font-mono p-3 border border-gray-300 rounded-md bg-gray-50 text-sm overflow-auto">
                  {pythonCodeSample}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
