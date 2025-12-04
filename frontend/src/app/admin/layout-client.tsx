"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Train, 
  Route as RouteIcon,
  MapPin,
  List,
  Plus,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Redirect non-admin users away from admin area
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // If user is not admin or still loading, don't render the admin layout
  if (!isAdmin || loading) {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-black text-white overflow-hidden">
        {/* Mobile sidebar toggle */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <List className="h-6 w-6" />
        </button>

        {/* Sidebar */}
        <aside 
          className={`fixed md:relative z-40 h-full w-64 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 flex flex-col`}
        >
          {/* Sidebar Background with Blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-r border-white/10 z-0" />
          
          {/* Sidebar Content */}
          <div className="relative z-10 flex flex-col h-full">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold flex items-center tracking-tight">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
                  <Train className="h-5 w-5 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Admin Portal
                </span>
              </h2>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              <Link href="/admin">
                <div className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin' 
                    ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  Dashboard
                </div>
              </Link>
              
              {/* Routes section */}
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Management
              </div>
              
              <Link href="/admin/routes">
                <div className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin/routes' || pathname.startsWith('/admin/routes/')
                    ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                  <RouteIcon className="h-5 w-5 mr-3" />
                  Routes
                </div>
              </Link>

              <Link href="/admin/trains">
                <div className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin/trains' || pathname.startsWith('/admin/trains/')
                    ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                  <Train className="h-5 w-5 mr-3" />
                  Trains
                </div>
              </Link>
              
              <Link href="/admin/stations">
                <div className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin/stations' || pathname.startsWith('/admin/stations/')
                    ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                  <MapPin className="h-5 w-5 mr-3" />
                  Stations
                </div>
              </Link>
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="flex items-center mb-4 px-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                  AD
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Administrator</p>
                  <p className="text-xs text-gray-500">admin@railtrack.lk</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 justify-start rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Mobile Header */}
          <header className="bg-black/20 backdrop-blur-md border-b border-white/5 md:hidden absolute top-0 left-0 right-0 z-20">
            <div className="flex h-16 items-center px-16 justify-between">
              <div className="flex items-center">
                <span className="text-lg font-bold text-white">RailTrack Admin</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-black/95 md:pt-0 pt-16 relative">
            {/* Global Background for Content Area */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0 pointer-events-none" />
            <div className="relative z-10 min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}