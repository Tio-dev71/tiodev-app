'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <SessionProvider>
      {isLoginPage ? (
        <div className="min-h-screen">{children}</div>
      ) : (
        <div className="admin-layout flex">
          <AdminSidebar />
          <div className="flex-1 ml-0 md:ml-64">
            <div className="p-6 md:p-8 pt-20 md:pt-8">{children}</div>
          </div>
        </div>
      )}
    </SessionProvider>
  );
}
