import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1b1b1b] text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-20 min-h-screen">
        <main className="flex-1 p-6 bg-[#1b1b1b]">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
