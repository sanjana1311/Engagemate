import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PostCard } from './components/PostCard';
import { AppView, Post, AutomationRule, Asset, UserProfile } from './types';
import { PlusIcon, TrashIcon, DocumentIcon, LinkIcon, PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline';

declare const chrome: any;

// --- MOCK DATA ---
const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Ultimate Growth Guide', type: 'PDF', url: 'https://example.com/growth-guide.pdf', downloads: 124 },
  { id: '2', name: 'Q4 Marketing Calendar', type: 'LINK', url: 'https://docs.google.com/spreadsheets/d/xyz', downloads: 89 },
];

const MOCK_RULES: AutomationRule[] = [
  { id: '1', keyword: 'guide', assetId: '1', isActive: true, customPrompt: 'Mention that this guide helped me get 10k followers.' },
  { id: '2', keyword: 'calendar', assetId: '2', isActive: true },
  { id: '3', keyword: 'pdf', assetId: '1', isActive: true },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Alex Creator",
  title: "Growth Marketer",
  avatar: "https://picsum.photos/seed/me/200/200",
  bio: "I help founders scale their personal brands on LinkedIn.",
  writingStyle: "Casual, energetic, uses emojis sparsely. No corporate jargon."
};

const MOCK_POSTS: Post[] = [
  {
    id: '101',
    content: "🚀 Just dropped the new 2024 Social Media Growth Strategy! If you want to scale your engagement 10x, this is for you. Drop a comment with 'GUIDE' and I'll send it over! 👇 #growthhacking #socialmedia",
    image: "https://picsum.photos/seed/social/800/400",
    likes: 452,
    createdAt: '2 hours ago',
    comments: [
      {
        id: 'c1',
        userId: 'u1',
        user: { id: 'u1', name: 'Sarah Jenkins', handle: '@sarahj', avatar: 'https://picsum.photos/seed/sarah/50/50' },
        text: "This looks amazing! I need that GUIDE please 🔥",
        timestamp: '1h ago',
        status: 'completed',
        reply: "Sent! Check your DMs Sarah 🙌",
        dmSent: true,
        dmContent: "Hey Sarah, here is the Ultimate Growth Guide you asked for: https://example.com/growth-guide.pdf"
      }
    ]
  },
  {
    id: '102',
    content: "Consistency is key 🔑. How often do you post per week? Let's chat in the comments.",
    likes: 120,
    createdAt: '5 hours ago',
    comments: []
  }
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
    // Check if we are running as an extension
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      setIsExtensionMode(true);
      chrome.storage.local.get(['rules', 'assets', 'userProfile'], (result: any) => {
        if (result.rules) setRules(result.rules);
        if (result.assets) setAssets(result.assets);
        if (result.userProfile) setUserProfile(result.userProfile);
      });
    }
  }, []);

  // Save changes to Chrome Storage
  useEffect(() => {
    if (isExtensionMode) {
      chrome.storage.local.set({ rules: rules });
    }
  }, [rules, isExtensionMode]);

  useEffect(() => {
    if (isExtensionMode) {
      chrome.storage.local.set({ assets: assets });
    }
  }, [assets, isExtensionMode]);

  useEffect(() => {
    if (isExtensionMode) {
      chrome.storage.local.set({ userProfile: userProfile });
    }
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
      keyword: 'new keyword',
      assetId: assets[0]?.id || '',
      isActive: false
    };
    setRules([...rules, newRule]);
  };

  // -- Views --

  const renderDashboard = () => (
    <div className="space-y-6">
      {!isExtensionMode && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 mb-4">
          <strong>Web Preview Mode:</strong> Changes are not saved to the extension. To use on LinkedIn, install this as an unpacked extension.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-indigo-100 text-sm font-medium">Auto-Replies Sent</p>
          <h3 className="text-3xl font-bold mt-1">1,284</h3>
          <div className="mt-4 text-xs bg-white/20 inline-block px-2 py-1 rounded">+12% this week</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Pending Comments</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-800">0</h3>
          <p className="text-xs text-green-500 mt-2">All caught up!</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Resources Delivered</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-800">845</h3>
          <p className="text-xs text-slate-400 mt-2">via DM automation</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-4">Live Post Monitor</h3>
      <div className="max-w-3xl">
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
  );

  const renderAutomations = () => (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-xl font-bold text-slate-900">Keyword Triggers</h3>
           <p className="text-slate-500 text-sm">Define words that trigger an automatic DM and reply.</p>
        </div>
        <button onClick={addNewRule} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
          <PlusIcon className="w-4 h-4" />
          <span>New Rule</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4">If comment contains...</th>
              <th className="px-6 py-4">Send this asset</th>
              <th className="px-6 py-4">Custom Context</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs border border-indigo-100">
                    "{rule.keyword}"
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={rule.assetId}
                    onChange={(e) => {
                       const updated = rules.map(r => r.id === rule.id ? { ...r, assetId: e.target.value } : r);
                       setRules(updated);
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                  >
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </td>
                 <td className="px-6 py-4">
                   <input 
                      type="text" 
                      placeholder="Optional AI hint..."
                      value={rule.customPrompt || ''}
                      onChange={(e) => {
                        const updated = rules.map(r => r.id === rule.id ? { ...r, customPrompt: e.target.value } : r);
                        setRules(updated);
                      }}
                      className="w-full text-xs border-b border-slate-200 focus:border-indigo-500 outline-none bg-transparent"
                   />
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => toggleRule(rule.id)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${rule.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rule.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteRule(rule.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rules.length === 0 && (
          <div className="p-8 text-center text-slate-500">No rules defined. Create one to start automating!</div>
        )}
      </div>
    </div>
  );

  const renderAssets = () => (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-xl font-bold text-slate-900">Asset Library</h3>
           <p className="text-slate-500 text-sm">Manage files and links sent via DM.</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
          <PlusIcon className="w-4 h-4" />
          <span>Upload Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asset.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {asset.type === 'PDF' ? <DocumentIcon className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">{asset.type}</span>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1 truncate">{asset.name}</h4>
            <p className="text-xs text-slate-400 truncate mb-4">{asset.url}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
               <span className="text-xs text-slate-500 font-medium">{asset.downloads} sent</span>
               <button className="text-xs text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
            </div>
          </div>
        ))}
         <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer min-h-[180px]">
            <PhotoIcon className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Add New Resource</span>
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-slate-900">Your Persona</h3>
        <p className="text-slate-500 mt-2">Teach the AI how to sound like YOU. This information helps generate authentic replies.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          
          {/* Avatar & Name */}
          <div className="flex items-start space-x-6">
            <div className="shrink-0">
               <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-sm overflow-hidden relative group">
                 {userProfile.avatar ? (
                   <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserCircleIcon className="w-full h-full text-slate-300" />
                 )}
               </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Display Name</label>
                <input 
                  type="text" 
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="e.g. Alex Hormozi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Headline / Job Title</label>
                <input 
                  type="text" 
                  value={userProfile.title}
                  onChange={(e) => setUserProfile({...userProfile, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="e.g. Founder @ Growth.io"
                />
              </div>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700">Avatar Image URL</label>
             <input 
                type="text" 
                value={userProfile.avatar}
                onChange={(e) => setUserProfile({...userProfile, avatar: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-slate-400">Paste a link to your LinkedIn profile photo.</p>
          </div>

          <div className="border-t border-slate-100 pt-6">
             <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
               <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">AI</span>
               Tone & Voice Configuration
             </h4>

             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Bio / Background Context</label>
                  <textarea 
                    rows={3}
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="Briefly describe what you do. The AI uses this to understand your expertise."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Writing Style</label>
                  <textarea 
                    rows={2}
                    value={userProfile.writingStyle}
                    onChange={(e) => setUserProfile({...userProfile, writingStyle: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="e.g. 'Short, punchy, lowercase. No corporate fluff. Use fire emojis.'"
                  />
                  <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded">
                    <strong>Tip:</strong> If you want it to sound like you, be specific! E.g. <em>"I never use exclamation marks"</em> or <em>"I always start with 'Hey [Name]'"</em>.
                  </p>
                </div>
             </div>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 text-right">
           <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
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