'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Loader2, Copy, Check, Trash2, Link as LinkIcon } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Affiliate {
  id: string; code: string; name: string; email: string;
  discountPercent: number; commissionRate: number; active: boolean;
  _count?: { orders: number }; totalRevenue?: number;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');
  const [form, setForm] = useState({ name: '', email: '', code: '', discountPercent: '10', commissionRate: '5' });

  useEffect(() => { fetchAffiliates(); }, []);

  async function fetchAffiliates() {
    try { const res = await fetch('/api/admin/affiliates'); if (res.ok) setAffiliates(await res.json()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/affiliates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, discountPercent: parseFloat(form.discountPercent), commissionRate: parseFloat(form.commissionRate) }) });
      if (res.ok) { setShowModal(false); setForm({ name: '', email: '', code: '', discountPercent: '10', commissionRate: '5' }); fetchAffiliates(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}/store?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(`link-${code}`);
    setTimeout(() => setCopied(''), 2000);
  }

  function copy9MetaLink(code: string) {
    const url = `${window.location.origin}/pricing?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(`9meta-${code}`);
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa mã affiliate này?')) return;
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchAffiliates();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Affiliates</h1><p className="text-white/40 text-sm">Manage affiliate codes and track performance</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-500 transition-colors" id="add-affiliate-btn"><Plus className="w-4 h-4" /> Create Code</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 glass rounded-xl animate-pulse" />)}</div>
      ) : affiliates.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center"><p className="text-white/30 mb-4">No affiliate codes yet</p><button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl"><Plus className="w-4 h-4 inline mr-1" /> Create Code</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {affiliates.map(a => (
            <div key={a.id} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-mono text-primary-400">{a.code}</span>
                  <button onClick={() => copyCode(a.code)} className="text-white/20 hover:text-white transition-colors" title="Copy code">
                    {copied === a.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyLink(a.code)} className="text-white/20 hover:text-white transition-colors" title="Copy Store link">
                    {copied === `link-${a.code}` ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copy9MetaLink(a.code)} className="text-white/20 hover:text-white transition-colors" title="Copy 9Meta link">
                    {copied === `9meta-${a.code}` ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="text-xs font-bold font-mono px-1 rounded bg-white/10">9M</span>}
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-white/20 hover:text-red-400 transition-colors" title="Xóa mã này">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{a.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="text-sm text-white mb-1">{a.name}</div>
              <div className="text-xs text-white/30 mb-4">{a.email}</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="glass rounded-xl p-3"><div className="text-lg font-bold text-white">{a.discountPercent}%</div><div className="text-xs text-white/30">Discount</div></div>
                <div className="glass rounded-xl p-3"><div className="text-lg font-bold text-white">{a._count?.orders ?? 0}</div><div className="text-xs text-white/30">Orders</div></div>
                <div className="glass rounded-xl p-3"><div className="text-lg font-bold text-emerald-400">{formatPrice(a.totalRevenue ?? 0)}</div><div className="text-xs text-white/30">Revenue</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-white">Create Affiliate Code</h2><button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="text-sm text-white/40 mb-1 block">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
              <div><label className="text-sm text-white/40 mb-1 block">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
              <div><label className="text-sm text-white/40 mb-1 block">Code (auto-generated if empty)</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="AUTO" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-white/40 mb-1 block">Discount %</label><input type="number" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
                <div><label className="text-sm text-white/40 mb-1 block">Commission %</label><input type="number" value={form.commissionRate} onChange={e => setForm({...form, commissionRate: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-500 disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
