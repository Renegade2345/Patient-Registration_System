import React from 'react';
import { cn } from '@/lib/utils';
import { PersonAdd, TableChart, Code, IntegrationInstructions } from '@mui/icons-material';

export type TabId = 'register' | 'data' | 'query' | 'integrations';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: Tab[] = [
    {
      id: 'register',
      label: 'Patient Registration',
      icon: <PersonAdd className="h-5 w-5" />,
    },
    {
      id: 'data',
      label: 'Patient Data',
      icon: <TableChart className="h-5 w-5" />,
    },
    {
      id: 'query',
      label: 'SQL Query',
      icon: <Code className="h-5 w-5" />,
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <IntegrationInstructions className="h-5 w-5" />,
    },
  ];
  
  return (
    <div className="bg-surface border-b">
      <div className="container mx-auto">
        <div className="flex flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-6 py-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2",
                activeTab === tab.id && "tab-active text-primary"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
