import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickTransactionModal } from '../Transactions/QuickTransactionModal';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickTransactionOpen, setQuickTransactionOpen] = useState(false);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // N para nueva transacción
      if (event.key === 'n' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          setQuickTransactionOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  

  return (
  <div className="min-h-screen flex flex-col justify-start items-start bg-gray-50 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

  <Header onMenuClick={() => setSidebarOpen(true)} onQuickTransaction={() => setQuickTransactionOpen(true)} />

      <div className="lg:pl-64">
        <main className="flex-1 pt-16 py-6 app-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <QuickTransactionModal
        isOpen={quickTransactionOpen}
        onClose={() => setQuickTransactionOpen(false)}
      />
    </div>
  );
};