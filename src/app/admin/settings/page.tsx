'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, CheckCircle2, Plus, Trash2, Link as LinkIcon, Download } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label?: string;
}

const DEFAULT_SETTINGS: Setting[] = [
  { key: '9meta_download_url', value: '', label: 'Link tải xuống 9Meta' },
  { key: '9meta_download_url_mac', value: '', label: 'Link tải 9Meta (Mac)' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        // Merge with defaults to ensure all default keys exist
        const merged = [...DEFAULT_SETTINGS];
        for (const setting of data) {
          const idx = merged.findIndex((s) => s.key === setting.key);
          if (idx >= 0) {
            merged[idx] = setting;
          } else {
            merged.push(setting);
          }
        }
        setSettings(merged);
      }
    } catch {
      setError('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settings.filter((s) => s.value.trim()) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Lưu thất bại');
      }
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  }

  function addCustomSetting() {
    const key = `custom_${Date.now()}`;
    setSettings((prev) => [...prev, { key, value: '', label: '' }]);
  }

  function removeSetting(key: string) {
    setSettings((prev) => prev.filter((s) => s.key !== key));
  }

  function updateLabel(key: string, label: string) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, label } : s)));
  }

  const getIconForKey = (key: string) => {
    if (key.includes('download')) return <Download className="w-4 h-4" />;
    if (key.includes('url') || key.includes('link')) return <LinkIcon className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
          <p className="text-white/40 text-sm">Quản lý các cài đặt chung của website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Download Links Section */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary-400" />
          Link tải ứng dụng
        </h2>
        <p className="text-white/30 text-sm mb-6">
          Cài đặt link tải xuống cho ứng dụng 9Meta (hiển thị trên trang thanh toán thành công)
        </p>

        <div className="space-y-4">
          {settings
            .filter((s) => DEFAULT_SETTINGS.some((d) => d.key === s.key))
            .map((setting) => (
              <div key={setting.key} className="space-y-1.5">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  {getIconForKey(setting.key)}
                  {setting.label || setting.key}
                </label>
                <input
                  type="url"
                  value={setting.value}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  placeholder="https://example.com/download/..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm font-mono"
                />
                <p className="text-white/20 text-xs">
                  Key: <code className="bg-white/5 px-1.5 py-0.5 rounded">{setting.key}</code>
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Custom Settings Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" />
              Cài đặt tùy chỉnh
            </h2>
            <p className="text-white/30 text-sm">Thêm các cài đặt key-value tùy chỉnh</p>
          </div>
          <button
            onClick={addCustomSetting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-white/60 rounded-xl text-sm hover:bg-white/10 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>

        <div className="space-y-4">
          {settings
            .filter((s) => !DEFAULT_SETTINGS.some((d) => d.key === s.key))
            .map((setting) => (
              <div key={setting.key} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={setting.label || ''}
                    onChange={(e) => updateLabel(setting.key, e.target.value)}
                    placeholder="Tên hiển thị..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                  />
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    placeholder="Giá trị..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>
                <button
                  onClick={() => removeSetting(setting.key)}
                  className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

          {settings.filter((s) => !DEFAULT_SETTINGS.some((d) => d.key === s.key)).length === 0 && (
            <p className="text-white/20 text-sm text-center py-4">Chưa có cài đặt tùy chỉnh nào</p>
          )}
        </div>
      </div>
    </div>
  );
}
