import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import HomePage from './pages/Home/Home';
import UsersPage from './pages/Users/Users';
import RolesPage from './pages/Roles/Roles';
import PermissionsPage from './pages/Permissions/Permissions';
import SettingsPage from './pages/Settings/Settings';
// Import des nouvelles pages (à créer)
import PostesPage from './pages/Postes/Postes';
// import ClientsPage from './pages/Clients/Clients';
// import VentesPage from './pages/Ventes/Ventes';
// import InventairePage from './pages/Inventaire/Inventaire';
// import FinancesPage from './pages/Finances/Finances';
// import EvenementsPage from './pages/Evenements/Evenements';
import Monitoring from './pages/Monitoring/Monitoring';

const AppRoutes = () => {
  const { hasPermission } = useAuth();
  
  // Limiter les logs de débogage
  // const enableDebug = false;
  // if (enableDebug) {
  //   console.log("==== VERIFICATION PERMISSIONS DANS APPROUTES ====");
  //   console.log("MANAGE_USERS:", hasPermission('MANAGE_USERS'));
  //   console.log("MANAGE_ROLES:", hasPermission('MANAGE_ROLES'));
  // }

  return (
    <Routes>
      {/* Route racine - correspond à /dashboard dans l'URL du navigateur */}
      <Route path="/" element={<HomePage />} />
      
      {/* Routes pour les postes gaming */}
      <Route path="/postes" element={
        hasPermission('POSTES_VIEW') 
          ? <PostesPage /> 
          : <Navigate to="/" replace />
      } />
     
    
 <Route path="/monitoring" element={
        hasPermission('ADMIN') 
          ?  <Monitoring />
   
          : <Navigate to="/" replace />
      } />
      {/* Routes pour les clients */}
      {/* <Route path="/clients" element={
        hasPermission('CUSTOMERS_VIEW') 
          ? <ClientsPage /> 
          : <Navigate to="/" replace />
      } /> */}
      
      {/* Routes pour les ventes */}
      {/* <Route path="/ventes" element={
        hasPermission('SALES_VIEW') 
          ? <VentesPage /> 
          : <Navigate to="/" replace />
      } /> */}
      
      {/* Routes pour l'inventaire */}
      {/* <Route path="/inventaire" element={
        hasPermission('INVENTORY_VIEW') 
          ? <InventairePage /> 
          : <Navigate to="/" replace />
      } /> */}
      
      {/* Routes pour les finances */}
      {/* <Route path="/finances" element={
        hasPermission('FINANCE_VIEW') 
          ? <FinancesPage /> 
          : <Navigate to="/" replace />
      } /> */}
      
      {/* Routes pour les événements */}
      {/* <Route path="/evenements" element={
        hasPermission('EVENTS_VIEW') 
          ? <EvenementsPage /> 
          : <Navigate to="/" replace />
      } /> */}
      
      {/* Routes pour l'administration système */}
      <Route path="/users" element={
        hasPermission('USERS_VIEW') 
          ? <UsersPage /> 
          : <Navigate to="/" replace />
      } />
      
      <Route path="/roles" element={
        hasPermission('ROLES_VIEW')
          ? <RolesPage /> 
          : <Navigate to="/" replace />
      } />
      
      <Route path="/permissions" element={
        hasPermission('PERMISSIONS_VIEW')
          ? <PermissionsPage /> 
          : <Navigate to="/" replace />
      } />
      
      {/* Paramètres - accessible à tous */}
      <Route path="/settings" element={<SettingsPage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;