import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Package, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Início', icon: Home },
    { path: '/find', label: 'Procurar', icon: Search },
    { path: '/my-deliveries', label: 'Minhas', icon: Package },
    { path: '/profile', label: 'Perfil', icon: User },
  ];

  // Don't show on details screen to give more space, or login
  if (location.pathname === '/' || location.pathname.startsWith('/details/')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-brand-600' : 'text-gray-400'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};