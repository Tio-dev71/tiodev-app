'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalAffiliates: number;
  recentOrders: Array<{ id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Revenue', value: data ? formatPrice(data.totalRevenue) : '$0', icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Orders', value: data?.totalOrders ?? 0, icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
    { label: 'Products', value: data?.totalProducts ?? 0, icon: Package, color: 'from-purple-500 to-purple-600' },
    { label: 'Affiliates', value: data?.totalAffiliates ?? 0, icon: Users, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-white/40 text-sm">Overview of your store performance</p></div>
        <div className="flex items-center gap-2 text-sm text-white/30"><TrendingUp className="w-4 h-4" /> Live</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}><stat.icon className="w-6 h-6 text-white" /></div>
            </div>
            <div className="text-2xl font-bold text-white">{loading ? '—' : stat.value}</div>
            <div className="text-sm text-white/40 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}</div>
        ) : data?.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-sm text-white/30 border-b border-white/5">
                <th className="pb-3 pr-4">Order</th><th className="pb-3 pr-4">Customer</th><th className="pb-3 pr-4">Total</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Date</th>
              </tr></thead>
              <tbody>
                {data.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 text-sm">
                    <td className="py-3 pr-4 text-white font-mono text-xs">{order.orderNumber.slice(0, 12)}...</td>
                    <td className="py-3 pr-4 text-white/70">{order.customerName}</td>
                    <td className="py-3 pr-4 text-white font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${order.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : order.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/60'}`}>{order.status}</span></td>
                    <td className="py-3 text-white/40 text-xs">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white/30 text-sm py-8 text-center">No orders yet. They will appear here once customers make purchases.</p>
        )}
      </div>
    </div>
  );
}
