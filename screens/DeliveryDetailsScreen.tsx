import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DeliveryStatus } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Navigation, MapPin, Edit3, Crosshair, MessageCircle, Phone, User, StopCircle, Clock, CheckCircle, Package } from 'lucide-react';

export const DeliveryDetailsScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { myDeliveries, updateDeliveryStatus, updateRoute, updateLocation, currentLocation } = useApp();
  
  const delivery = myDeliveries.find(d => d.id === id);

  // Local state for UI toggles
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentLocation) setManualAddress(currentLocation.address);
  }, [currentLocation]);

  if (!delivery) return <div>Entrega não encontrada</div>;

  const handleStatusAdvance = () => {
    let nextStatus = delivery.status;
    
    // Determine next status
    if (delivery.status === DeliveryStatus.ACCEPTED) nextStatus = DeliveryStatus.TO_PICKUP;
    else if (delivery.status === DeliveryStatus.TO_PICKUP) nextStatus = DeliveryStatus.COLLECTED; // Confirmar Coleta
    else if (delivery.status === DeliveryStatus.COLLECTED) nextStatus = DeliveryStatus.DELIVERING; // Iniciar Entrega (notificação dispara no context)
    else if (delivery.status === DeliveryStatus.DELIVERING) {
       nextStatus = DeliveryStatus.DELIVERED;
       // Special handling for finish
       setSuccessMessage("Entrega feita com sucesso!");
       updateDeliveryStatus(delivery.id, nextStatus);
       
       // Redirect after 2 seconds
       setTimeout(() => {
         navigate('/my-deliveries');
       }, 2000);
       return;
    }
    
    updateDeliveryStatus(delivery.id, nextStatus);
  };
  
  const handleCourierCancel = () => {
      if (window.confirm("Tem certeza que deseja cancelar? Isso afetará sua reputação.")) {
          updateDeliveryStatus(delivery.id, DeliveryStatus.CANCELLED);
          navigate('/my-deliveries');
      }
  };

  const handleEditRoute = () => {
    // Simulate route recalculation
    const newDist = parseFloat((delivery.distanceKm * 1.1).toFixed(1)); // Add 10%
    const newTime = Math.ceil(delivery.estimatedTimeMin * 1.1);
    updateRoute(delivery.id, newDist, newTime);
    alert('Rota recalculada com sucesso! Nova distância e tempo estimados.');
  };

  const handleUpdateLocation = () => {
    // Simulate updating coords based on address text
    updateLocation({
      ...currentLocation,
      address: manualAddress,
      lat: currentLocation.lat + 0.001, // Jitter
      lng: currentLocation.lng + 0.001
    });
    setIsEditingLoc(false);
  };

  const handleWhatsApp = () => {
    const message = `Olá ${delivery.customerName}, sou seu entregador do Maloteiro. Estou com sua entrega!`;
    const url = `https://wa.me/55${delivery.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('pt-BR');
  };

  const getActionButtonText = () => {
    if (successMessage) return successMessage;

    switch (delivery.status) {
      case DeliveryStatus.ACCEPTED: return "INICIAR ROTA PARA COLETA";
      case DeliveryStatus.TO_PICKUP: return "CONFIRMAR COLETA";
      case DeliveryStatus.COLLECTED: return "INICIAR ENTREGA"; // 6. Só botão de iniciar entrega
      case DeliveryStatus.DELIVERING: return "CONFIRMAR ENTREGA";
      case DeliveryStatus.DELIVERED: return "FINALIZADO";
      default: return "AÇÃO";
    }
  };

  // 5. Botão cancelar só aparece até TO_PICKUP
  const showCancelButton = delivery.status === DeliveryStatus.ACCEPTED || delivery.status === DeliveryStatus.TO_PICKUP;

  // Find timestamps
  const timeline = delivery.timeline || [];
  const createdEvent = timeline.find(e => e.status === DeliveryStatus.AVAILABLE || e.status === DeliveryStatus.PENDING_QUOTE) || timeline[0];
  const collectedEvent = timeline.find(e => e.status === DeliveryStatus.COLLECTED);
  const deliveredEvent = timeline.find(e => e.status === DeliveryStatus.DELIVERED);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={() => navigate(-1)} className="bg-white/90 p-2 rounded-full shadow text-slate-800">
          <ArrowLeft size={24} />
        </button>
        <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow text-slate-800">
          ID: {delivery.id}
        </span>
      </div>

      {/* Map Placeholder */}
      <div className="h-1/2 w-full bg-slate-100 relative overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
            {/* SVG Pattern to look like a map */}
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>
        
        {/* Route visualization */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 100 100" className="overflow-visible">
             <path d="M 10 90 Q 50 10 90 50" stroke="#16a34a" strokeWidth="4" fill="none" strokeDasharray="8 4" />
             <circle cx="10" cy="90" r="4" fill="black" />
             <circle cx="90" cy="50" r="4" fill="#16a34a" />
          </svg>
        </div>

        {/* Floating Controls on Map */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button 
                onClick={handleEditRoute}
                className="bg-white p-3 rounded-full shadow-lg text-slate-700 active:bg-slate-50 border border-gray-100"
            >
                <Edit3 size={20} />
            </button>
            <button 
                onClick={() => setIsEditingLoc(true)}
                className="bg-white p-3 rounded-full shadow-lg text-slate-700 active:bg-slate-50 border border-gray-100"
            >
                <Crosshair size={20} />
            </button>
        </div>
      </div>

      {/* Info Sheet */}
      <div className="flex-1 bg-white -mt-6 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative z-10 flex flex-col">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />
        
        <div className="px-6 flex-1 overflow-y-auto">
            {isEditingLoc && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <label className="text-xs font-bold text-yellow-800 uppercase mb-1 block">Atualizar Localização Manual</label>
                    <div className="flex gap-2">
                        <input 
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            className="flex-1 p-2 rounded border border-yellow-300 text-sm bg-white text-slate-900"
                        />
                        <button onClick={handleUpdateLocation} className="bg-yellow-600 text-white px-3 py-2 rounded text-sm font-bold">OK</button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{delivery.estimatedTimeMin} min</h2>
                    <p className="text-slate-500">{delivery.distanceKm} km restantes</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-green-600">{formatCurrency(delivery.price)}</h2>
                </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-200 p-2 rounded-full text-blue-800">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-blue-600 uppercase font-bold">Cliente</p>
                            <p className="font-bold text-slate-900">{delivery.customerName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleWhatsApp}
                        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 active:scale-95 transition-all"
                    >
                        <MessageCircle size={24} />
                    </button>
                </div>
            </div>

            {/* Timeline / History */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Clock size={12}/> Histórico da Entrega
                </h3>
                <div className="space-y-4 relative">
                    {/* Line */}
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200 z-0"></div>

                    {/* Created */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-slate-400 border-4 border-white"></div>
                        <div>
                            <p className="text-xs text-slate-500">Solicitado</p>
                            {createdEvent && <p className="text-sm font-bold text-slate-700">{formatDate(createdEvent.date)} às {formatTime(createdEvent.date)}</p>}
                        </div>
                    </div>

                     {/* Collected */}
                     <div className="relative z-10 flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-4 border-white ${collectedEvent ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                        <div>
                            <p className={`text-xs ${collectedEvent ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>Coletado</p>
                            {collectedEvent ? (
                                <p className="text-sm font-bold text-slate-700">{formatDate(collectedEvent.date)} às {formatTime(collectedEvent.date)}</p>
                            ) : (
                                <p className="text-xs text-slate-400">Pendente</p>
                            )}
                        </div>
                    </div>

                    {/* Delivered */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-4 border-white ${deliveredEvent ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                        <div>
                             <p className={`text-xs ${deliveredEvent ? 'text-green-600 font-bold' : 'text-slate-400'}`}>Finalizado</p>
                            {deliveredEvent ? (
                                <p className="text-sm font-bold text-slate-700">{formatDate(deliveredEvent.date)} às {formatTime(deliveredEvent.date)}</p>
                            ) : (
                                <p className="text-xs text-slate-400">Pendente</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <MapPin size={16} />
                        </div>
                        <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                            <Navigation size={16} />
                        </div>
                    </div>
                    <div className="flex-1 space-y-6 py-1">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Coleta</label>
                            <p className="font-medium text-slate-900">{delivery.pickup.address}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Entrega</label>
                            <p className="font-medium text-slate-900">{delivery.dropoff.address}</p>
                            {delivery.notes && (
                                <p className="text-sm text-amber-600 mt-1 bg-amber-50 p-2 rounded">
                                    Obs: {delivery.notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex gap-3">
            {showCancelButton && (
                <Button 
                    variant="danger"
                    onClick={handleCourierCancel}
                    className="flex-1 flex items-center justify-center gap-2"
                >
                    <StopCircle size={20} /> CANCELAR
                </Button>
            )}
            <Button 
                fullWidth 
                onClick={handleStatusAdvance}
                disabled={!!successMessage}
                className={`flex-[4] shadow-lg transition-colors duration-500 ${successMessage ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
                {successMessage && <span className="flex items-center justify-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div> {successMessage}</span>}
                {!successMessage && getActionButtonText()}
            </Button>
        </div>
      </div>
    </div>
  );
};