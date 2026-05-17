'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu, X, BarChart3, BookOpen } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
  { href: '/admin/affiliates', icon: Users, label: 'Affiliates' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === '/admin/login') return null;

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)} className="md:hidden fixed top-4 left-4 z-50 p-2.5 glass rounded-xl text-white">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-surface-900/95 backdrop-blur-xl border-r border-white/5 z-40 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">T</div>
            <div><div className="text-white font-semibold text-sm">Tiodev</div><div className="text-white/30 text-xs">Admin Panel</div></div>
          </Link>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-600/20 text-primary-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all mb-1">
            <BarChart3 className="w-5 h-5" /> View Site
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
