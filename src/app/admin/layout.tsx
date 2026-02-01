import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FolderKanban, GraduationCap, LogOut, Settings, Tags, User, Bell, FileText } from 'lucide-react';
import { getSession } from '@/lib/session';
import { logout } from './actions';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import AdminNav from './AdminNav';

// Server Component - runs on server with Node.js
// More secure than client-side auth checks

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify session on server
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row md:overflow-hidden">
      {/* Sidebar */}
      <div className="w-full flex-none md:w-72 bg-card border-r">
        <div className="flex h-full flex-col px-4 py-6">
          {/* Header */}
          <Link
            className="mb-8 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary to-purple-600"
            href="/"
          >
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <span className="text-lg font-bold block">Admin Panel</span>
              <span className="text-xs text-white/70">Portfolio Manager</span>
            </div>
          </Link>

          {/* Navigation */}
          <AdminNav />

          {/* Footer */}
          <div className="pt-4 border-t space-y-2">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <form action={logout}>
              <Button 
                variant="ghost" 
                type="submit"
                className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col md:overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium hidden lg:block">{session.email}</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 p-6 md:overflow-y-auto md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
