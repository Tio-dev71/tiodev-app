'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ImageIcon, Upload, Eye, EyeOff, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string; name: string; slug: string; description: string; price: number;
  image: string; category: string | null; featured: boolean; active: boolean;
  downloadLink: string | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '', category: '', featured: false, downloadLink: '' });

  useEffect(() => { fetchProducts(); }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', price: '', image: '', category: '', featured: false, downloadLink: '' });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price.toString(), image: p.image, category: p.category || '', featured: p.featured, downloadLink: p.downloadLink || '' });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: parseFloat(form.price), downloadLink: form.downloadLink || null }) });
      if (res.ok) {
        setShowModal(false);
        fetchProducts();
        setToast({ message: editing ? 'Product updated successfully!' : 'Product created successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to save product', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setToast({ message: 'An error occurred', type: 'error' });
    }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchProducts();
      setToast({ message: 'Product deleted', type: 'success' });
    }
    catch (e) { console.error(e); }
  }

  async function handleToggleActive(p: Product) {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, active: !p.active }),
      });
      if (res.ok) {
        fetchProducts();
        setToast({ message: `Product ${!p.active ? 'activated' : 'deactivated'}`, type: 'success' });
      }
    } catch (e) { console.error(e); }
  }

  async function handleToggleFeatured(p: Product) {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, featured: !p.featured }),
      });
      if (res.ok) {
        fetchProducts();
        setToast({ message: `Product ${!p.featured ? 'featured' : 'unfeatured'}`, type: 'success' });
      }
    } catch (e) { console.error(e); }
  }

  // Image upload handlers
  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image: data.url }));
        setToast({ message: 'Image uploaded!', type: 'success' });
      } else {
        const err = await res.json();
        setToast({ message: err.error || 'Upload failed', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Upload failed', type: 'error' });
    }
    finally { setUploading(false); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all animate-[slideIn_0.3s_ease] ${
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Products</h1><p className="text-white/40 text-sm">Manage your product catalog</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-500 transition-colors" id="add-product-btn"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 glass rounded-xl animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center"><ImageIcon className="w-12 h-12 text-white/10 mx-auto mb-4" /><h3 className="text-lg font-semibold text-white mb-2">No products yet</h3><p className="text-white/40 text-sm mb-4">Add your first product to get started</p><button onClick={openCreate} className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl"><Plus className="w-4 h-4 inline mr-1" /> Add Product</button></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-sm text-white/30 border-b border-white/5"><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Category</th><th className="p-4">Featured</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-white/10 m-auto mt-2.5" />}
                      </div>
                      <div className="text-white text-sm font-medium line-clamp-1 max-w-[200px]">{p.name}</div>
                    </td>
                    <td className="p-4 text-white font-medium text-sm">{formatPrice(p.price)}</td>
                    <td className="p-4 text-white/40 text-sm">{p.category || '—'}</td>
                    <td className="p-4">
                      <button onClick={() => handleToggleFeatured(p)} className={`p-1.5 rounded-lg transition-colors ${p.featured ? 'text-amber-400 bg-amber-500/10' : 'text-white/20 hover:text-white/40'}`}>
                        <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleToggleActive(p)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${p.active ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                        {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-white">{editing ? 'Edit Product' : 'Add Product'}</h2><button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm text-white/40 mb-1 block">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
              <div><label className="text-sm text-white/40 mb-1 block">Description *</label><textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-white/40 mb-1 block">Price ($) *</label><input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
                <div><label className="text-sm text-white/40 mb-1 block">Category</label><input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="Trading, Tools..." /></div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="text-sm text-white/40 mb-2 block">Product Image</label>

                {/* Image Preview */}
                {form.image && (
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-white/10">
                    <img src={form.image} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setForm({...form, image: ''})} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white/60 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Drag & Drop Zone */}
                {!form.image && (
                  <div
                    className={`dropzone ${dragActive ? 'active' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                        <span className="text-sm text-white/40">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white/20" />
                        <span className="text-sm text-white/40">Drop image here or click to browse</span>
                        <span className="text-xs text-white/20">JPEG, PNG, WebP • Max 5MB</span>
                      </div>
                    )}
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                {/* Or paste URL */}
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-white/20">or paste URL</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/40 mb-1 block">Download Link</label>
                <input
                  value={form.downloadLink}
                  onChange={e => setForm({...form, downloadLink: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="https://download.yourapp.com/file.exe"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" /><span className="text-sm text-white/60">Featured product</span></label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
