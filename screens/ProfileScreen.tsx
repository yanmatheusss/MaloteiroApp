import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { User, LogOut, Truck, MapPin, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile, updateCredentials, logout } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  const [formData, setFormData] = useState(user || {
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: 'Moto',
    activeRegions: [],
    availableDays: []
  });

  const [credData, setCredData] = useState({
      login: user?.email || '',
      password: user?.password || ''
  });

  if (!user) return null;

  const handleSave = () => {
    // @ts-ignore - simplified for demo
    updateProfile({ ...user, ...formData });
    setIsEditing(false);
  };

  const handleSaveCredentials = () => {
      if(!credData.login || !credData.password) return alert('Preencha os campos');
      updateCredentials(credData.login, credData.password);
      setIsChangingPass(false);
      alert('Credenciais atualizadas!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto">
      <div className={`p-8 pb-12 rounded-b-3xl mb-4 ${user.type === 'CLIENT' ? 'bg-blue-900' : 'bg-slate-900'} text-white relative`}>
        {/* Back Button */}
        <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
            <ArrowLeft size={24} />
        </button>

        <div className="flex items-center space-x-4 mt-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 ${user.type === 'CLIENT' ? 'bg-blue-500 border-blue-800' : 'bg-brand-500 border-slate-800'}`}>
             {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-slate-400 text-sm">
                {user.type === 'CLIENT' ? 'Cliente' : `${user.vehicleType} • ${user.activeRegions?.join(', ')}`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Credentials Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Lock size={20} className="text-slate-600"/> Acesso
                </h2>
                <button onClick={() => setIsChangingPass(!isChangingPass)} className="text-sm font-semibold text-slate-600">
                    {isChangingPass ? 'Cancelar' : 'Alterar Senha'}
                </button>
            </div>
            
            <div className="space-y-4">
                 <div>
                    <label className="text-xs text-slate-500 uppercase block mb-1">Login</label>
                    <input 
                        disabled={!isChangingPass}
                        value={credData.login}
                        onChange={e => setCredData({...credData, login: e.target.value})}
                        className="w-full p-2 bg-white border border-gray-200 rounded disabled:border-transparent disabled:p-0 disabled:text-slate-800 font-medium font-mono"
                    />
                </div>
                 <div>
                    <label className="text-xs text-slate-500 uppercase block mb-1">Senha</label>
                    <input 
                        disabled={!isChangingPass}
                        value={credData.password}
                        onChange={e => setCredData({...credData, password: e.target.value})}
                        type={isChangingPass ? "text" : "password"}
                        className="w-full p-2 bg-white border border-gray-200 rounded disabled:border-transparent disabled:p-0 disabled:text-slate-800 font-medium font-mono"
                    />
                </div>
                 {isChangingPass && (
                    <Button fullWidth onClick={handleSaveCredentials} className="mt-2 py-2 text-sm bg-slate-800">Atualizar Acesso</Button>
                 )}
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <User size={20} className={user.type === 'CLIENT' ? 'text-blue-600' : 'text-brand-600'}/> Dados Pessoais
            </h2>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className={`text-sm font-semibold ${user.type === 'CLIENT' ? 'text-blue-600' : 'text-brand-600'}`}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase block mb-1">Nome</label>
              <input 
                disabled={!isEditing}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 bg-white border border-gray-200 rounded disabled:border-transparent disabled:p-0 disabled:text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase block mb-1">Telefone</label>
              <input 
                disabled={!isEditing}
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 bg-white border border-gray-200 rounded disabled:border-transparent disabled:p-0 disabled:text-slate-800 font-medium"
              />
            </div>
             <div>
              <label className="text-xs text-slate-500 uppercase block mb-1">Endereço Principal</label>
              <div className="relative">
                  <input 
                    disabled={!isEditing}
                    value={formData.address || ''}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full p-2 bg-white border border-gray-200 rounded disabled:border-transparent disabled:p-0 disabled:text-slate-800 font-medium pl-8"
                  />
                  <MapPin size={16} className="absolute left-0 top-2 text-slate-400" />
              </div>
            </div>
            
            {isEditing && (
              <Button fullWidth onClick={handleSave} className={`mt-2 py-2 text-sm ${user.type === 'CLIENT' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>Salvar Alterações</Button>
            )}
          </div>
        </div>

        {user.type === 'COURIER' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <Truck size={20} className="text-brand-600"/> Veículo & Região
            </h2>
            <div className="space-y-4">
                <div>
                <label className="text-xs text-slate-500 uppercase block mb-1">Veículo</label>
                {isEditing ? (
                    <select 
                        value={formData.vehicleType}
                        // @ts-ignore
                        onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                        className="w-full p-2 bg-white rounded border border-gray-200"
                    >
                        <option value="Moto">Moto</option>
                        <option value="Carro">Carro</option>
                        <option value="Bike">Bike</option>
                    </select>
                ) : (
                    <p className="font-medium">{user.vehicleType}</p>
                )}
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase block mb-1">Regiões Ativas</label>
                    <div className="flex flex-wrap gap-2">
                        {user.activeRegions?.map(r => (
                            <span key={r} className="bg-gray-100 text-slate-700 px-2 py-1 rounded text-sm">{r}</span>
                        ))}
                    </div>
                </div>
            </div>
            </div>
        )}

        <Button 
          variant="secondary" 
          fullWidth 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
        >
          <LogOut size={18} />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};