import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Delivery, DeliveryStatus } from '../types';
import { Plus, Package, Clock, CheckCircle, MessageCircle, Truck, Newspaper, User, Calendar, WifiOff, Menu, Info, Globe, XCircle, ThumbsUp, ThumbsDown, StopCircle, MapPin, Ticket, FileText, Headphones, Bell } from 'lucide-react';
import { Button } from '../components/Button';

export const ClientDashboardScreen: React.FC = () => {
  const { user, myOrders, logout, onlineCouriersCount, isNetworkOnline, systemVersion, systemStatus, clientAcceptProposal, clientCancelDelivery, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Pedidos que precisam de aprovação
  const pendingApprovals = myOrders.filter(o => o.status === DeliveryStatus.WAITING_APPROVAL);

  const myNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleOpenNotifications = () => {
      setShowNotifications(true);
      markAllNotificationsRead();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
       {/* Offline Banner */}
      {!isNetworkOnline && (
          <div className="bg-red-500 text-white text-xs font-bold p-2 text-center flex justify-center items-center gap-2 sticky top-0 z-50">
              <WifiOff size={14} /> MODO OFFLINE
          </div>
      )}

      <div className="bg-white p-6 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Olá, {user?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${onlineCouriersCount > 0 ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${onlineCouriersCount > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    </span>
                    <p className={`text-sm font-bold ${onlineCouriersCount > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                        {onlineCouriersCount} Maloteiros Online
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                     <button 
                        onClick={handleOpenNotifications} 
                        className="p-1 bg-gray-100 rounded text-slate-500 relative"
                     >
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                     </button>
                     <button onClick={() => setShowSystemInfo(true)} className="p-1 bg-gray-100 rounded text-slate-500">
                        <Menu size={18} />
                     </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-500 font-medium bg-red-50 px-2 rounded">Sair</button>
                </div>
                <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100"
                >
                    <User size={12} /> Editar Perfil
                </button>
            </div>
        </div>
        
        <Button 
            fullWidth 
            onClick={() => navigate('/client/new-order')}
            className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
        >
            <Plus size={20} /> NOVA SOLICITAÇÃO
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Quick Menus Grid */}
        <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-1">
                    <MapPin size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">Meus Locais</span>
            </button>
            <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-1">
                    <FileText size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">Histórico</span>
            </button>
             <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-1">
                    <Ticket size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">Cupons</span>
            </button>
             <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
                    <Headphones size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">Suporte</span>
            </button>
        </div>

        {/* Pending Approvals Section */}
        {pendingApprovals.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                <h2 className="font-bold text-orange-600 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Clock size={16}/> Pendente de Aprovação
                </h2>
                {pendingApprovals.map(delivery => (
                    <div key={delivery.id} className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{delivery.dropoff.address}</p>
                                <p className="text-xs text-slate-500">Maloteiro: {delivery.courierName}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-bold text-green-600">{formatCurrency(delivery.price)}</span>
                                <span className="text-[10px] text-slate-400">Proposta</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button 
                                onClick={() => clientAcceptProposal(delivery.id, false)}
                                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-200"
                            >
                                <ThumbsDown size={14} /> Recusar
                            </button>
                            <button 
                                onClick={() => clientAcceptProposal(delivery.id, true)}
                                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-green-600"
                            >
                                <ThumbsUp size={14} /> Aprovar Valor
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* News Section */}
        <div className="space-y-2">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                <Newspaper size={16}/> Novidades
            </h2>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 inline-block">Novo</span>
                <h3 className="font-bold text-lg leading-tight">Prazos Inteligentes</h3>
                <p className="text-sm text-white/80 mt-1">Agora você sabe a estimativa exata de entrega baseada na região!</p>
            </div>
        </div>

        {/* Recent Orders */}
        <div className="space-y-2">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Seus Pedidos Recentes</h2>
            
            {myOrders.filter(o => o.status !== DeliveryStatus.WAITING_APPROVAL).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 bg-white rounded-xl border border-gray-100 text-slate-400">
                    <Package size={32} className="mb-2 opacity-20"/>
                    <p className="text-sm">Nenhum pedido realizado.</p>
                </div>
            ) : (
                myOrders.filter(o => o.status !== DeliveryStatus.WAITING_APPROVAL).map(order => (
                    <ClientOrderCard 
                        key={order.id} 
                        delivery={order} 
                        onCancel={() => {
                            const success = clientCancelDelivery(order.id);
                            if (success) alert("Pedido cancelado com sucesso!");
                            else alert("Não é possível cancelar este pedido.");
                        }}
                    />
                ))
            )}
        </div>
      </div>

       {/* Notifications Modal */}
       {showNotifications && (
           <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-in slide-in-from-right">
                <div className="bg-white w-4/5 h-full p-6 shadow-2xl overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                         <h2 className="font-bold text-xl flex items-center gap-2">
                              <Bell className="text-blue-600" /> Notificações
                         </h2>
                         <button onClick={() => setShowNotifications(false)}><XCircle className="text-slate-400" /></button>
                    </div>
                    <div className="space-y-4">
                        {myNotifications.length === 0 ? (
                            <p className="text-slate-500 text-center py-10">Nenhuma notificação.</p>
                        ) : (
                            myNotifications.map(n => (
                                <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-4 rounded-xl border ${n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm ${n.read ? 'text-slate-700' : 'text-blue-700'}`}>{n.title}</h3>
                                        <span className="text-[10px] text-slate-400">{new Date(n.date).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
           </div>
      )}

       {/* System Info Modal */}
      {showSystemInfo && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b pb-4">
                      <h2 className="font-bold text-lg flex items-center gap-2">
                          <Info className="text-blue-500" /> Sobre o Sistema
                      </h2>
                      <button onClick={() => setShowSystemInfo(false)}><XCircle className="text-slate-400" /></button>
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <span className="text-slate-500 text-sm">Versão</span>
                          <span className="font-bold text-slate-800">{systemVersion}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <span className="text-slate-500 text-sm">Status do Sistema</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${systemStatus === 'OPERATIONAL' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {systemStatus === 'OPERATIONAL' ? 'ONLINE E OPERANTE' : 'MANUTENÇÃO'}
                          </span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <span className="text-slate-500 text-sm">Conexão</span>
                          <span className={`font-bold flex items-center gap-1 ${isNetworkOnline ? 'text-green-600' : 'text-red-600'}`}>
                              {isNetworkOnline ? <Globe size={14} /> : <WifiOff size={14} />}
                              {isNetworkOnline ? 'Conectado' : 'Offline'}
                          </span>
                      </div>
                  </div>
                  <Button fullWidth className="mt-6" onClick={() => setShowSystemInfo(false)}>Fechar</Button>
              </div>
          </div>
      )}
    </div>
  );
};

const ClientOrderCard: React.FC<{ delivery: Delivery; onCancel: () => void }> = ({ delivery, onCancel }) => {
    const isAssigned = delivery.courierId;
    const isScheduled = delivery.isScheduled;
    
    // Check if cancellable logic (Status < TO_PICKUP) and 1 hour rule
    const canCancel = React.useMemo(() => {
        if (delivery.status === DeliveryStatus.TO_PICKUP || 
            delivery.status === DeliveryStatus.COLLECTED ||
            delivery.status === DeliveryStatus.DELIVERING ||
            delivery.status === DeliveryStatus.DELIVERED || 
            delivery.status === DeliveryStatus.CANCELLED) return false;

        const created = new Date(delivery.date).getTime();
        const now = new Date().getTime();
        const diffHrs = (now - created) / (1000 * 60 * 60);
        return diffHrs <= 1;
    }, [delivery]);
    
    // Logic for warning messages
    const isToPickup = delivery.status === DeliveryStatus.TO_PICKUP;
    const isMoving = delivery.status === DeliveryStatus.COLLECTED || delivery.status === DeliveryStatus.DELIVERING;

    const handleWhatsApp = () => {
        if (!delivery.courierPhone) return;
        const message = `Olá ${delivery.courierName}, sobre a entrega para ${delivery.dropoff.address}.`;
        const url = `https://wa.me/55${delivery.courierPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatTime = (isoDate: string) => {
        return new Date(isoDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    // Find timeline events
    const timeline = delivery.timeline || [];
    const collectedEvent = timeline.find(e => e.status === DeliveryStatus.COLLECTED);
    const deliveredEvent = timeline.find(e => e.status === DeliveryStatus.DELIVERED);

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-4 ${isScheduled ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                    <StatusBadge status={delivery.status} />
                    {isScheduled && delivery.scheduledDate && (
                        <span className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                            <Calendar size={10} /> Agendado: {new Date(delivery.scheduledDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <span className={`font-bold ${delivery.price > 0 ? 'text-slate-900' : 'text-slate-400 text-sm'}`}>
                    {delivery.price > 0 ? formatCurrency(delivery.price) : 'Sob Consulta'}
                </span>
            </div>

            <div className="space-y-3 mb-4">
                <div>
                    <p className="text-xs text-slate-400 uppercase">Destino</p>
                    <p className="font-medium text-slate-800 text-sm leading-tight line-clamp-1">{delivery.dropoff.address}</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-400 uppercase">Estimativa (Região)</p>
                    <p className="font-medium text-slate-800 text-sm">{delivery.estimatedTimeMin} min</p>
                </div>
            </div>

             {/* Timeline Mini View for Client */}
             {(collectedEvent || deliveredEvent) && (
                <div className="mb-4 bg-gray-50 p-2 rounded border border-gray-100 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${collectedEvent ? 'bg-purple-500' : 'bg-gray-300'}`} />
                        <span className="text-slate-500">Coletado: {collectedEvent ? formatTime(collectedEvent.date) : '--:--'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${deliveredEvent ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-slate-500">Entregue: {deliveredEvent ? formatTime(deliveredEvent.date) : '--:--'}</span>
                    </div>
                </div>
            )}

            {isAssigned ? (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-2 flex items-center gap-1">
                        <Truck size={12} /> Maloteiro Designado
                    </p>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{delivery.courierName}</p>
                            <p className="text-xs text-slate-500">{delivery.courierVehicle}</p>
                        </div>
                        <button 
                            onClick={handleWhatsApp}
                            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 active:scale-95 shadow"
                        >
                            <MessageCircle size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-center">
                    <p className="text-xs text-yellow-700 font-medium flex items-center justify-center gap-1">
                        <Clock size={12} /> {delivery.price === 0 ? 'Aguardando Maloteiro Aceitar...' : 'Procurando entregador...'}
                    </p>
                </div>
            )}
            
            {canCancel && (
                <button 
                    onClick={onCancel}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-xs hover:bg-red-100 border border-red-100"
                >
                    <StopCircle size={14} /> Cancelar Pedido (1h)
                </button>
            )}

            {/* Warning Messages */}
            {isToPickup && (
                <div className="w-full mt-3 text-center bg-gray-100 text-gray-500 py-2 rounded-lg text-xs font-bold border border-gray-200">
                    Aguarde o maloteiro chegar.
                </div>
            )}
            
            {isMoving && (
                <div className="w-full mt-3 text-center bg-gray-100 text-gray-500 py-2 rounded-lg text-xs font-bold border border-gray-200 px-2">
                    Não é possível cancelar. Aguarde o Maloteiro fazer a entrega.
                </div>
            )}
        </div>
    );
};

const StatusBadge: React.FC<{ status: DeliveryStatus }> = ({ status }) => {
    let color = "bg-gray-100 text-gray-600";
    let text = "Pendente";
    let Icon = Clock;

    if (status === DeliveryStatus.PENDING_QUOTE) { color = "bg-purple-100 text-purple-700"; text = "Aguardando Cotação"; Icon = Calendar; }
    if (status === DeliveryStatus.WAITING_APPROVAL) { color = "bg-orange-100 text-orange-700"; text = "Aprovação Necessária"; Icon = DollarSign; }
    if (status === DeliveryStatus.ACCEPTED) { color = "bg-blue-100 text-blue-700"; text = "Aceito"; Icon = Truck; }
    if (status === DeliveryStatus.TO_PICKUP) { color = "bg-orange-100 text-orange-700"; text = "Indo Coletar"; Icon = Truck; }
    if (status === DeliveryStatus.COLLECTED) { color = "bg-purple-100 text-purple-700"; text = "Coletado"; Icon = Package; }
    if (status === DeliveryStatus.DELIVERING) { color = "bg-indigo-100 text-indigo-700"; text = "Em Rota"; Icon = Truck; }
    if (status === DeliveryStatus.DELIVERED) { color = "bg-green-100 text-green-700"; text = "Entregue"; Icon = CheckCircle; }
    if (status === DeliveryStatus.CANCELLED) { color = "bg-red-100 text-red-700"; text = "Cancelado"; Icon = XCircle; }

    if (text === "Pendente") text = "Aguardando";

    return (
        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1 ${color}`}>
            <Icon size={12} /> {text}
        </span>
    );
};

import { DollarSign } from 'lucide-react';