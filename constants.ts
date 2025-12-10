import { Delivery, DeliveryStatus, UserProfile, UserStatus } from './types';

// Usuário padrão removido, mantendo estrutura apenas para tipagem se necessário, 
// mas o registro oficial agora começa apenas com o ADMIN.

export const MOCK_USERS_REGISTRY: UserProfile[] = [
    {
        id: 'admin-master',
        name: 'Super Administrator',
        email: 'admin',
        password: 'admin', // Login inicial obrigatório
        phone: '(11) 90000-0000',
        type: 'ADMIN',
        status: UserStatus.ACTIVE
    }
];

export const INITIAL_LOCATION = {
  lat: -23.55052,
  lng: -46.633308,
  address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
};

export const MOCK_DELIVERIES: Delivery[] = [];
// Nenhuma entrega mockada inicial. O sistema começa limpo.
