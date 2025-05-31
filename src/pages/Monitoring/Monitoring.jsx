import React, { useState } from 'react';
import  Tab  from '../../components/ui/Tabs/Tabs';
import Tabs from '../../components/ui/Tabs/Tabs';

import ActivityLogList from '../../components/monitoring/ActivityLogList';
import SessionsList from '../../components/monitoring/SessionsList'; 
import ActivityStats from '../../components/monitoring/ActivityStats';
import UserConnectionHistory from '../../components/monitoring/UserConnectionHistory';
import { MonitoringProvider } from '../../contexts/MonitoringContext';

const Monitoring = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setActiveTab('userHistory');
  };
  
  return (
    <MonitoringProvider>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Monitoring et Activités du Système
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tab value="sessions" label="Sessions Actives" />
          <Tab value="activities" label="Logs d'Activité" />
          <Tab value="stats" label="Statistiques" />
          {selectedUserId && (
            <Tab value="userHistory" label="Historique Utilisateur" />
          )}
        </Tabs>
        
        <div className="mt-6">
          {activeTab === 'sessions' && (
            <SessionsList onUserSelect={handleUserSelect} />
          )}
          
          {activeTab === 'activities' && (
            <ActivityLogList onUserSelect={handleUserSelect} />
          )}
          
          {activeTab === 'stats' && (
            <ActivityStats />
          )}
          
          {activeTab === 'userHistory' && selectedUserId && (
            <UserConnectionHistory userId={selectedUserId} />
          )}
        </div>
      </div>
    </MonitoringProvider>
  );
};

export default Monitoring;