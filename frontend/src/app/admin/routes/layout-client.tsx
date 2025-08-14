"use client";

import ProtectedLayout from '@/components/ProtectedLayout';

export default function AdminRoutesLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="flex h-full bg-gray-900 text-white">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}