
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { 
  X, Wallet, CreditCard, QrCode, Smartphone, 
  ShieldCheck, Loader2, CheckCircle2, Bitcoin, Copy, Share2
} from 'lucide-react';

interface PaymentGatewayProps {
  price: number;
  currency: string;
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ price, currency, language, onClose, onSuccess }) => {
  const t = translations[language];
  const [method, setMethod] = useState<'wechat' | 'alipay' | 'usdt' | 'usdc'>('wechat');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const cryptoAddress = "TX92...88jK0xPq92L"; // Mock USDT/USDC address
  const exchangeRate = 7.23; // Mock CNY to USD rate
  const cryptoPrice = method === 'usdt' || method === 'usdc' 
    ? (currency === 'CNY' ? price / exchangeRate : price).toFixed(2)
    : price;

  const handlePay = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 4000); // Longer duration for crypto "confirmation"
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cryptoAddress);
    alert("Address copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">{t.payment.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{t.payment.select}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">{t.payment.success}</h4>
              <p className="text-slate-400 text-xs">TxHash: 0x82...a9f2_signed</p>
            </div>
          ) : (
            <>
              {/* Price Display */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex justify-between items-center">
                <span className="text-slate-500 text-sm">{t.payment.price}</span>
                <span className="text-2xl font-black text-yellow-500 font-mono">
                  {method === 'usdt' || method === 'usdc' ? '' : (currency === 'USD' ? '$' : '¥')}
                  {cryptoPrice.toLocaleString()}
                  <span className="text-xs ml-1 uppercase">{method === 'usdt' || method === 'usdc' ? method : ''}</span>
                </span>
              </div>

              {/* Method Selector */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { id: 'wechat', icon: QrCode, label: t.payment.wechat, color: 'text-green-500' },
                  { id: 'alipay', icon: Smartphone, label: t.payment.alipay, color: 'text-blue-400' },
                  { id: 'usdt', icon: Bitcoin, label: t.payment.usdt, color: 'text-emerald-400' },
                  { id: 'usdc', icon: ShieldCheck, label: t.payment.usdc, color: 'text-blue-500' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as any)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                      ${method === m.id 
                        ? 'bg-blue-600/10 border-blue-500 shadow-lg' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
                    `}
                  >
                    <m.icon className={m.color} size={24} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${method === m.id ? 'text-white' : 'text-slate-500'}`}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Web3 View */}
              {(method === 'usdt' || method === 'usdc') && (
                <div className="mb-8 p-4 bg-slate-950 rounded-xl border border-slate-800 animate-fade-in">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{t.payment.walletAddr}</span>
                      <span className="text-[9px] text-emerald-500 uppercase font-bold">Network: TRC20 / ERC20</span>
                   </div>
                   <div className="flex gap-2">
                     <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 truncate">
                        {cryptoAddress}
                     </div>
                     <button onClick={copyToClipboard} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"><Copy size={14} /></button>
                   </div>
                   <div className="mt-4 flex justify-center">
                     <div className="bg-white p-2 rounded-lg">
                        <QrCode size={120} className="text-slate-900" />
                     </div>
                   </div>
                </div>
              )}

              {/* Summary & Pay */}
              <button
                onClick={handlePay}
                disabled={status === 'processing'}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all"
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {method === 'usdt' || method === 'usdc' ? t.payment.waiting : t.payment.securing}
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    {t.payment.payNow}
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest justify-center">
          <ShieldCheck size={14} className="text-emerald-500" />
          Secured by AI 360 Vault & Smart Contract V3
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
