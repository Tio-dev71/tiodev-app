'use client';

import { useEffect, useState } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Eye, CheckCircle, Loader2 } from 'lucide-react';

interface Order {
  id: string; orderNumber: string; customerName: string; customerEmail: string;
  total: number; status: string; paymentMethod: string; affiliateCode: string | null;
  tradingViewUser: string | null;
  createdAt: string; items: Array<{ product: { name: string }; quantity: number; price: number }>;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  PAID: 'bg-emerald-500/20 text-emerald-400',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    try { const res = await fetch('/api/admin/orders'); if (res.ok) setOrders(await res.json()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      fetchOrders();
      if (selected?.id === orderId) setSelected({ ...selected!, status });
    } catch (e) { console.error(e); }
  }

  const filtered = statusFilter === 'ALL' ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Orders</h1><p className="text-white/40 text-sm">{orders.length} total orders</p></div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PAID', 'SHIPPED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'glass text-white/40 hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 glass rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center"><p className="text-white/30">No orders found</p></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-sm text-white/30 border-b border-white/5">
                <th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                    <td className="p-4 text-white font-mono text-xs">{o.orderNumber.slice(0, 12)}</td>
                    <td className="p-4"><div className="text-white">{o.customerName}</div><div className="text-white/30 text-xs">{o.customerEmail}</div></td>
                    <td className="p-4 text-white font-medium">{formatPrice(o.total)}</td>
                    <td className="p-4 text-white/40">{o.paymentMethod}</td>
                    <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[o.status] || 'bg-white/10 text-white/60'}`}>{o.status}</span></td>
                    <td className="p-4 text-white/40 text-xs">{formatDate(o.createdAt)}</td>
                    <td className="p-4 flex gap-1">
                      <button onClick={() => setSelected(o)} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg"><Eye className="w-4 h-4" /></button>
                      {o.status === 'PENDING' && <button onClick={() => updateStatus(o.id, 'PAID')} className="p-2 text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg" title="Mark as paid"><CheckCircle className="w-4 h-4" /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Order Details</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between"><span className="text-white/40">Order #</span><span className="text-white font-mono text-xs">{selected.orderNumber}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Customer</span><span className="text-white">{selected.customerName}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white">{selected.customerEmail}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Payment</span><span className="text-white">{selected.paymentMethod}</span></div>
              {selected.affiliateCode && <div className="flex justify-between"><span className="text-white/40">Affiliate</span><span className="text-primary-400">{selected.affiliateCode}</span></div>}
              {selected.tradingViewUser && <div className="flex justify-between"><span className="text-white/40">TradingView Username</span><span className="text-emerald-400 font-bold">{selected.tradingViewUser}</span></div>}
            </div>
            <div className="border-t border-white/5 pt-4 mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Items</h3>
              {selected.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1"><span className="text-white/60">{item.product.name} × {item.quantity}</span><span className="text-white">{formatPrice(item.price * item.quantity)}</span></div>
              ))}
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between"><span className="text-white font-semibold">Total</span><span className="text-white font-bold">{formatPrice(selected.total)}</span></div>
            <div className="mt-4 flex gap-2">
              {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selected.status === s ? 'bg-primary-600 text-white' : 'glass text-white/40 hover:text-white'}`}>{s}</button>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="w-full mt-4 py-2.5 glass text-white text-sm rounded-xl hover:bg-white/10 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
