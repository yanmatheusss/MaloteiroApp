import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { MapPin, Navigation, Clock, Power, DollarSign, Settings, Bell, Menu, Info, WifiOff, Globe, Wallet, XCircle, Trash2 } from 'lucide-react';
import { DeliveryStatus } from '../types';

export const DashboardScreen: React.FC = () => {
  const { currentLocation, myDeliveries, user, toggleOnline, updatePricing, isNetworkOnline, systemVersion, systemStatus, updateLocation, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  
  // Local state
  const [baseFee, setBaseFee] = useState(user?.pricing?.baseFee || 5.0);
  const [perKm, setPerKm] = useState(user?.pricing?.perKm || 2.5);
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [manualLocMode, setManualLocMode] = useState(false);
  const [manualLocText, setManualLocText] = useState(currentLocation.address);

  const upcomingDeliveries = myDeliveries.filter(d => d.status !== DeliveryStatus.DELIVERED && d.status !== DeliveryStatus.CANCELLED).length;

  // Notification logic
  const myNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = myNotifications.filter(n => !n.read).length;

  // Calculo simples de ganhos hoje para display
  const today = new Date().toISOString().split('T')[0];
  const earningsToday = myDeliveries
    .filter(d => d.status === DeliveryStatus.DELIVERED && d.date.startsWith(today))
    .reduce((acc, curr) => acc + (curr.price - (curr.platformFee || 0)), 0);

  const handleSavePricing = () => {
    updatePricing(parseFloat(baseFee.toString()), parseFloat(perKm.toString()));
    setShowPricingConfig(false);
  };
  
  const handleSaveLocation = () => {
      updateLocation({ ...currentLocation, address: manualLocText });
      setManualLocMode(false);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleOpenNotifications = () => {
      setShowNotifications(true);
      markAllNotificationsRead();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto">
      
      {/* Offline Banner */}
      {!isNetworkOnline && (
          <div className="bg-red-500 text-white text-xs font-bold p-2 text-center flex justify-center items-center gap-2 sticky top-0 z-50">
              <WifiOff size={14} /> SEM INTERNET - MODO OFFLINE ATIVADO
          </div>
      )}

      <header className="p-6 mb-2 mt-2 flex justify-between items-center relative">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Olá, {user?.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 text-sm flex items-center gap-1">
                {user?.isOnline ? <span className="text-green-600 font-bold">● Online</span> : <span className="text-slate-400">○ Offline</span>}
            </p>
        </div>
        
        <div className="flex items-center gap-3">
             <button 
                onClick={handleOpenNotifications} 
                className="p-2 bg-white rounded-full shadow text-slate-500 relative"
             >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
             </button>
             <button onClick={() => setShowSystemInfo(true)} className="p-2 bg-white rounded-full shadow text-slate-500">
                <Menu size={24} />
             </button>
             <button 
                onClick={toggleOnline}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 border-4 ${user?.isOnline ? 'bg-green-500 border-green-200 shadow-green-500/40' : 'bg-slate-300 border-slate-100'}`}
            >
                <Power size={20} className="text-white" />
            </button>
        </div>
      </header>

      <div className="px-6 space-y-6">
        
        {/* News / Alerts Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-sm font-bold uppercase flex items-center gap-2 mb-1 text-yellow-400">
                    <Bell size={16} /> Novidade
                </h3>
                <p className="text-lg font-bold">Prazos Inteligentes</p>
                <p className="text-xs text-slate-400 mt-1">Agora calculamos o prazo de entrega com base na média da região!</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
                <Navigation size={80} />
            </div>
        </div>

        {/* Pricing Configuration Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2 text-slate-800">
                    <DollarSign size={20} className="text-brand-600" />
                    <h2 className="font-bold text-sm uppercase tracking-wider">Sua Tabela de Preços</h2>
                </div>
                <button onClick={() => setShowPricingConfig(!showPricingConfig)} className="text-slate-400 hover:text-brand-600">
                    <Settings size={18} />
                </button>
            </div>

            {showPricingConfig ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase">Taxa Fixa (R$)</label>
                            <input 
                                type="number" 
                                step="0.50"
                                value={baseFee}
                                onChange={(e) => setBaseFee(Number(e.target.value))}
                                className="w-full p-2 bg-white border border-gray-200 rounded text-lg font-bold text-slate-800 mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase">Por KM (R$)</label>
                            <input 
                                type="number" 
                                step="0.10"
                                value={perKm}
                                onChange={(e) => setPerKm(Number(e.target.value))}
                                className="w-full p-2 bg-white border border-gray-200 rounded text-lg font-bold text-slate-800 mt-1"
                            />
                        </div>
                    </div>
                    <Button fullWidth onClick={handleSavePricing} className="py-2 text-sm bg-brand-600">Salvar Valores</Button>
                </div>
            ) : (
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                        <span className="block text-xs text-slate-400 uppercase">Valor Cobrado</span>
                        <span className="text-lg font-bold text-slate-900">
                             {formatCurrency(user?.pricing?.baseFee || 0)} + {formatCurrency(user?.pricing?.perKm || 0)}/km
                        </span>
                    </div>
                </div>
            )}
        </div>

        {/* Location Card with Manual Override */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 text-brand-600">
                <div className="flex items-center space-x-3">
                    <MapPin size={20} />
                    <h2 className="font-semibold uppercase text-sm tracking-wider">Região Atual</h2>
                </div>
                <button 
                    onClick={() => setManualLocMode(!manualLocMode)} 
                    className="text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-2 py-1 rounded"
                >
                    {manualLocMode ? 'Usar GPS' : 'Alterar'}
                </button>
            </div>
            {manualLocMode ? (
                <div className="flex gap-2 animate-in fade-in">
                    <input 
                        value={manualLocText} 
                        onChange={e => setManualLocText(e.target.value)}
                        className="flex-1 border p-2 rounded text-sm bg-white text-slate-900"
                        placeholder="Digite sua cidade/bairro..."
                    />
                    <button onClick={handleSaveLocation} className="bg-brand-600 text-white px-3 rounded font-bold">OK</button>
                </div>
            ) : (
                <p className="text-lg font-medium text-slate-800 leading-snug flex items-center gap-2">
                    {currentLocation.address} <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">GPS</span>
                </p>
            )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div 
                onClick={() => navigate('/my-deliveries')}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
            >
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-2">
                    <Clock size={24} />
                </div>
                <span className="text-3xl font-bold text-slate-900">{upcomingDeliveries}</span>
                <span className="text-xs text-slate-500 font-medium uppercase">Entregas Pendentes</span>
            </div>
            
            <div 
                onClick={() => navigate('/financial')}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
            >
                <div className="bg-green-100 p-3 rounded-full text-green-600 mb-2">
                    <DollarSign size={24} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{formatCurrency(earningsToday)}</span>
                <span className="text-xs text-slate-500 font-medium uppercase">Ganhos Hoje</span>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-3">
            {user?.isOnline ? (
                <Button 
                fullWidth 
                className="shadow-xl shadow-brand-500/30 text-xl py-6 animate-pulse"
                onClick={() => navigate('/find')}
                >
                PROCURAR ENTREGAS DISPONÍVEIS
                </Button>
            ) : (
                <div className="bg-gray-200 text-gray-500 p-4 rounded-xl text-center font-medium">
                    Fique ONLINE para ver entregas
                </div>
            )}
            
            <Button 
                fullWidth 
                variant="outline"
                onClick={() => navigate('/financial')}
                className="flex items-center justify-center gap-2 text-slate-700 border-slate-300"
            >
                <Wallet size={20} /> ACESSAR PAINEL FINANCEIRO
            </Button>
            
            {upcomingDeliveries > 0 && (
            <Button 
                fullWidth 
                variant="secondary"
                onClick={() => navigate('/my-deliveries')}
            >
                VER MINHAS ROTAS ({upcomingDeliveries})
            </Button>
            )}
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
           <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-in slide-in-from-right">
                <div className="bg-white w-4/5 h-full p-6 shadow-2xl overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                         <h2 className="font-bold text-xl flex items-center gap-2">
                              <Bell className="text-brand-600" /> Notificações
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