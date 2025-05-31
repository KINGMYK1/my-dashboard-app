import React, { useState } from 'react';
import { useActivityStats } from '../../hooks/useMonitoring';
import { Card, Spinner, Button, Select } from '../ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const ActivityStats = () => {
  const [period, setPeriod] = useState(30);
  const { data, isLoading, isError, error, refetch } = useActivityStats(period);
  
  if (isLoading && !data) {
    return <Spinner size="lg" className="mx-auto my-8" />;
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>Erreur lors du chargement des statistiques: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-2">Réessayer</Button>
      </div>
    );
  }
  
  const stats = data?.data || {};
  const { actionStats = [], statusStats = [], userStats = [], dailyActivity = [] } = stats;
  
  // Couleurs pour les graphiques
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Options de période
  const periodOptions = [
    { value: 7, label: '7 derniers jours' },
    { value: 30, label: '30 derniers jours' },
    { value: 90, label: '3 derniers mois' },
    { value: 365, label: 'Dernière année' }
  ];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Statistiques d'Activité
        </h2>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Période:
          </span>
          <Select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            options={periodOptions}
            className="w-48"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Statistiques par type d'action */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Actions
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionStats} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="action" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Statistiques par statut */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Statuts
          </h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité quotidienne */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Activité quotidienne
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Top utilisateurs */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Top utilisateurs
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userStats}>
                <XAxis 
                  dataKey="user.username" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [value, 'Actions']}
                  labelFormatter={(label) => `Utilisateur: ${label}`}
                />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ActivityStats;