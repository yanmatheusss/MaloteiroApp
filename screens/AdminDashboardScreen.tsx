import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Truck, ShoppingBag, ShieldCheck, Plus, XCircle, CheckCircle, Trash2, MapPin, StopCircle, UserPlus, Copy, AlertTriangle, Send, Settings, Server, DollarSign, Wallet, Activity, LayoutDashboard, Edit, Zap, Wifi, RefreshCw, MessageSquare, Lock, LogOut } from 'lucide-react';
import { Button } from '../components/Button';
import { UserProfile, UserStatus, DeliveryStatus, Delivery } from '../types';

export const AdminDashboardScreen: React.FC = () => {
  const { 
      usersRegistry, 
      availableDeliveries, 
      onlineCouriersCount, 
      logout, 
      adminAddUser, 
      adminEditUser,
      adminDeleteUser, 
      adminToggleStatus, 
      adminCancelDelivery,
      adminSetSystemStatus,
      adminCheckServer,
      adminCleanSystem,
      adminSendNotification,
      systemStatus
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'ROUTES' | 'SYSTEM'>('DASHBOARD');
  const [userFilter, setUserFilter] = useState<'ALL' | 'COURIER' | 'CLIENT' | 'ADMIN'>('ALL');
  
  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<UserProfile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null); 
  const [showNotifyModal, setShowNotifyModal] = useState<UserProfile | null>(null);
  const [showCancelRouteModal, setShowCancelRouteModal] = useState<Delivery | null>(null);
  
  const [createdUserCreds, setCreatedUserCreds] = useState<{login: string, pass: string, phone: string, name: string} | null>(null);

  // System States
  const [serverStatus, setServerStatus] = useState<{online: boolean, latency: number, message: string} | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<string | null>(null);

  // Edit/Add Form States
  const [formUserType, setFormUserType] = useState<'COURIER' | 'CLIENT' | 'ADMIN'>('COURIER');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formVehicle, setFormVehicle] = useState('Moto');
  const [formPlate, setFormPlate] = useState('');
  const [formAddress, setFormAddress] = useState('');
  
  // Notification State
  const [notifyMessage, setNotifyMessage] = useState('');
  const quickTexts = [
      "Sua documentação está pendente. Favor regularizar.",
      "Identificamos um problema na sua última entrega.",
      "Parabéns! Sua conta foi verificada com sucesso.",
      "Atenção: Seu saldo está negativo. Regularize para continuar."
  ];

  // Stats
  const couriers = usersRegistry.filter(u => u.type === 'COURIER');
  const totalUsers = usersRegistry.length;
  const activeDeliveriesCount = availableDeliveries.filter(d => d.status !== DeliveryStatus.CANCELLED && d.status !== DeliveryStatus.DELIVERED).length;

  // --- Handlers ---

  const generateCredentials = (name: string) => {
      const firstName = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const login = `${firstName}${Math.floor(Math.random() * 1000)}`;
      const pass = Math.random().toString(36).slice(-6).toLowerCase();
      return { login, pass };
  };

  const handleCreateTestAdmin = () => {
      const idSuffix = Math.floor(Math.random() * 900) + 100;
      const newUser: UserProfile = {
          id: `admin-test-${idSuffix}`,
          name: `Admin Teste ${idSuffix}`,
          email: `admintest${idSuffix}`,
          password: 'admin',
          phone: '(00) 00000-0000',
          type: 'ADMIN',
          status: UserStatus.ACTIVE
      };
      adminAddUser(newUser);
      setCreatedUserCreds({ login: newUser.email, pass: 'admin', phone: newUser.phone, name: newUser.name });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formName || !formPhone) return alert('Preencha os campos obrigatórios');
    const creds = generateCredentials(formName);
    
    const newUser: UserProfile = {
        id: `${formUserType.toLowerCase()}-${Date.now()}`,
        name: formName,
        email: creds.login,
        password: creds.pass,
        phone: formPhone,
        type: formUserType,
        status: UserStatus.ACTIVE,
        isOnline: false,
        address: formAddress,
        ...(formUserType === 'COURIER' ? { vehicleType: formVehicle as any, plate: formPlate, pricing: { baseFee: 5, perKm: 2 } } : {})
    };
    adminAddUser(newUser);
    setCreatedUserCreds({ login: creds.login, pass: creds.pass, phone: formPhone, name: formName });
    closeModals();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!showEditModal) return;
      const updatedUser: UserProfile = {
          ...showEditModal,
          name: formName,
          phone: formPhone,
          email: formEmail,
          password: formPassword,
          address: formAddress,
          vehicleType: formUserType === 'COURIER' ? (formVehicle as any) : undefined,
          plate: formUserType === 'COURIER' ? formPlate : undefined
      };
      adminEditUser(updatedUser);
      closeModals();
  };

  const openEditModal = (user: UserProfile) => {
      setShowEditModal(user);
      setFormName(user.name);
      setFormPhone(user.phone);
      setFormEmail(user.email);
      setFormPassword(user.password || '');
      setFormAddress(user.address || '');
      setFormUserType(user.type);
      setFormVehicle(user.vehicleType || 'Moto');
      setFormPlate(user.plate || '');
  };

  const closeModals = () => {
      setShowAddModal(false);
      setShowEditModal(null);
      setShowNotifyModal(null);
      setFormName(''); setFormPhone(''); setFormEmail(''); setFormPlate(''); setFormAddress('');
      setNotifyMessage('');
  };

  const handleDeleteConfirm = () => {
      if (showDeleteModal) { adminDeleteUser(showDeleteModal); setShowDeleteModal(null); }
  };

  const handleWhatsAppShare = (phone: string, text: string) => {
      const url = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  const handleCheckServer = async () => {
      setIsCheckingServer(true);
      setServerStatus(null);
      const result = await adminCheckServer();
      setServerStatus(result);
      setIsCheckingServer(false);
  };

  const handleCleanSystem = async () => {
      setIsCleaning(true);
      setCleanResult(null);
      const result = await adminCleanSystem();
      setCleanResult(`${result.status} (Memória liberada: ${result.memoryFreed})`);
      setIsCleaning(false);
      setTimeout(() => {
          // Pequeno reload visual ou reset de estado se necessário, 
          // mas o pedido diz "ao concluir volta um status limpo com sucesso"
      }, 1000);
  };

  const handleCancelRouteTechnical = () => {
      if (showCancelRouteModal) {
          adminCancelDelivery(showCancelRouteModal.id, "Problemas Técnicos - Cancelado pelo Suporte");
          setShowCancelRouteModal(null);
      }
  };

  const handleSendNotification = () => {
      if(showNotifyModal && notifyMessage) {
          adminSendNotification(showNotifyModal.id, "Mensagem do Suporte", notifyMessage);
          closeModals();
          alert('Notificação enviada!');
      }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="bg-slate-900 text-white p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck size={20} className="text-brand-500" /> Admin
            </h1>
            <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${systemStatus === 'OPERATIONAL' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                 <button onClick={() => { logout(); navigate('/'); }} className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300">
                     <LogOut size={16} />
                 </button>
            </div>
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg overflow-x-auto gap-1 no-scrollbar">
            <button onClick={() => setActiveTab('DASHBOARD')} className={`flex-1 min-w-fit py-2 px-2 rounded-md text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1 ${activeTab === 'DASHBOARD' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <LayoutDashboard size={14} /> <span>Geral</span>
            </button>
            <button onClick={() => setActiveTab('USERS')} className={`flex-1 min-w-fit py-2 px-2 rounded-md text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1 ${activeTab === 'USERS' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <User size={14} /> <span>Usuários</span>
            </button>
            <button onClick={() => setActiveTab('ROUTES')} className={`flex-1 min-w-fit py-2 px-2 rounded-md text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1 ${activeTab === 'ROUTES' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <MapPin size={14} /> <span>Rotas</span>
            </button>
            <button onClick={() => setActiveTab('SYSTEM')} className={`flex-1 min-w-fit py-2 px-2 rounded-md text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1 ${activeTab === 'SYSTEM' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Activity size={14} /> <span>Sistema</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        
        {/* === DASHBOARD TAB === */}
        {activeTab === 'DASHBOARD' && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-[10px] text-slate-500 uppercase font-bold">Total Usuários</h3>
                    <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-[10px] text-slate-500 uppercase font-bold">Maloteiros Online</h3>
                    <p className="text-2xl font-bold text-green-600">{onlineCouriersCount}</p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 col-span-2">
                     <h3 className="text-[10px] text-slate-500 uppercase font-bold mb-2">Monitoramento</h3>
                     <div className="flex justify-between items-center">
                         <span className="text-sm font-medium">Rotas Ativas: <strong className="text-blue-600">{activeDeliveriesCount}</strong></span>
                         <span className={`px-2 py-1 rounded text-[10px] font-bold ${systemStatus === 'OPERATIONAL' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {systemStatus}
                         </span>
                     </div>
                </div>
                <div className="col-span-2 bg-slate-800 p-3 rounded-xl text-white mt-1">
                    <h3 className="font-bold text-sm flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> Ações Rápidas</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                         <button onClick={handleCreateTestAdmin} className="bg-white/10 hover:bg-white/20 py-2 rounded text-xs font-bold border border-white/10">Criar Admin Teste</button>
                         <button onClick={() => setActiveTab('SYSTEM')} className="bg-white/10 hover:bg-white/20 py-2 rounded text-xs font-bold border border-white/10">Verificar Saúde</button>
                    </div>
                </div>
            </div>
        )}

        {/* === USERS TAB === */}
        {activeTab === 'USERS' && (
            <div className="space-y-3 animate-in fade-in">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <button onClick={() => setUserFilter('ALL')} className={`px-3 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap ${userFilter === 'ALL' ? 'bg-slate-200 border-slate-300' : 'bg-white'}`}>Todos</button>
                            <button onClick={() => setUserFilter('COURIER')} className={`px-3 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap ${userFilter === 'COURIER' ? 'bg-slate-200 border-slate-300' : 'bg-white'}`}>Maloteiros</button>
                            <button onClick={() => setUserFilter('CLIENT')} className={`px-3 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap ${userFilter === 'CLIENT' ? 'bg-slate-200 border-slate-300' : 'bg-white'}`}>Clientes</button>
                             <button onClick={() => setUserFilter('ADMIN')} className={`px-3 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap ${userFilter === 'ADMIN' ? 'bg-slate-200 border-slate-300' : 'bg-white'}`}>Admins</button>
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="bg-brand-600 text-white p-1.5 rounded-full shadow hover:bg-brand-700 shrink-0"><Plus size={18} /></button>
                    </div>
                </div>

                <div className="space-y-2">
                    {usersRegistry.filter(u => userFilter === 'ALL' || u.type === userFilter).map(u => {
                        const isSuperAdmin = u.id === 'admin-master';
                        const isBlocked = u.status === UserStatus.BLOCKED;
                        const isOverdue = u.status === UserStatus.OVERDUE;

                        return (
                        <div key={u.id} className={`bg-white p-3 rounded-lg shadow-sm flex flex-col gap-2 border-l-4 ${isBlocked ? 'border-red-500 bg-red-50/10' : (u.type === 'COURIER' ? 'border-brand-500' : (u.type === 'ADMIN' ? 'border-slate-800' : 'border-blue-500'))}`}>
                             <div className="flex items-start justify-between">
                                 <div className="flex items-center gap-2">
                                     <div className={`p-1.5 rounded-full ${u.type === 'COURIER' ? 'bg-green-50 text-green-600' : (u.type === 'ADMIN' ? 'bg-slate-100 text-slate-800' : 'bg-blue-50 text-blue-600')}`}>
                                         {u.type === 'COURIER' ? <Truck size={14}/> : (u.type === 'ADMIN' ? <ShieldCheck size={14}/> : <ShoppingBag size={14}/>)}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className="font-bold text-slate-800 text-xs truncate flex items-center gap-1">
                                             {u.name} 
                                             {isSuperAdmin && <span className="text-[8px] bg-slate-800 text-white px-1 rounded uppercase">Master</span>}
                                         </p>
                                         <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                                         <p className="text-[10px] text-slate-500 truncate">{u.phone}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-1 shrink-0">
                                      <button onClick={() => openEditModal(u)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50"><Edit size={14} /></button>
                                      {!isSuperAdmin && (
                                         <button onClick={() => setShowDeleteModal(u.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                                      )}
                                 </div>
                             </div>

                             <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                 {/* Status / Block */}
                                 {!isSuperAdmin && (
                                     <button 
                                        onClick={() => adminToggleStatus(u.id, isBlocked ? UserStatus.ACTIVE : UserStatus.BLOCKED)}
                                        className={`flex-1 py-1 rounded text-[9px] font-bold flex items-center justify-center gap-1 ${isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                                     >
                                        {isBlocked ? <XCircle size={10}/> : <CheckCircle size={10}/>}
                                        {isBlocked ? 'BLOQUEADO' : 'ATIVO'}
                                     </button>
                                 )}

                                 {/* Financial Badge */}
                                 {u.type === 'COURIER' && (
                                     <span className={`px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                         {isOverdue ? 'INADIMPLENTE' : 'FINANCEIRO OK'}
                                     </span>
                                 )}
                                 
                                 {/* Notify */}
                                 <button onClick={() => setShowNotifyModal(u)} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                                     <MessageSquare size={14} />
                                 </button>
                             </div>
                        </div>
                    )})}
                </div>
            </div>
        )}

        {/* === ROUTES TAB === */}
        {activeTab === 'ROUTES' && (
            <div className="space-y-3 animate-in fade-in">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase">Gestão de Rotas (God Mode)</h2>
                {availableDeliveries.map(d => {
                     const isCancelled = d.status === DeliveryStatus.CANCELLED;
                     return (
                    <div key={d.id} className={`bg-white p-3 rounded-lg shadow-sm border ${isCancelled ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex flex-col">
                                 <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 w-fit mb-1">ID: {d.id}</span>
                                 <span className={`text-[9px] font-bold uppercase ${isCancelled ? 'text-red-600' : 'text-blue-600'}`}>
                                     {d.status}
                                 </span>
                             </div>
                             {!isCancelled && (
                                 <button 
                                    onClick={() => setShowCancelRouteModal(d)} 
                                    className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 hover:bg-red-100"
                                 >
                                    <StopCircle size={12} /> CANCELAR (TÉCNICO)
                                 </button>
                             )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="bg-gray-50 p-2 rounded">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">De (Cliente)</span>
                                <p className="font-medium truncate text-[10px]">{d.customerName}</p>
                                <p className="text-slate-500 truncate text-[10px]">{d.pickup.address}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Para</span>
                                <p className="text-slate-500 truncate text-[10px]">{d.dropoff.address}</p>
                            </div>
                        </div>

                        {d.courierId && (
                            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                <div className="flex items-center gap-2">
                                    <Truck size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-700">{d.courierName}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-2 mt-2">
                             {d.customerPhone && (
                                 <button 
                                    onClick={() => handleWhatsAppShare(d.customerPhone, "Olá, contato do Suporte Maloteiro sobre sua rota.")}
                                    className="flex-1 bg-green-500 text-white text-[9px] py-1.5 rounded flex items-center justify-center gap-1 font-bold"
                                 >
                                    <MessageSquare size={10} /> Whats Cliente
                                 </button>
                             )}
                             {d.courierPhone && (
                                 <button 
                                    onClick={() => handleWhatsAppShare(d.courierPhone, "Olá, contato do Suporte Maloteiro sobre sua rota.")}
                                    className="flex-1 bg-green-600 text-white text-[9px] py-1.5 rounded flex items-center justify-center gap-1 font-bold"
                                 >
                                    <MessageSquare size={10} /> Whats Maloteiro
                                 </button>
                             )}
                        </div>
                        
                        {d.notes && d.notes.includes('[Admin]') && (
                            <p className="mt-2 text-[9px] text-red-500 italic border-t pt-1 border-red-100">{d.notes}</p>
                        )}
                    </div>
                )})}
                {availableDeliveries.length === 0 && <p className="text-center text-slate-400 py-10 text-xs">Nenhuma rota encontrada.</p>}
            </div>
        )}

        {/* === SYSTEM TAB === */}
        {activeTab === 'SYSTEM' && (
            <div className="space-y-3 animate-in fade-in">
                {/* Server Status */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Server size={16} /> Status do Servidor Remoto</h2>
                    
                    <div className="flex flex-col gap-2">
                        <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-green-400 mb-1 h-20 overflow-y-auto">
                            {isCheckingServer ? (
                                <span className="animate-pulse">Pinging remote server...</span>
                            ) : serverStatus ? (
                                <>
                                > Status: {serverStatus.online ? 'ONLINE' : 'OFFLINE'}<br/>
                                > Latency: {serverStatus.latency}ms<br/>
                                > Msg: {serverStatus.message}
                                </>
                            ) : (
                                <span>> Aguardando verificação...</span>
                            )}
                        </div>
                        <Button onClick={handleCheckServer} disabled={isCheckingServer} className="py-2 text-xs bg-blue-600">
                            {isCheckingServer ? 'Verificando...' : 'Verificar Conexão Remota'}
                        </Button>
                        <p className="text-[10px] text-slate-400 text-center">
                            * Integração real deve substituir o mock `adminCheckServer` por `fetch('/api/health')` no AppContext.
                        </p>
                    </div>
                </div>

                {/* Data Cleaning */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><RefreshCw size={16} /> Otimização e Limpeza</h2>
                    <p className="text-[10px] text-slate-500 mb-2">Limpar logs de erro e liberar memória do navegador.</p>
                    
                    {isCleaning ? (
                         <div className="bg-yellow-50 p-2 rounded text-center">
                             <RefreshCw className="animate-spin text-yellow-600 mx-auto mb-1" size={16} />
                             <p className="text-xs font-bold text-yellow-800">Limpando erros e otimizando...</p>
                         </div>
                    ) : cleanResult ? (
                        <div className="bg-green-50 p-2 rounded text-center animate-in zoom-in">
                            <CheckCircle className="text-green-600 mx-auto mb-1" size={16} />
                            <p className="text-xs font-bold text-green-800">Limpeza Concluída!</p>
                            <p className="text-[9px] text-green-700">{cleanResult}</p>
                            <button onClick={() => setCleanResult(null)} className="text-[9px] underline mt-1 text-green-900">Fechar</button>
                        </div>
                    ) : (
                        <Button 
                            onClick={handleCleanSystem}
                            className="bg-orange-500 hover:bg-orange-600 py-2 text-xs"
                        >
                            LIMPAR DADOS LOCAIS E ERROS
                        </Button>
                    )}
                </div>

                {/* System Mode */}
                 <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Lock size={16} /> Modo de Manutenção</h2>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => adminSetSystemStatus('OPERATIONAL')} className={`flex-1 px-2 py-2 rounded text-[10px] font-bold transition-all ${systemStatus === 'OPERATIONAL' ? 'bg-green-500 text-white shadow' : 'text-slate-500'}`}>ONLINE</button>
                            <button onClick={() => adminSetSystemStatus('MAINTENANCE')} className={`flex-1 px-2 py-2 rounded text-[10px] font-bold transition-all ${systemStatus === 'MAINTENANCE' ? 'bg-red-500 text-white shadow' : 'text-slate-500'}`}>MANUTENÇÃO</button>
                    </div>
                 </div>
            </div>
        )}

      </div>

      {/* --- MODALS --- */}

      {/* Cancel Route Technical Modal */}
      {showCancelRouteModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-lg mb-4">
                      <AlertTriangle /> Cancelamento Técnico
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                      Isso cancelará a rota ID {showCancelRouteModal.id} para <strong>ambos</strong> (Cliente e Maloteiro) alegando "Problemas Técnicos". Notificações serão enviadas.
                  </p>
                  <div className="flex gap-2">
                      <Button variant="secondary" fullWidth onClick={() => setShowCancelRouteModal(null)}>Voltar</Button>
                      <Button variant="danger" fullWidth onClick={handleCancelRouteTechnical}>Confirmar Cancelamento</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Notify User Modal */}
      {showNotifyModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Enviar Notificação</h3>
                  <p className="text-xs text-slate-500 mb-4">Para: {showNotifyModal.name}</p>
                  
                  <div className="space-y-2 mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Textos Rápidos</p>
                      <div className="flex flex-wrap gap-2">
                          {quickTexts.map((text, idx) => (
                              <button key={idx} onClick={() => setNotifyMessage(text)} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 text-left">
                                  {text}
                              </button>
                          ))}
                      </div>
                  </div>

                  <textarea 
                      className="w-full border p-2 rounded text-sm mb-4 h-24" 
                      placeholder="Digite a mensagem..."
                      value={notifyMessage}
                      onChange={e => setNotifyMessage(e.target.value)}
                  />
                  
                  <div className="flex gap-2">
                      <Button variant="secondary" fullWidth onClick={closeModals}>Cancelar</Button>
                      <Button fullWidth onClick={handleSendNotification} className="bg-blue-600 hover:bg-blue-700">Enviar</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Edit/Add User Modal (Reused) */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {showEditModal ? <Edit size={20} className="text-blue-600"/> : <UserPlus size={20} className="text-brand-600" />} 
                        {showEditModal ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button onClick={closeModals}><XCircle className="text-slate-400" /></button>
                </div>
                
                {!showEditModal && (
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                        <button onClick={() => setFormUserType('COURIER')} className={`flex-1 py-1 text-xs font-bold rounded ${formUserType === 'COURIER' ? 'bg-white shadow' : 'text-slate-400'}`}>Maloteiro</button>
                        <button onClick={() => setFormUserType('CLIENT')} className={`flex-1 py-1 text-xs font-bold rounded ${formUserType === 'CLIENT' ? 'bg-white shadow' : 'text-slate-400'}`}>Cliente</button>
                        <button onClick={() => setFormUserType('ADMIN')} className={`flex-1 py-1 text-xs font-bold rounded ${formUserType === 'ADMIN' ? 'bg-white shadow' : 'text-slate-400'}`}>Admin</button>
                    </div>
                )}

                <form onSubmit={showEditModal ? handleSaveEdit : handleAddUser} className="space-y-3">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label><input className="w-full border p-2 rounded text-sm" value={formName} onChange={e => setFormName(e.target.value)} required /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp</label><input className="w-full border p-2 rounded text-sm" value={formPhone} onChange={e => setFormPhone(e.target.value)} required /></div>
                    
                    {/* Only show advanced edit fields if editing or manual add */}
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Login)</label><input className="w-full border p-2 rounded text-sm" value={formEmail} onChange={e => setFormEmail(e.target.value)} disabled={!showEditModal && !formEmail} /></div>
                    
                    {showEditModal && (
                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label><input className="w-full border p-2 rounded text-sm" value={formPassword} onChange={e => setFormPassword(e.target.value)} /></div>
                    )}

                    {(formUserType === 'COURIER' || (showEditModal && showEditModal.type === 'COURIER')) && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Veículo</label>
                                <select className="w-full border p-2 rounded text-sm" value={formVehicle} onChange={e => setFormVehicle(e.target.value)}>
                                    <option value="Moto">Moto</option>
                                    <option value="Carro">Carro</option>
                                    <option value="Bike">Bike</option>
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Placa</label><input className="w-full border p-2 rounded text-sm" value={formPlate} onChange={e => setFormPlate(e.target.value)} /></div>
                        </>
                    )}
                    
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label><input className="w-full border p-2 rounded text-sm" value={formAddress} onChange={e => setFormAddress(e.target.value)} /></div>

                    <div className="pt-2"><Button type="submit" fullWidth>{showEditModal ? 'Salvar Alterações' : 'Criar Usuário'}</Button></div>
                </form>
            </div>
        </div>
      )}

      {/* Created User Success */}
      {createdUserCreds && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-green-600" size={32} /></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Usuário Criado!</h3>
                  <div className="bg-slate-100 p-4 rounded-lg text-left mb-6 font-mono text-sm border border-slate-200">
                      <p className="mb-1">Login: <strong className="text-slate-900">{createdUserCreds.login}</strong></p>
                      <p>Senha: <strong className="text-slate-900">{createdUserCreds.pass}</strong></p>
                  </div>
                  <Button fullWidth onClick={() => handleWhatsAppShare(createdUserCreds.phone, `Bem-vindo! Login: ${createdUserCreds.login} Senha: ${createdUserCreds.pass}`)} className="bg-green-500 hover:bg-green-600 mb-2 flex items-center justify-center gap-2"><Send size={18} /> Enviar no WhatsApp</Button>
                  <Button fullWidth variant="secondary" onClick={() => setCreatedUserCreds(null)}>Fechar</Button>
              </div>
          </div>
      )}

    </div>
  );
};