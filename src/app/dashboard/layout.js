'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield, LayoutDashboard, FileText, ClipboardList,
  Bell, User, LogOut, Menu, X, Users, ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { cn, getRoleLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

const getNavItems = (role) => {
  const base = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reports', label: 'Browse Reports', icon: FileText },
  ];

  if (role === 'finder' || role === 'authority' || role === 'admin') {
    base.push({ href: '/reports/new', label: 'Report Found Child', icon: AlertCircle });
    base.push({ href: '/dashboard/my-reports', label: 'My Reports', icon: FileText });
  }
  if (role === 'parent') {
    base.push({ href: '/dashboard/my-claims', label: 'My Claims', icon: ClipboardList });
  }
  if (role === 'admin' || role === 'authority') {
    base.push({ href: '/dashboard/claims', label: 'Review Claims', icon: ClipboardList });
  }
  if (role === 'admin') {
    base.push({ href: '/dashboard/users', label: 'Manage Users', icon: Users });
  }
  return base;
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchUnreadCount();
  }, [isAuthenticated, fetchUnreadCount]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    router.push('/');
  };

  if (!isAuthenticated || !user) return null;

  const navItems = getNavItems(user.role);

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-full bg-white border-r',
      mobile ? 'w-72' : 'w-64'
    )}>
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Shield className="w-5 h-5" />
          SafeReturn
        </Link>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* User badge */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t space-y-0.5">
        <Link href="/dashboard/notifications"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/dashboard/notifications'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground/70 hover:bg-accent hover:text-foreground'
          )}
        >
          <Bell className="w-4 h-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/dashboard/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/dashboard/profile'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground/70 hover:bg-accent hover:text-foreground'
          )}
        >
          <User className="w-4 h-4" />
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden border-b bg-white px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <Shield className="w-5 h-5" />
            SafeReturn
          </Link>
          <Link href="/dashboard/notifications" className="relative p-1">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
