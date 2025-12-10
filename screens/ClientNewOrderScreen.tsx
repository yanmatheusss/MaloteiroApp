import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { ArrowLeft, MapPin, Package, Calendar, Clock } from 'lucide-react';

export const ClientNewOrderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { createDelivery } = useApp();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) return alert('Preencha os endereços');
    
    if (isScheduled && (!scheduleDate || !scheduleTime)) return alert('Preencha data e hora do agendamento');

    const scheduledDateTime = isScheduled ? `${scheduleDate}T${scheduleTime}:00` : undefined;

    createDelivery(pickup, dropoff, notes, scheduledDateTime);
    navigate('/client/dashboard');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Nova Solicitação</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* Toggle Schedule */}
        <div className="bg-gray-100 p-1 rounded-lg flex">
             <button 
                type="button"
                onClick={() => setIsScheduled(false)}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isScheduled ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
             >
                Pedir Agora
             </button>
             <button 
                type="button"
                onClick={() => setIsScheduled(true)}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isScheduled ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`}
             >
                Agendar
             </button>
        </div>

        {isScheduled && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                    <Calendar size={16} /> Dados do Agendamento
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-purple-600 font-bold block mb-1">Data</label>
                        <input type="date" className="w-full p-2 rounded border border-purple-200 text-sm" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-purple-600 font-bold block mb-1">Hora</label>
                        <input type="time" className="w-full p-2 rounded border border-purple-200 text-sm" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Rota</h2>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <MapPin size={16} className="text-slate-400" /> Endereço de Coleta
                    </label>
                    <input 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                        placeholder="Ex: Av. Paulista, 1000 - São Paulo"
                        value={pickup}
                        onChange={e => setPickup(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <MapPin size={16} className="text-brand-500" /> Endereço de Entrega
                    </label>
                    <input 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                        placeholder="Ex: Rua A, 123 - Osasco"
                        value={dropoff}
                        onChange={e => setDropoff(e.target.value)}
                        required
                    />
                </div>
            </div>
        </div>

        <div className="space-y-4">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Detalhes</h2>
             
             <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Package size={16} className="text-slate-400" /> O que será enviado?
                </label>
                <textarea 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                    placeholder="Ex: Documentos, Caixa P, etc. (Obs opcionais)"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
            </div>
            
            <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                * O valor da entrega será calculado ou ofertado pelo Maloteiro assim que o pedido for visualizado.
            </p>
        </div>

        <Button type="submit" fullWidth className={`mt-4 ${isScheduled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isScheduled ? 'SOLICITAR AGENDAMENTO' : 'SOLICITAR COTAÇÃO'}
        </Button>

      </form>
    </div>
  );
};