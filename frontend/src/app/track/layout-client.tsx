"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Train, 
  Map,
  List,
  ArrowLeft
} from 'lucide-react';

export default function TrackLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <List className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-40 h-full bg-gray-800 border-r border-gray-700 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <h2 className="text-xl font-bold flex items-center mt-4">
            <Train className="h-6 w-6 text-primary mr-2" />
            Train Tracking
          </h2>
        </div>
        <nav className="mt-6 flex flex-col h-[calc(100%-120px)]">
          <Link href="/track">
            <div className={`flex items-center px-6 py-3 text-sm font-medium ${
              pathname === '/track' 
                ? 'bg-gray-900 text-primary border-l-4 border-primary' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}>
              <Map className="h-5 w-5 mr-3" />
              Live Map
            </div>
          </Link>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - only shown on mobile */}
        <header className="bg-gray-900 border-b border-gray-800 md:hidden">
          <div className="flex h-16 items-center px-4 justify-between">
            <div className="flex items-center ml-10">
              <Train className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold ml-2">Tracking</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}