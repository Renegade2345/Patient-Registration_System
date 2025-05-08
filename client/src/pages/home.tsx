import React, { useState } from 'react';
import { Header } from '@/components/header';
import { TabNavigation, TabId } from '@/components/tab-navigation';
import { PatientForm } from '@/components/patient-form';
import { PatientTable } from '@/components/patient-table';
import { QueryBuilder } from '@/components/query-builder';
import { Integrations } from '@/components/integrations';
import { Card, CardContent } from '@/components/ui/card';
import { getPatients } from '@/lib/localStorageDb';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('register');
  const [recentPatientsUpdated, setRecentPatientsUpdated] = useState(false);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  const handlePatientRegistrationSuccess = () => {
    setRecentPatientsUpdated(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="container-ios py-8 flex-grow ios-fade-in">
        {/* Patient Registration Tab */}
        {activeTab === 'register' && (
          <div className="space-y-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold gradient-text mb-2">Patient Registration</h1>
              <p className="text-muted-foreground">Add new patients to your medical records database</p>
            </div>
            
            <div className="ios-card">
              <PatientForm patient={null} onSuccess={handlePatientRegistrationSuccess} />
            </div>
            
            <div className="ios-card">
              <h2 className="text-2xl font-semibold mb-6 gradient-text">Recent Registrations</h2>
              <RecentRegistrations key={String(recentPatientsUpdated)} />
            </div>
          </div>
        )}
        
        {/* Patient Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold gradient-text mb-2">Patient Records</h1>
              <p className="text-muted-foreground">View and manage all patient data in your system</p>
            </div>
            
            <div className="ios-card">
              <PatientTable />
            </div>
          </div>
        )}
        
        {/* SQL Query Tab */}
        {activeTab === 'query' && (
          <div className="space-y-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold gradient-text mb-2">SQL Query Builder</h1>
              <p className="text-muted-foreground">Create and run custom queries on patient data</p>
            </div>
            
            <div className="ios-card">
              <QueryBuilder />
            </div>
          </div>
        )}
        
        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold gradient-text mb-2">Integrations</h1>
              <p className="text-muted-foreground">Connect your patient registry with external systems</p>
            </div>
            
            <div className="ios-card">
              <Integrations />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Component to show the most recent patient registrations
const RecentRegistrations: React.FC = () => {
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  
  React.useEffect(() => {
    const loadRecentPatients = async () => {
      try {
        const allPatients = await getPatients();
        // Only show 5 most recent patients
        setRecentPatients(allPatients.slice(0, 5));
      } catch (error) {
        console.error('Error loading recent patients:', error);
      }
    };
    
    loadRecentPatients();
  }, []);
  
  if (recentPatients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-border">
        <div className="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-base font-medium">No patients registered yet</p>
          <p className="text-sm">Use the form above to register your first patient</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="ios-table w-full">
        <thead>
          <tr>
            <th className="text-left">
              Name
            </th>
            <th className="text-left">
              Date of Birth
            </th>
            <th className="text-left">
              Phone
            </th>
            <th className="text-left">
              Registration Date
            </th>
          </tr>
        </thead>
        <tbody>
          {recentPatients.map((patient) => (
            <tr key={patient.id} className="transition-colors hover:bg-muted/30">
              <td className="font-medium text-foreground">
                {`${patient.firstName} ${patient.lastName}`}
              </td>
              <td>
                {new Date(patient.dob).toLocaleDateString()}
              </td>
              <td className="text-primary">
                {patient.phone}
              </td>
              <td>
                {new Date(patient.registrationDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
