import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Truck, ShoppingBag, ShieldCheck, ChevronRight, MessageCircle, AlertCircle } from 'lucide-react';

// Componente de Onboarding (Mantido igual)
const Onboarding: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Bem-vindo ao Maloteiro",
            desc: "A revolução na logística rápida. Conectamos quem precisa enviar a quem pode levar.",
            icon: <Truck size={64} className="text-brand-500 mb-4" />
        },
        {
            title: "Renda Extra ou Principal",
            desc: "Defina seus preços, escolha suas regiões e trabalhe nos horários que preferir.",
            icon: <DollarSignIcon size={64} />
        },
        {
            title: "Segurança e Agilidade",
            desc: "Monitore suas entregas e tenha controle total sobre suas rotas.",
            icon: <ShieldCheck size={64} className="text-blue-500 mb-4" />
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1);
        else onFinish();
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="animate-bounce-slow">
                    {steps[step].icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{steps[step].title}</h2>
                <p className="text-slate-500">{steps[step].desc}</p>
            </div>
            
            <div className="w-full">
                <div className="flex justify-center gap-2 mb-6">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-brand-600' : 'w-2 bg-slate-200'}`} />
                    ))}
                </div>
                <Button fullWidth onClick={handleNext}>
                    {step === steps.length - 1 ? 'Começar Agora' : 'Próximo'}
                </Button>
            </div>
        </div>
    );
};

// Helper Icon
const DollarSignIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mb-4"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

export const LoginScreen: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'COURIER' | 'CLIENT' | 'ADMIN'>('COURIER');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { login } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
      const hasSeen = localStorage.getItem('maloteiro_onboarding');
      if (hasSeen) setShowOnboarding(false);
  }, []);

  const finishOnboarding = () => {
      localStorage.setItem('maloteiro_onboarding', 'true');
      setShowOnboarding(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    // Admin Override for testing ease (kept for development convenience, but fields are not saved)
    if (userType === 'COURIER' && email === 'ADMIN' && password === 'ADMIN') {
        login('ADMIN', 'ADMIN', 'COURIER');
        navigate('/dashboard');
        return;
    }
    
    const result = login(email, password, userType);
    if (result.success) {
        if (userType === 'ADMIN') navigate('/admin/dashboard');
        else if (userType === 'CLIENT') navigate('/client/dashboard');
        else navigate('/dashboard');
    } else {
        setErrorMsg(result.message || "Erro desconhecido");
    }
  };

  const handleRegister = () => {
      window.open('https://wa.me/5511999999999?text=Olá, gostaria de me cadastrar no App Maloteiro.', '_blank');
  };

  const getTypeIcon = () => {
      switch(userType) {
          case 'COURIER': return <Truck size={48} className="text-white" />;
          case 'CLIENT': return <ShoppingBag size={48} className="text-white" />;
          case 'ADMIN': return <ShieldCheck size={48} className="text-white" />;
      }
  };

  const getBgColor = () => {
      switch(userType) {
          case 'COURIER': return 'bg-slate-900';
          case 'CLIENT': return 'bg-blue-900';
          case 'ADMIN': return 'bg-gray-800';
      }
  };

  if (showOnboarding) {
      return <Onboarding onFinish={finishOnboarding} />;
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-500 ${getBgColor()} text-white animate-in slide-in-from-bottom-10 fade-in duration-700`}>
      <div className="mb-8 flex flex-col items-center">
        <div className={`p-4 rounded-full mb-4 shadow-lg transition-colors bg-white/10`}>
          {getTypeIcon()}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">MALOTEIRO</h1>
        <p className="text-slate-400 mt-2 text-center text-sm">
            {userType === 'COURIER' && 'App exclusivo para parceiros'}
            {userType === 'CLIENT' && 'Cadastre suas entregas'}
            {userType === 'ADMIN' && 'Gestão do Sistema'}
        </p>
      </div>

      <div className="bg-black/20 p-1 rounded-lg flex mb-8 w-full max-w-sm">
        <button 
            type="button"
            onClick={() => setUserType('COURIER')}
            className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${userType === 'COURIER' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
            MALOTEIRO
        </button>
        <button 
             type="button"
            onClick={() => setUserType('CLIENT')}
            className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${userType === 'CLIENT' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
            CLIENTE
        </button>
        <button 
             type="button"
            onClick={() => setUserType('ADMIN')}
            className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${userType === 'ADMIN' ? 'bg-gray-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
            ADMIN
        </button>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Login / Email</label>
          <input
            type="text"
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-white/20 outline-none text-lg placeholder:text-slate-500/60"
            placeholder={userType === 'COURIER' ? "seu.email@exemplo.com" : (userType === 'CLIENT' ? "empresa@email.com" : "admin")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <input
                type="password"
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-white/20 outline-none text-lg placeholder:text-slate-500/60"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>

        {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-200 text-sm">
                <AlertCircle size={16} className="text-red-400" />
                {errorMsg}
            </div>
        )}

        <Button type="submit" fullWidth className={`mt-8 ${userType === 'CLIENT' ? 'bg-blue-600 hover:bg-blue-700' : (userType === 'ADMIN' ? 'bg-gray-600 hover:bg-gray-700' : '')}`}>
          ENTRAR
        </Button>
      </form>

      {userType !== 'ADMIN' && (
          <button 
            onClick={handleRegister}
            className="mt-8 flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
              <MessageCircle size={16} />
              Quero me cadastrar
          </button>
      )}
    </div>
  );
};