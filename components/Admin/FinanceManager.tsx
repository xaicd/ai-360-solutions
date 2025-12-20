
import React, { useState, useEffect } from 'react';
import { Language, ProcurementOrder } from '../../types';
import { CreditCard, ShoppingCart, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';

interface FinanceManagerProps {
    language: Language;
}

export default function FinanceManager({ language }: FinanceManagerProps) {
    const [orders, setOrders] = useState<ProcurementOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'ledger'>('orders');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/finance/orders').then(r => r.json());
            if (res.success) setOrders(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <CreditCard className="text-green-400" /> Finance & Procurement
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold transition-colors">
                    <ShoppingCart size={16} /> New Order
                </button>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><DollarSign size={64} /></div>
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Total Spend (YTD)</div>
                    <div className="text-3xl font-black text-white">$142,500</div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Pending Orders</div>
                    <div className="text-3xl font-black text-yellow-400">{orders.filter(o => o.status === 'PENDING').length}</div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Completed</div>
                    <div className="text-3xl font-black text-green-400">{orders.filter(o => o.status === 'FULFILLED').length}</div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><FileText size={20} /> Procurement Orders</h3>
                </div>
                <table className="w-full text-left text-slate-400">
                    <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Order #</th>
                            <th className="px-6 py-4">Requester</th>
                            <th className="px-6 py-4">Resource Type</th>
                            <th className="px-6 py-4">Budget</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {orders.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No orders found.</td></tr>
                        ) : orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-mono text-white text-sm">{o.orderNumber}</td>
                                <td className="px-6 py-4">{(o as any).requesterName}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-700 rounded text-xs">{o.resourceType}</span></td>
                                <td className="px-6 py-4 text-white font-mono">${o.budget.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1 text-xs font-bold ${o.status === 'FULFILLED' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {o.status === 'FULFILLED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
