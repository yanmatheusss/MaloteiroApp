import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { FindDeliveriesScreen } from './screens/FindDeliveriesScreen';
import { MyDeliveriesScreen } from './screens/MyDeliveriesScreen';
import { DeliveryDetailsScreen } from './screens/DeliveryDetailsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FinancialScreen } from './screens/FinancialScreen'; // Nova Importação
import { ClientDashboardScreen } from './screens/ClientDashboardScreen';
import { ClientNewOrderScreen } from './screens/ClientNewOrderScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useApp();
  // Se for CLIENT ou ADMIN, não mostra a BottomNav do Maloteiro
  const hideBottomNav = user?.type === 'CLIENT' || user?.type === 'ADMIN';

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          
          {/* Rotas Maloteiro */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/find" 
            element={
              <ProtectedRoute>
                <FindDeliveriesScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-deliveries" 
            element={
              <ProtectedRoute>
                <MyDeliveriesScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/details/:id" 
            element={
              <ProtectedRoute>
                <DeliveryDetailsScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/financial" 
            element={
              <ProtectedRoute>
                <FinancialScreen />
              </ProtectedRoute>
            } 
          />

          {/* Rotas Cliente */}
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute>
                <ClientDashboardScreen />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/client/new-order" 
            element={
              <ProtectedRoute>
                <ClientNewOrderScreen />
              </ProtectedRoute>
            } 
          />

          {/* Rotas Admin */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboardScreen />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </div>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;