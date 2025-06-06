'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* サイドバー */}
      <Sidebar isOpen={sidebarOpen} />

      {/* メインコンテンツエリア */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ヘッダー */}
        <Header onMenuToggle={toggleSidebar} title={title} />

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
