import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { AppState, Delivery, UserProfile, DeliveryStatus, Location, UserStatus, Notification, TimelineEvent } from '../types';
import { MOCK_DELIVERIES, INITIAL_LOCATION, MOCK_USERS_REGISTRY } from '../constants';

interface LoginResult {
  success: boolean;
  message?: string;
}

interface ServerStatusResult {
    online: boolean;
    latency: number;
    message: string;
}

interface SystemHealthResult {
    errorsFound: number;
    memoryFreed: string;
    status: string;
}

interface AppContextType extends AppState {
  isNetworkOnline: boolean;
  systemStatus: 'OPERATIONAL' | 'MAINTENANCE';
  systemVersion: string;
  
  login: (email: string, pass: string, type: 'COURIER' | 'CLIENT' | 'ADMIN') => LoginResult;
  logout: () => void;
  
  // Ações Maloteiro
  toggleOnline: () => void;
  updatePricing: (baseFee: number, perKm: number) => void;
  proposePrice: (id: string, proposedPrice: number) => void; 
  refuseDelivery: (id: string) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  updateRoute: (id: string, newDistance: number, newTime: number) => void;
  updateLocation: (newLocation: Location) => void;
  updateProfile: (profile: UserProfile) => void;
  updateCredentials: (newLogin: string, newPass: string) => void;
  payFees: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void; 

  // Ações Cliente
  createDelivery: (pickup: string, dropoff: string, notes: string, scheduledDate?: string) => void;
  clientAcceptProposal: (deliveryId: string, accepted: boolean) => void;
  clientCancelDelivery: (deliveryId: string) => boolean;

  // Ações ADMIN
  adminAddUser: (user: UserProfile) => void;
  adminEditUser: (user: UserProfile) => void; // Nova função
  adminDeleteUser: (userId: string) => void;
  adminToggleStatus: (userId: string, newStatus: UserStatus) => void;
  adminCancelDelivery: (deliveryId: string, reason?: string) => void; // Atualizado com motivo
  adminSetSystemStatus: (status: 'OPERATIONAL' | 'MAINTENANCE') => void;
  adminUpdateDelivery: (delivery: Delivery) => void;
  adminCheckServer: () => Promise<ServerStatusResult>; // Nova
  adminCleanSystem: () => Promise<SystemHealthResult>; // Nova
  adminSendNotification: (userId: string, title: string, message: string) => void; // Nova
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Chave atualizada para garantir que usuários antigos/testes sejam limpos
const STORAGE_KEY_USERS = 'maloteiro_users_db_v1';
const STORAGE_KEY_DELIVERIES = 'maloteiro_deliveries_db_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Persistence Logic for Users
  const [usersRegistry, setUsersRegistry] = useState<UserProfile[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : MOCK_USERS_REGISTRY;
  });

  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEY_DELIVERIES);
      return saved ? JSON.parse(saved) : MOCK_DELIVERIES;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location>(INITIAL_LOCATION);
  const [refusedDeliveryIds, setRefusedDeliveryIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);
  const [systemStatus, setSystemStatus] = useState<'OPERATIONAL' | 'MAINTENANCE'>('OPERATIONAL');
  const systemVersion = "v4.5.0 (Admin Power)";

  // Save users whenever registry changes
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(usersRegistry));
  }, [usersRegistry]);

  // Save deliveries whenever they change
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_DELIVERIES, JSON.stringify(allDeliveries));
  }, [allDeliveries]);

  useEffect(() => {
      const handleOnline = () => setIsNetworkOnline(true);
      const handleOffline = () => setIsNetworkOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  const onlineCouriersCount = useMemo(() => {
    return usersRegistry.filter(u => u.type === 'COURIER' && u.isOnline && u.status === UserStatus.ACTIVE).length;
  }, [usersRegistry]);

  const availableDeliveries = allDeliveries.filter(d => 
    (d.status === DeliveryStatus.AVAILABLE || d.status === DeliveryStatus.PENDING_QUOTE || 
    (d.status === DeliveryStatus.WAITING_APPROVAL && d.courierId === user?.id)) && 
    !refusedDeliveryIds.includes(d.id) 
  );
  
  const myDeliveries = user?.type === 'COURIER' 
    ? allDeliveries.filter(d => d.courierId === user.id && (d.status !== DeliveryStatus.WAITING_APPROVAL && d.status !== DeliveryStatus.AVAILABLE && d.status !== DeliveryStatus.PENDING_QUOTE))
    : [];

  const myOrders = user?.type === 'CLIENT'
    ? allDeliveries.filter(d => d.customerId === user.id)
    : [];

  const addNotification = (userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') => {
      const newNotif: Notification = {
          id: Date.now().toString() + Math.random(),
          userId,
          title,
          message,
          date: new Date().toISOString(),
          read: false,
          type
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
      if (!user) return;
      setNotifications(prev => prev.map(n => n.userId === user.id ? { ...n, read: true } : n));
  };

  const login = (email: string, pass: string, type: 'COURIER' | 'CLIENT' | 'ADMIN'): LoginResult => {
    let foundUser = usersRegistry.find(u => u.email.toLowerCase() === email.toLowerCase() && u.type === type);

    // Removida lógica de criação automática. Agora só loga quem existe no registro.
    if (!foundUser) return { success: false, message: 'Usuário não encontrado. Contate o administrador.' };
    
    if (foundUser.password && foundUser.password !== pass) {
        // Master override senha admin (opcional, pode ser removido se quiser estrita segurança)
        if (pass !== 'admin' && foundUser.id !== 'admin-master') {
             return { success: false, message: 'Senha incorreta.' };
        }
        if (foundUser.id === 'admin-master' && pass !== 'admin') {
             return { success: false, message: 'Senha incorreta.' };
        }
    }

    if (foundUser.status === UserStatus.BLOCKED) return { success: false, message: 'Conta bloqueada. Contate o suporte.' };
    if (foundUser.status === UserStatus.OVERDUE && type === 'COURIER') return { success: false, message: 'Bloqueio Financeiro. Regularize suas taxas.' };
    if (foundUser.status === UserStatus.PENDING) return { success: false, message: 'Cadastro em análise.' };

    setUser(foundUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleOnline = () => {
    if (!user || user.type !== 'COURIER') return;
    const newStatus = !user.isOnline;
    setUser({ ...user, isOnline: newStatus });
    setUsersRegistry(prev => prev.map(u => u.id === user.id ? { ...u, isOnline: newStatus } : u));
  };

  const updatePricing = (baseFee: number, perKm: number) => {
    if (!user || user.type !== 'COURIER') return;
    const updatedUser = { ...user, pricing: { baseFee, perKm } };
    setUser(updatedUser);
    setUsersRegistry(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  const proposePrice = (id: string, proposedPrice: number) => {
    if (!user || user.type !== 'COURIER') return;
    setAllDeliveries(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: DeliveryStatus.WAITING_APPROVAL,
          price: proposedPrice, 
          courierId: user.id,
          courierName: user.name,
          courierPhone: user.phone,
          courierVehicle: user.vehicleType
        };
      }
      return d;
    }));
  };

  const clientAcceptProposal = (deliveryId: string, accepted: boolean) => {
      setAllDeliveries(prev => prev.map(d => {
          if (d.id === deliveryId) {
              if (accepted) {
                  if (d.courierId) {
                      addNotification(d.courierId, "Proposta Aceita! 🚀", `O cliente aprovou seu orçamento para a entrega em ${d.dropoff.address}. Prepare-se para coletar!`, "SUCCESS");
                  }
                  if (d.customerId) {
                      addNotification(d.customerId, "Rota Aprovada", `Você confirmou o serviço com o maloteiro ${d.courierName}.`, "SUCCESS");
                  }
                  
                  // Atualiza status e timeline
                  const newStatus = DeliveryStatus.ACCEPTED;
                  const newEvent: TimelineEvent = { status: newStatus, date: new Date().toISOString() };

                  return { ...d, status: newStatus, timeline: [...(d.timeline || []), newEvent] };
              } else {
                  return { 
                      ...d, 
                      status: d.isScheduled ? DeliveryStatus.PENDING_QUOTE : DeliveryStatus.AVAILABLE, 
                      courierId: undefined, 
                      courierName: undefined,
                      price: 0 
                  };
              }
          }
          return d;
      }));
  };

  const clientCancelDelivery = (deliveryId: string): boolean => {
      const delivery = allDeliveries.find(d => d.id === deliveryId);
      if (!delivery) return false;

      if (delivery.status === DeliveryStatus.TO_PICKUP || 
          delivery.status === DeliveryStatus.COLLECTED || 
          delivery.status === DeliveryStatus.DELIVERING || 
          delivery.status === DeliveryStatus.DELIVERED) {
          return false;
      }

      const created = new Date(delivery.date).getTime();
      const now = new Date().getTime();
      const diffHrs = (now - created) / (1000 * 60 * 60);

      if (diffHrs <= 1) {
          setAllDeliveries(prev => prev.map(d => {
              if (d.id === deliveryId) {
                  const newStatus = DeliveryStatus.CANCELLED;
                  const newEvent: TimelineEvent = { status: newStatus, date: new Date().toISOString() };
                  return { ...d, status: newStatus, timeline: [...(d.timeline || []), newEvent] };
              }
              return d;
          }));
          return true;
      }
      return false;
  };

  const payFees = () => {
      alert("Pagamento processado com sucesso! Seu saldo foi regularizado.");
  };

  const refuseDelivery = (id: string) => {
      setRefusedDeliveryIds(prev => [...prev, id]);
  };

  const createDelivery = (pickupAddr: string, dropoffAddr: string, notes: string, scheduledDate?: string) => {
    if (!user || user.type !== 'CLIENT') return;
    const isScheduled = !!scheduledDate;
    
    const estimatedMock = Math.floor(Math.random() * (45 - 20 + 1) + 20); 
    const nowISO = new Date().toISOString();
    const initialStatus = isScheduled ? DeliveryStatus.PENDING_QUOTE : DeliveryStatus.AVAILABLE;

    const newDelivery: Delivery = {
      id: Math.floor(Math.random() * 10000).toString(),
      pickup: { lat: -23.5505, lng: -46.6333, address: pickupAddr },
      dropoff: { lat: -23.5600, lng: -46.6400, address: dropoffAddr },
      distanceKm: 8.5,
      estimatedTimeMin: estimatedMock,
      price: 0, 
      date: nowISO,
      timeline: [{ status: initialStatus, date: nowISO }], // Inicializa Timeline
      isScheduled: isScheduled,
      scheduledDate: scheduledDate,
      region: "São Paulo",
      status: initialStatus,
      notes: notes,
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone
    };
    
    usersRegistry.forEach(u => {
        if (u.type === 'COURIER') {
            addNotification(
                u.id, 
                "Nova Entrega Disponível 📦", 
                `Nova solicitação na região: ${pickupAddr}. Verifique o painel para ofertar!`, 
                "INFO"
            );
        }
    });

    setAllDeliveries([newDelivery, ...allDeliveries]);
  };

  // ADMIN ACTIONS

  const adminAddUser = (newUser: UserProfile) => {
      setUsersRegistry(prev => [...prev, newUser]);
  };

  const adminEditUser = (updatedUser: UserProfile) => {
      setUsersRegistry(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const adminDeleteUser = (userId: string) => {
      // Protect super admin
      if(userId === 'admin-master') return;
      setUsersRegistry(prev => prev.filter(u => u.id !== userId));
  };

  const adminToggleStatus = (userId: string, newStatus: UserStatus) => {
      setUsersRegistry(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus, isOnline: newStatus === UserStatus.BLOCKED || newStatus === UserStatus.OVERDUE ? false : u.isOnline } : u
      ));
  };

  const adminCancelDelivery = (deliveryId: string, reason: string = "Cancelado pelo administrador") => {
      setAllDeliveries(prev => prev.map(d => {
        if (d.id === deliveryId) {
             const newStatus = DeliveryStatus.CANCELLED;
             
             // Notificar partes
             if(d.customerId) addNotification(d.customerId, "Entrega Cancelada", `Motivo: ${reason}`, "WARNING");
             if(d.courierId) addNotification(d.courierId, "Rota Cancelada", `Motivo: ${reason}`, "WARNING");

             return { 
                 ...d, 
                 status: newStatus, 
                 notes: `${d.notes ? d.notes + ' | ' : ''}[Admin]: ${reason}`,
                 timeline: [...(d.timeline||[]), { status: newStatus, date: new Date().toISOString()}] 
             };
        }
        return d;
      }));
  };

  const adminUpdateDelivery = (updatedDelivery: Delivery) => {
      setAllDeliveries(prev => prev.map(d => d.id === updatedDelivery.id ? updatedDelivery : d));
  };
  
  const adminSetSystemStatus = (status: 'OPERATIONAL' | 'MAINTENANCE') => {
      setSystemStatus(status);
  };

  const adminSendNotification = (userId: string, title: string, message: string) => {
      addNotification(userId, title, message, "INFO");
  };

  const adminCheckServer = async (): Promise<ServerStatusResult> => {
      // Simulação de ping
      return new Promise(resolve => {
          setTimeout(() => {
              const latency = Math.floor(Math.random() * 100) + 20;
              resolve({ online: true, latency, message: 'Servidor Conectado' });
          }, 1500);
      });
  };

  const adminCleanSystem = async (): Promise<SystemHealthResult> => {
      // Simulação de limpeza
      return new Promise(resolve => {
          setTimeout(() => {
              resolve({ errorsFound: 0, memoryFreed: '12.5 MB', status: 'Nenhum erro crítico. Logs limpos.' });
          }, 2000);
      });
  };

  const updateDeliveryStatus = (id: string, status: DeliveryStatus) => {
    setAllDeliveries(prev => prev.map(d => {
        if (d.id === id) {
            const updates: Partial<Delivery> = { status };
            const timestamp = new Date().toISOString();
            
            // Registra na timeline
            const timelineEvent: TimelineEvent = { status, date: timestamp };
            updates.timeline = [...(d.timeline || []), timelineEvent];

            // Notificação: Maloteiro indo coletar
            if (status === DeliveryStatus.TO_PICKUP) {
                addNotification(d.customerId, "Maloteiro a caminho da coleta", `O maloteiro ${d.courierName} iniciou a rota para retirar sua encomenda.`, "INFO");
            }

            if (status === DeliveryStatus.DELIVERING) {
                addNotification(d.customerId, "Sua encomenda está chegando!", `O maloteiro ${d.courierName} iniciou a entrega. Prepare-se para receber.`, "INFO");
            }
            
            if (status === DeliveryStatus.DELIVERED) {
                updates.platformFee = d.price * 0.025;
                addNotification(d.customerId, "Entrega Realizada!", `Seu pedido para ${d.dropoff.address} foi entregue com sucesso.`, "SUCCESS");
            }

            if (status === DeliveryStatus.CANCELLED && d.courierId && d.courierId === user?.id) {
                 addNotification(d.customerId, "Rota Cancelada", `O maloteiro precisou cancelar a rota no ponto de coleta.`, "WARNING");
            }

            return { ...d, ...updates };
        }
        return d;
    }));
  };

  const updateRoute = (id: string, newDistance: number, newTime: number) => {
    setAllDeliveries(prev => prev.map(d => d.id === id ? { ...d, distanceKm: newDistance, estimatedTimeMin: newTime } : d));
  };
  const updateLocation = (newLocation: Location) => setCurrentLocation(newLocation);
  
  const updateProfile = (profile: UserProfile) => {
      setUser(profile);
      setUsersRegistry(prev => prev.map(u => u.id === profile.id ? profile : u));
  };
  
  const updateCredentials = (newLogin: string, newPass: string) => {
      if(!user) return;
      const updatedUser = { ...user, email: newLogin, password: newPass };
      setUser(updatedUser);
      setUsersRegistry(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  return (
    <AppContext.Provider value={{
      user,
      usersRegistry,
      isAuthenticated,
      currentLocation,
      availableDeliveries, 
      myDeliveries,
      myOrders,
      notifications,
      onlineCouriersCount,
      isNetworkOnline,
      systemStatus,
      systemVersion,
      login,
      logout,
      toggleOnline,
      updatePricing,
      proposePrice,
      clientAcceptProposal,
      clientCancelDelivery,
      payFees,
      markNotificationRead,
      markAllNotificationsRead,
      refuseDelivery,
      updateDeliveryStatus,
      updateRoute,
      updateLocation,
      updateProfile,
      updateCredentials,
      createDelivery,
      adminAddUser,
      adminEditUser,
      adminDeleteUser,
      adminToggleStatus,
      adminCancelDelivery,
      adminSetSystemStatus,
      adminUpdateDelivery,
      adminCheckServer,
      adminCleanSystem,
      adminSendNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};