import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DeliveryStatus } from '../types';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/Button';

export const FinancialScreen: React.FC = () => {
  const { myDeliveries, payFees } = useApp();
  const navigate = useNavigate();

  // Filtrar apenas entregas finalizadas
  const completedDeliveries = myDeliveries.filter(d => d.status === DeliveryStatus.DELIVERED);
  // Cancelamentos
  const cancelledDeliveries = myDeliveries.filter(d => d.status === DeliveryStatus.CANCELLED);

  // Cálculos
  const totalGross = completedDeliveries.reduce((acc, curr) => acc + curr.price, 0);
  const totalFees = completedDeliveries.reduce((acc, curr) => acc + (curr.platformFee || 0), 0);
  const totalNet = totalGross - totalFees;
  
  const pendingFees = totalFees; 

  const today = new Date().toISOString().split('T')[0];
  const earningsToday = completedDeliveries
    .filter(d => d.date.startsWith(today))
    .reduce((acc, curr) => acc + (curr.price - (curr.platformFee || 0)), 0);

  const extractItems = [...completedDeliveries, ...cancelledDeliveries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-slate-900 p-6 pt-8 pb-24 rounded-b-3xl text-white shadow-lg relative z-0">
        <div className="flex items-center gap-3 mb-6">
             <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <ArrowLeft size={20} />
             </button>
             <h1 className="text-xl font-bold">Financeiro</h1>
        </div>

        <div className="mb-4">
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider block mb-1">Saldo Líquido Total</span>
            <div className="flex items-center gap-1">
                <span className="text-5xl font-bold text-green-400">{formatCurrency(totalNet)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 bg-white/5 p-1 rounded w-fit">
                <AlertCircle size={10} /> Já descontado a taxa de 2.5% do app
            </p>
        </div>
      </div>

      <div className="px-4 -mt-16 flex flex-col gap-3 relative z-10">
          <div className="flex gap-3">
            <div className="flex-1 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase font-bold mb-1">Hoje</span>
                <span className="text-xl font-bold text-slate-800">{formatCurrency(earningsToday)}</span>
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center border-l-4 border-l-red-500">
                <span className="text-xs text-slate-400 uppercase font-bold mb-1">Taxas Pendentes</span>
                <span className="text-xl font-bold text-red-500">{formatCurrency(pendingFees)}</span>
            </div>
          </div>
          
          <Button 
            fullWidth 
            onClick={payFees} 
            className="bg-brand-600 hover:bg-brand-700 shadow-md py-4 text-sm flex items-center justify-center gap-2"
          >
              <DollarSign size={18} /> PAGAR TAXAS ({formatCurrency(pendingFees)})
          </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto mt-2">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
            <TrendingUp size={16} /> Extrato de Atividades
        </h3>

        <div className="space-y-3 pb-6">
            {extractItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <DollarSign size={48} className="mx-auto mb-2 opacity-20"/>
                    <p>Nenhuma atividade registrada.</p>
                </div>
            ) : (
                extractItems.map(delivery => {
                    const isCancelled = delivery.status === DeliveryStatus.CANCELLED;
                    return (
                        <div key={delivery.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center ${isCancelled ? 'border-red-100 bg-red-50/20' : 'border-gray-100'}`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {isCancelled ? <XCircle size={14} className="text-red-500"/> : <CheckCircle size={14} className="text-green-500"/>}
                                    <p className={`font-bold text-sm ${isCancelled ? 'text-red-700' : 'text-slate-800'}`}>
                                        {isCancelled ? 'Entrega Cancelada' : delivery.dropoff.address}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(delivery.date).toLocaleDateString()} • ID #{delivery.id}
                                </p>
                            </div>
                            <div className="text-right">
                                {isCancelled ? (
                                    <>
                                        <span className="block font-bold text-slate-400 line-through text-xs">{formatCurrency(delivery.price)}</span>
                                        <span className="block text-[10px] text-red-500 font-bold uppercase">Cancelado</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="block font-bold text-green-600">+ {formatCurrency(delivery.price)}</span>
                                        <span className="block text-[10px] text-red-400 font-medium">Taxa (2.5%): -{formatCurrency(delivery.platformFee || 0)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
};