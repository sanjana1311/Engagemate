import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PostCard } from './components/PostCard';
import { AppView, Post, AutomationRule, Asset, UserProfile } from './types';
import { PlusIcon, TrashIcon, DocumentIcon, LinkIcon, PhotoIcon, UserCircleIcon, EllipsisHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

declare const chrome: any;

// --- MOCK DATA ---
const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Ultimate Growth Guide', type: 'PDF', url: 'https://example.com/growth-guide.pdf', downloads: 124 },
  { id: '2', name: 'Q4 Marketing Calendar', type: 'LINK', url: 'https://docs.google.com/spreadsheets/d/xyz', downloads: 89 },
];

const MOCK_RULES: AutomationRule[] = [
  { id: '1', keyword: 'guide', assetId: '1', isActive: true, customPrompt: 'Mention that this guide helped me get 10k followers.' },
  { id: '2', keyword: 'calendar', assetId: '2', isActive: true },
  { id: '3', keyword: 'pdf', assetId: '1', isActive: false },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Alex Creator",
  title: "Growth Marketer",
  avatar: "https://ui-avatars.com/api/?name=Alex+Creator&background=007AFF&color=fff",
  bio: "I help founders scale their personal brands on LinkedIn.",
  writingStyle: "Casual, energetic, uses emojis sparsely. No corporate jargon."
};

const MOCK_POSTS: Post[] = [
  {
    id: '101',
    content: "🚀 Just dropped the new 2024 Social Media Growth Strategy! If you want to scale your engagement 10x, this is for you. Drop a comment with 'GUIDE' and I'll send it over! 👇 #growthhacking #socialmedia",
    image: "https://picsum.photos/seed/apple/800/400",
    likes: 452,
    createdAt: '2h ago',
    comments: [
      {
        id: 'c1',
        userId: 'u1',
        user: { id: 'u1', name: 'Sarah Jenkins', handle: '@sarahj', avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random' },
        text: "This looks amazing! I need that GUIDE please 🔥",
        timestamp: '1h ago',
        status: 'completed',
        reply: "Sent! Check your DMs Sarah 🙌",
        dmSent: true,
        dmContent: "Hey Sarah, here is the Ultimate Growth Guide you asked for: https://example.com/growth-guide.pdf"
      }
    ]
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isExtensionMode, setIsExtensionMode] = useState(false);

  // Initialize and Load from Chrome Storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      setIsExtensionMode(true);
      chrome.storage.local.get(['rules', 'assets', 'userProfile'], (result: any) => {
        if (result.rules) setRules(result.rules);
        if (result.assets) setAssets(result.assets);
        if (result.userProfile) setUserProfile(result.userProfile);
      });
    }
  }, []);

  useEffect(() => {
    if (isExtensionMode) chrome.storage.local.set({ rules: rules });
  }, [rules, isExtensionMode]);

  useEffect(() => {
    if (isExtensionMode) chrome.storage.local.set({ assets: assets });
  }, [assets, isExtensionMode]);

  useEffect(() => {
    if (isExtensionMode) chrome.storage.local.set({ userProfile: userProfile });
  }, [userProfile, isExtensionMode]);

  // -- Handlers --

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const addNewRule = () => {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      keyword: 'keyword',
      assetId: assets[0]?.id || '',
      isActive: false
    };
    setRules([...rules, newRule]);
  };

  // -- Components --
  
  const StatCard = ({ title, value, sub, color }: any) => (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
         <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">{title}</h4>
         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
            <ArrowPathIcon className="w-4 h-4 text-current opacity-70" />
         </div>
      </div>
      <div>
        <div className="text-4xl font-bold text-gray-900 tracking-tight">{value}</div>
        <div className="text-sm text-gray-400 font-medium mt-1">{sub}</div>
      </div>
    </div>
  );

  // -- Views --

  const renderDashboard = () => (
    <div className="space-y-10">
      {!isExtensionMode && (
        <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl text-sm text-amber-800 flex items-center shadow-sm">
          <span className="bg-amber-100 p-1 rounded-md mr-3">⚠️</span>
          <strong>Preview Mode:</strong> &nbsp;Install as unpacked extension to use on LinkedIn.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Replies Sent" value="1,284" sub="+12% this week" color="bg-blue-50 text-[#007AFF]" />
        <StatCard title="Pending" value="0" sub="All caught up" color="bg-green-50 text-[#34C759]" />
        <StatCard title="Resources" value="845" sub="Delivered via DM" color="bg-purple-50 text-purple-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Live Activity</h3>
        <div className="max-w-4xl">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              rules={rules} 
              assets={assets}
              userProfile={userProfile}
              onUpdatePost={handleUpdatePost} 
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAutomations = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Automations</h3>
           <p className="text-gray-500 mt-2 text-lg font-normal">Manage keyword triggers and responses.</p>
        </div>
        <button onClick={addNewRule} className="bg-[#007AFF] text-white px-5 py-2.5 rounded-full hover:bg-[#0062cc] transition-colors shadow-lg shadow-blue-500/30 text-[15px] font-semibold flex items-center">
          <PlusIcon className="w-5 h-5 mr-1" /> Add Rule
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 overflow-hidden">
        {rules.map((rule, index) => (
          <div key={rule.id} className={`p-6 flex items-center justify-between group transition-colors hover:bg-gray-50 ${index !== rules.length - 1 ? 'border-b border-gray-100' : ''}`}>
             <div className="flex-1 grid grid-cols-12 gap-6 items-center">
                
                {/* Keyword */}
                <div className="col-span-3">
                   <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">If comment has</div>
                   <input 
                      type="text" 
                      value={rule.keyword}
                      onChange={(e) => {
                        const updated = rules.map(r => r.id === rule.id ? { ...r, keyword: e.target.value } : r);
                        setRules(updated);
                      }}
                      className="font-mono text-[15px] bg-gray-100 border-none rounded-lg px-3 py-1.5 w-full text-indigo-600 focus:ring-2 focus:ring-[#007AFF]"
                   />
                </div>

                {/* Arrow */}
                <div className="col-span-1 flex justify-center">
                  <span className="text-gray-300">→</span>
                </div>

                {/* Asset */}
                <div className="col-span-4">
                   <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Send File</div>
                   <select 
                      value={rule.assetId}
                      onChange={(e) => {
                         const updated = rules.map(r => r.id === rule.id ? { ...r, assetId: e.target.value } : r);
                         setRules(updated);
                      }}
                      className="block w-full rounded-lg border-gray-200 bg-white text-sm py-2 px-3 focus:border-[#007AFF] focus:ring-[#007AFF]"
                    >
                      {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>

                {/* Custom Context */}
                <div className="col-span-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Context</div>
                  <input 
                      type="text" 
                      placeholder="e.g. Be funny..."
                      value={rule.customPrompt || ''}
                      onChange={(e) => {
                        const updated = rules.map(r => r.id === rule.id ? { ...r, customPrompt: e.target.value } : r);
                        setRules(updated);
                      }}
                      className="w-full text-sm border-b border-gray-200 focus:border-[#007AFF] outline-none bg-transparent py-1 placeholder-gray-300 transition-colors"
                   />
                </div>
             </div>

             {/* Actions */}
             <div className="flex items-center space-x-6 ml-6 pl-6 border-l border-gray-100">
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${rule.isActive ? 'bg-[#34C759]' : 'bg-gray-200'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${rule.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
                <button onClick={() => deleteRule(rule.id)} className="text-gray-300 hover:text-[#FF3B30] transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
             </div>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="p-12 text-center text-gray-400">No active automations. Tap "Add Rule" to start.</div>
        )}
      </div>
    </div>
  );

  const renderAssets = () => (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Files</h3>
           <p className="text-gray-500 mt-2 text-lg font-normal">PDFs and links available for DMing.</p>
        </div>
        <button className="bg-white text-gray-900 border border-gray-200 px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-[15px] font-semibold flex items-center">
          <PlusIcon className="w-5 h-5 mr-1 text-gray-500" /> Upload
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer group flex flex-col items-center text-center aspect-square justify-center relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${asset.type === 'PDF' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
              {asset.type === 'PDF' ? <DocumentIcon className="w-8 h-8" /> : <LinkIcon className="w-8 h-8" />}
            </div>
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 px-2">{asset.name}</h4>
            <p className="text-[11px] text-gray-400 mt-1">{asset.downloads} sent</p>
            
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <EllipsisHorizontalIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </div>
          </div>
        ))}
         <div className="border-2 border-dashed border-gray-200 rounded-3xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-[#007AFF]/50 hover:text-[#007AFF] transition-colors cursor-pointer aspect-square bg-gray-50/50">
            <PlusIcon className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-sm font-medium">Add</span>
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Persona</h3>
        <p className="text-gray-500 mt-2 text-lg">Customize how the AI mimics you.</p>
      </div>

      <div className="space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 overflow-hidden">
           <div className="p-8 flex items-center space-x-6">
              <div className="relative group cursor-pointer">
                 <img src={userProfile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-sm group-hover:opacity-80 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">Edit</span>
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                    <input 
                      type="text" 
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="block w-full border-b border-gray-200 focus:border-[#007AFF] outline-none py-1 text-lg font-medium bg-transparent"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</label>
                    <input 
                      type="text" 
                      value={userProfile.title}
                      onChange={(e) => setUserProfile({...userProfile, title: e.target.value})}
                      className="block w-full border-b border-gray-200 focus:border-[#007AFF] outline-none py-1 text-base text-gray-600 bg-transparent"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
             <h4 className="font-semibold text-gray-900">Tone & Voice</h4>
             <span className="text-[10px] bg-[#007AFF] text-white px-2 py-0.5 rounded-full font-bold">AI MODEL</span>
          </div>
          
          <div className="p-6 space-y-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context / Bio</label>
                <textarea 
                  rows={3}
                  value={userProfile.bio}
                  onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                  className="block w-full rounded-2xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#007AFF] focus:ring-[#007AFF] text-sm p-4 resize-none"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Writing Style</label>
                <textarea 
                  rows={2}
                  value={userProfile.writingStyle}
                  onChange={(e) => setUserProfile({...userProfile, writingStyle: e.target.value})}
                  className="block w-full rounded-2xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#007AFF] focus:ring-[#007AFF] text-sm p-4 resize-none"
                />
             </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 text-right border-t border-gray-100">
             <button className="text-[#007AFF] font-medium text-sm hover:text-blue-700 transition-colors">
               Reset to Default
             </button>
          </div>
        </div>
        
        <div className="flex justify-end">
           <button className="bg-[#007AFF] text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/30 hover:bg-[#0062cc] transition-all transform hover:-translate-y-0.5">
             Save Changes
           </button>
        </div>

      </div>
    </div>
  );

  return (
    <Layout currentView={currentView} userProfile={userProfile} onChangeView={setCurrentView}>
      {currentView === AppView.DASHBOARD && renderDashboard()}
      {currentView === AppView.AUTOMATIONS && renderAutomations()}
      {currentView === AppView.ASSETS && renderAssets()}
      {currentView === AppView.SETTINGS && renderSettings()}
    </Layout>
  );
}