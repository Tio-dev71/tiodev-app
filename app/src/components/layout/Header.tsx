'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Languages, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/store', key: 'store' },
  { href: '/pricing', key: 'pricing' },
  { href: '/blog', key: 'blog' },
] as const;

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const { locale, setLocale, t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Don't render admin header
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const itemCount = mounted ? getItemCount() : 0;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'glass-strong py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <Image
                className="w-full h-full rounded-2xl"
                src="/tiodevlogo.png"
                alt="Tiodev"
                width={200}
                height={200}
              />
            </div>
            <span className="text-lg font-semibold text-white hidden sm:block">
              Tio<span className="text-primary-400">dev</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const label = t.nav[link.key];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300"
              id="language-toggle"
            >
              <Languages className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">{locale}</span>
            </button>

            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
              id="cart-button"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* User Auth Button */}
            {mounted && !authLoading && (
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated && user ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all duration-300"
                      id="user-menu-toggle"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm text-white/70 max-w-[100px] truncate">
                        {user.name}
                      </span>
                    </button>

                    {/* User dropdown menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl p-2 shadow-2xl shadow-black/40"
                        >
                          {/* User info */}
                          <div className="px-3 py-2.5 mb-1 border-b border-white/5">
                            <p className="text-sm text-white font-medium truncate">{user.name}</p>
                            <p className="text-xs text-white/30 truncate">{user.email}</p>
                          </div>

                          <Link
                            href="/account"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>

                          <Link
                            href="/account"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <User className="w-4 h-4" />
                            Tài khoản
                          </Link>

                          <div className="border-t border-white/5 mt-1 pt-1">
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                // Logout will be handled by the page
                                localStorage.removeItem('sub_token');
                                localStorage.removeItem('sub_user');
                                window.location.href = '/';
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all"
                              id="header-logout"
                            >
                              <LogOut className="w-4 h-4" />
                              Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/account/login"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm"
                    id="login-button"
                  >
                    <User className="w-4 h-4" />
                    Đăng nhập
                  </Link>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong mt-2 mx-4 rounded-2xl overflow-hidden"
          >
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {t.nav[link.key]}
                </Link>
              ))}

              {/* Mobile auth link */}
              {mounted && !authLoading && (
                isAuthenticated && user ? (
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span>Tài khoản</span>
                  </Link>
                ) : (
                  <Link
                    href="/account/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-400 hover:text-primary-300 hover:bg-white/5 transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </Link>
                )
              )}

              <button
                type="button"
                onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <span>Language</span>
                <span className="uppercase tracking-[0.2em] text-xs">{locale}</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
