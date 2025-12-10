import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Delivery, DeliveryStatus } from '../types';
import { ChevronRight, Package, Truck, CheckCircle, MapPin } from 'lucide-react';

export const MyDeliveriesScreen: React.FC = () => {
  const { myDeliveries } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
       <div className="bg-white p-4 shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Minhas Entregas</h1>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto">
        {myDeliveries.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p>Você não tem entregas ativas.</p>
          </div>
        ) : (
          myDeliveries.map((delivery) => (
            <MyDeliveryCard 
              key={delivery.id} 
              delivery={delivery} 
              onClick={() => navigate(`/details/${delivery.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const MyDeliveryCard: React.FC<{ delivery: Delivery; onClick: () => void }> = ({ delivery, onClick }) => {
  const getStatusInfo = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.ACCEPTED: return { label: 'Aceita', color: 'bg-blue-100 text-blue-700', icon: CheckCircle };
      case DeliveryStatus.TO_PICKUP: return { label: 'Indo Coletar', color: 'bg-yellow-100 text-yellow-700', icon: Truck };
      case DeliveryStatus.COLLECTED: return { label: 'Coletado', color: 'bg-purple-100 text-purple-700', icon: Package };
      case DeliveryStatus.DELIVERING: return { label: 'Em Rota', color: 'bg-orange-100 text-orange-700', icon: Truck };
      case DeliveryStatus.DELIVERED: return { label: 'Concluído', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      default: return { label: 'Pendente', color: 'bg-gray-100 text-gray-600', icon: MapPin };
    }
  };

  const statusInfo = getStatusInfo(delivery.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${statusInfo.color}`}>
          <StatusIcon size={12} />
          {statusInfo.label}
        </span>
        <span className="text-slate-400 text-xs">ID #{delivery.id}</span>
      </div>

      <h3 className="font-bold text-slate-900 text-lg mb-1">{delivery.dropoff.address}</h3>
      <p className="text-slate-500 text-sm mb-3">Retirar em: {delivery.pickup.address}</p>

      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600 font-medium">{delivery.distanceKm} km</span>
        <div className="flex items-center text-brand-600 font-semibold text-sm">
          Detalhes <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};