export enum DeliveryStatus {
  AVAILABLE = 'AVAILABLE', // Disponível na lista
  PENDING_QUOTE = 'PENDING_QUOTE', // Aguardando cotação/negociação inicial
  WAITING_APPROVAL = 'WAITING_APPROVAL', // Maloteiro deu o preço, cliente precisa aceitar
  ACCEPTED = 'ACCEPTED', // Cliente aceitou, entrou na rota
  TO_PICKUP = 'TO_PICKUP',
  COLLECTED = 'COLLECTED',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  OVERDUE = 'OVERDUE' // Inadimplente (Bloqueado financeiramente)
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
}

export interface TimelineEvent {
  status: DeliveryStatus;
  date: string; // ISO String
}

export interface Delivery {
  id: string;
  pickup: Location;
  dropoff: Location;
  distanceKm: number;
  estimatedTimeMin: number;
  price: number; 
  platformFee?: number; // Taxa de 2.5% do app
  date: string; 
  
  // Histórico de mudanças de status
  timeline: TimelineEvent[];

  isScheduled: boolean;
  scheduledDate?: string; 
  
  region: string;
  status: DeliveryStatus;
  notes?: string;
  
  customerId: string;
  customerName: string;
  customerPhone: string;
  
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehicle?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address?: string; 
  type: 'COURIER' | 'CLIENT' | 'ADMIN';
  status: UserStatus;
  
  city?: string;
  addressSupplement?: string;
  plate?: string;
  
  vehicleType?: 'Moto' | 'Carro' | 'Bike';
  activeRegions?: string[];
  isOnline?: boolean;
  pricing?: {
    baseFee: number;
    perKm: number;
  };
}

export interface AppState {
  user: UserProfile | null;
  usersRegistry: UserProfile[]; 
  isAuthenticated: boolean;
  currentLocation: Location;
  availableDeliveries: Delivery[];
  myDeliveries: Delivery[];
  myOrders: Delivery[];
  notifications: Notification[];
  onlineCouriersCount: number;
}