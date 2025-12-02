import React from 'react';
import { AppView, UserProfile } from '../types';
import { HomeIcon, BoltIcon, FolderOpenIcon, Cog6ToothIcon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  userProfile: UserProfile;
  onChangeView: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, userProfile, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
    { id: AppView.AUTOMATIONS, label: 'Automations', icon: BoltIcon },
    { id: AppView.ASSETS, label: 'Assets', icon: FolderOpenIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5F5F7]">
      {/* Sidebar - macOS Style */}
      <aside className="w-64 bg-[#F5F5F7]/80 backdrop-blur-xl border-r border-black/5 fixed h-full z-20 hidden md:flex flex-col pt-8 pb-6">
        <div className="px-6 mb-8 flex items-center space-x-3">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
            <BoltIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            EngageMate
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black shadow-sm' // Active state: White card pop
                    : 'text-gray-500 hover:bg-black/5 hover:text-black'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#007AFF]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 mt-auto">
          <p className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
          <button 
            onClick={() => onChangeView(AppView.SETTINGS)}
            className={`flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-[13px] font-medium transition-all duration-200 ${
              currentView === AppView.SETTINGS ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:bg-black/5'
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-black/5 z-30 p-4 flex justify-between items-center shadow-sm">
        <span className="font-semibold text-gray-900">EngageMate</span>
        <div className="flex gap-4">
           {menuItems.map((item) => (
             <button key={item.id} onClick={() => onChangeView(item.id)} className={`${currentView === item.id ? 'text-[#007AFF]' : 'text-gray-400'}`}>
                <item.icon className="w-6 h-6" />
             </button>
           ))}
           <button onClick={() => onChangeView(AppView.SETTINGS)} className={`${currentView === AppView.SETTINGS ? 'text-[#007AFF]' : 'text-gray-400'}`}>
             <Cog6ToothIcon className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-0">
        {/* Sticky Header with Blur */}
        <header className="sticky top-0 z-10 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/5 h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {currentView === AppView.DASHBOARD && 'Dashboard'}
              {currentView === AppView.AUTOMATIONS && 'Automations'}
              {currentView === AppView.ASSETS && 'Library'}
              {currentView === AppView.SETTINGS && 'Settings'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="relative hidden sm:block">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 bg-white border border-black/5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 w-48 transition-all"
              />
            </div>
            
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0.5 w-2 h-2 bg-[#FF3B30] rounded-full border border-[#F5F5F7]"></span>
            </button>
            
            <div className="flex items-center space-x-3 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 leading-none">{userProfile.name}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-none">{userProfile.title}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shadow-sm ring-2 ring-white">
                <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};