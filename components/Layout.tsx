import React from 'react';
import { AppView, UserProfile } from '../types';
import { HomeIcon, BoltIcon, FolderOpenIcon, Cog6ToothIcon, BellIcon } from '@heroicons/react/24/outline';

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
    { id: AppView.ASSETS, label: 'Assets & Files', icon: FolderOpenIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            EngageMate
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => onChangeView(AppView.SETTINGS)}
            className={`flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-sm font-medium transition-colors ${
              currentView === AppView.SETTINGS ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b z-20 p-4 flex justify-between items-center">
        <span className="font-bold text-indigo-600">EngageMate</span>
        <div className="flex gap-4">
           {menuItems.map((item) => (
             <button key={item.id} onClick={() => onChangeView(item.id)} className={`${currentView === item.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                <item.icon className="w-6 h-6" />
             </button>
           ))}
           <button onClick={() => onChangeView(AppView.SETTINGS)} className={`${currentView === AppView.SETTINGS ? 'text-indigo-600' : 'text-slate-500'}`}>
             <Cog6ToothIcon className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {currentView === AppView.DASHBOARD && 'Live Activity'}
            {currentView === AppView.AUTOMATIONS && 'Automation Rules'}
            {currentView === AppView.ASSETS && 'Resource Library'}
            {currentView === AppView.SETTINGS && 'Your Persona'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center space-x-2 pl-4 border-l border-slate-200">
              <span className="hidden md:block text-sm font-medium text-slate-700">{userProfile.name}</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};