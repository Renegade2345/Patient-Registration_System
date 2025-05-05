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
    <div className="min-h-screen flex flex-col">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="container mx-auto p-6 flex-grow">
        {/* Patient Registration Tab */}
        {activeTab === 'register' && (
          <div className="space-y-6">
            <PatientForm patient={null} onSuccess={handlePatientRegistrationSuccess} />
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-medium mb-4">Recent Registrations</h2>
                <RecentRegistrations key={String(recentPatientsUpdated)} />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Patient Data Tab */}
        {activeTab === 'data' && (
          <PatientTable />
        )}
        
        {/* SQL Query Tab */}
        {activeTab === 'query' && (
          <QueryBuilder />
        )}
        
        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <Integrations />
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
      <div className="text-center py-6 text-gray-500">
        No patients registered yet. Use the form above to register your first patient.
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date of Birth
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registration Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentPatients.map((patient) => (
            <tr key={patient.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>{`${patient.firstName} ${patient.lastName}`}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(patient.dob).toISOString().split('T')[0]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {patient.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(patient.registrationDate).toISOString().split('T')[0]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
