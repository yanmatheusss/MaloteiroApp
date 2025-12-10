import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Delivery, DeliveryStatus } from '../types';
import { Button } from '../components/Button';
import { MapPin, DollarSign, Calendar, Filter, Radar, MessageCircle, Clock, Check, AlertTriangle, X, Power } from 'lucide-react';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const FindDeliveriesScreen: React.FC = () => {
  const { availableDeliveries, proposePrice, refuseDelivery, currentLocation, user, toggleOnline } = useApp();
  const [filterType, setFilterType] = useState<'NEARBY' | 'ALL'>('NEARBY');
  
  const SEARCH_RADIUS_KM = 25; 

  const [deliveryToRefuse, setDeliveryToRefuse] = useState<Delivery | null>(null);

  const filteredDeliveries = useMemo(() => {
    if (!user?.isOnline) return []; // Retorna vazio se offline

    if (filterType === 'ALL') return availableDeliveries;

    return availableDeliveries.filter(d => {
      const dist = getDistanceFromLatLonInKm(currentLocation.lat, currentLocation.lng, d.pickup.lat, d.pickup.lng);
      return dist <= SEARCH_RADIUS_KM;
    });
  }, [availableDeliveries, currentLocation, filterType, user?.isOnline]);

  const confirmRefusal = () => {
      if (deliveryToRefuse) {
          refuseDelivery(deliveryToRefuse.id);
          setDeliveryToRefuse(null);
      }
  };

  if (!user?.isOnline) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div className="bg-gray-200 p-6 rounded-full">
                  <Power size={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700">Você está Offline</h2>
              <p className="text-slate-500">Fique online para procurar entregas e receber novas rotas.</p>
              <Button onClick={toggleOnline} fullWidth>FICAR ONLINE</Button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      <div className="bg-white p-4 shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-bold mb-4">Procurar Entregas</h1>
        
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button 
            onClick={() => setFilterType('NEARBY')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'NEARBY' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Radar size={16} />
            Região ({SEARCH_RADIUS_KM}km)
          </button>
          <button 
            onClick={() => setFilterType('ALL')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'ALL' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
          >
            Todas as Cidades
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {filteredDeliveries.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Filter size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhuma entrega encontrada {filterType === 'NEARBY' ? 'neste raio' : ''}.</p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => {
             const distToPickup = getDistanceFromLatLonInKm(currentLocation.lat, currentLocation.lng, delivery.pickup.lat, delivery.pickup.lng).toFixed(1);

             return (
              <DeliveryCard 
                key={delivery.id} 
                delivery={delivery} 
                distToPickup={distToPickup}
                onPropose={(price) => proposePrice(delivery.id, price)}
                onRequestRefuse={() => setDeliveryToRefuse(delivery)}
              />
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {deliveryToRefuse && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-100">
                  <div className="bg-red-50 p-6 flex flex-col items-center text-center">
                      <div className="bg-red-100 p-3 rounded-full mb-3">
                        <AlertTriangle className="text-red-600" size={32} />
                      </div>
                      <h2 className="text-lg font-bold text-red-900">Recusar esta entrega?</h2>
                      <p className="text-sm text-red-700 mt-1">Ela ficará disponível para outros maloteiros.</p>
                  </div>
                  <div className="p-6">
                      <div className="flex gap-3">
                          <Button variant="secondary" fullWidth onClick={() => setDeliveryToRefuse(null)}>Não, Voltar</Button>
                          <Button variant="danger" fullWidth onClick={confirmRefusal}>Sim, Recusar</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

const DeliveryCard: React.FC<{ 
  delivery: Delivery; 
  distToPickup: string;
  onPropose: (price: number) => void; 
  onRequestRefuse: () => void; 
}> = ({ delivery, distToPickup, onPropose, onRequestRefuse }) => {
    
  const isScheduled = delivery.isScheduled;
  const isWaitingApproval = delivery.status === DeliveryStatus.WAITING_APPROVAL;
  
  // Se já tiver preço, sugere ele, senão vazio
  const [proposalPrice, setProposalPrice] = useState<string>(delivery.price > 0 ? delivery.price.toString() : '');
  const [isQuoting, setIsQuoting] = useState(false);
  
  // Timer state for refusal
  const [refuseTimer, setRefuseTimer] = useState(0);
  const [isRefusing, setIsRefusing] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRefusing && refuseTimer > 0) {
        interval = setInterval(() => {
            setRefuseTimer((prev) => prev - 1);
        }, 1000);
    } else if (isRefusing && refuseTimer === 0) {
        clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRefusing, refuseTimer]);

  const handleRefuseClick = () => {
      if (!isRefusing) {
          setIsRefusing(true);
          setRefuseTimer(5);
      } else if (refuseTimer === 0) {
          onRequestRefuse();
          setIsRefusing(false); 
      }
  };

  const handleWhatsApp = () => {
     const message = `Olá, gostaria de combinar o valor para a entrega em ${delivery.dropoff.address}.`;
     const url = `https://wa.me/55${delivery.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
     window.open(url, '_blank');
  };

  const handleSubmitProposal = () => {
      if (!proposalPrice || parseFloat(proposalPrice) <= 0) return alert("Defina um valor válido.");
      onPropose(parseFloat(proposalPrice));
      setIsQuoting(false);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isWaitingApproval) {
      return (
        <div className="rounded-2xl shadow-sm border border-yellow-200 bg-yellow-50 overflow-hidden">
            <div className="p-5 text-center">
                <Clock className="mx-auto text-yellow-600 mb-2" size={32} />
                <h3 className="font-bold text-yellow-800">Aguardando Aprovação do Cliente</h3>
                <p className="text-sm text-yellow-700 mt-1 mb-2">Você ofertou <strong>{formatCurrency(delivery.price)}</strong></p>
                <p className="text-xs text-slate-500">Assim que o cliente aprovar, a rota aparecerá em "Minhas Entregas".</p>
            </div>
        </div>
      );
  }

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${isScheduled ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
            <MapPin size={12}/> {distToPickup}km até coleta
          </span>
          <div className="flex items-center text-green-600 font-bold text-lg">
            {delivery.price > 0 ? (
                <>
                <DollarSign size={18} />
                <span>{delivery.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </>
            ) : (
                <span className="text-purple-600 text-sm bg-purple-100 px-2 py-1 rounded">Sob Consulta</span>
            )}
          </div>
        </div>
        
        {isScheduled && delivery.scheduledDate && (
             <div className="mb-4 bg-white/50 p-2 rounded border border-purple-100 text-purple-800 text-sm font-bold flex items-center gap-2">
                <Calendar size={16} />
                Agendado: {new Date(delivery.scheduledDate).toLocaleString()}
             </div>
        )}

        <div className="space-y-4 mb-6 relative">
          <div className="absolute left-2.5 top-2 bottom-6 w-0.5 bg-gray-200" />
          <div className="flex items-start space-x-3 relative">
            <div className="w-5 h-5 rounded-full bg-slate-900 border-4 border-white shadow-sm shrink-0 z-10" />
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Retirada</p>
              <p className="text-slate-800 font-medium text-sm">{delivery.pickup.address}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 relative">
            <div className="w-5 h-5 rounded-full bg-brand-500 border-4 border-white shadow-sm shrink-0 z-10" />
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Entrega</p>
              <p className="text-slate-800 font-medium text-sm">{delivery.dropoff.address}</p>
            </div>
          </div>
        </div>

        {isQuoting && (
            <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-green-800 uppercase mb-1">Valor da Proposta (R$)</label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        step="0.50" 
                        autoFocus
                        placeholder="0.00"
                        className="flex-1 p-2 bg-white rounded border border-green-300 text-lg font-bold text-slate-800"
                        value={proposalPrice}
                        onChange={e => setProposalPrice(e.target.value)}
                    />
                </div>
                <p className="text-[10px] text-green-700 mt-1">O cliente precisa aprovar este valor.</p>
            </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {!isQuoting ? (
            <button 
                onClick={handleRefuseClick}
                disabled={isRefusing && refuseTimer > 0}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    isRefusing 
                    ? (refuseTimer > 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 animate-pulse') 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
            >
                {isRefusing 
                    ? (refuseTimer > 0 ? `Aguarde ${refuseTimer}s...` : 'CONFIRMAR RECUSA') 
                    : 'Recusar'}
            </button>
          ) : (
            <Button variant="secondary" onClick={() => setIsQuoting(false)} className="py-3 text-sm">Cancelar</Button>
          )}
          
          <Button variant="primary" onClick={() => isQuoting ? handleSubmitProposal() : setIsQuoting(true)} className={`py-3 text-sm ${isScheduled ? 'bg-purple-600 hover:bg-purple-700' : ''}`}>
             {isQuoting ? 'Enviar Proposta' : 'Negociar / Aceitar'}
          </Button>
        </div>
        
        {!isQuoting && (
            <button onClick={handleWhatsApp} className="w-full mt-3 text-green-600 text-xs font-bold flex items-center justify-center gap-1">
                <MessageCircle size={14} /> Dúvidas? Chamar no WhatsApp
            </button>
        )}
      </div>
    </div>
  );
};