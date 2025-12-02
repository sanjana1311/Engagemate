import React, { useState } from 'react';
import { Post, Comment, AutomationRule, Asset, UserProfile } from '../types';
import { generateCommentReply, generateDMMessage } from '../services/gemini';
import { ArrowUpCircleIcon, ChatBubbleOvalLeftIcon, HeartIcon, PaperAirplaneIcon, DocumentTextIcon, LinkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface PostCardProps {
  post: Post;
  rules: AutomationRule[];
  assets: Asset[];
  userProfile: UserProfile;
  onUpdatePost: (updatedPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, rules, assets, userProfile, onUpdatePost }) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'dms'>('comments');

  // Helper to trigger the automation flow
  const processComment = async (comment: Comment, currentPost: Post) => {
    // 1. Identify if automation is triggered
    const matchedRule = rules.find(r => r.isActive && comment.text.toLowerCase().includes(r.keyword.toLowerCase()));
    
    // Update status to processing
    const updatedComments = currentPost.comments.map(c => 
      c.id === comment.id ? { ...c, status: 'processing' as const } : c
    );
    let tempPost = { ...currentPost, comments: updatedComments };
    onUpdatePost(tempPost);

    // 2. Generate AI Reply with Persona
    const replyText = await generateCommentReply(
      currentPost.content, 
      comment.text, 
      comment.user.name,
      userProfile, // Pass persona
      matchedRule?.customPrompt
    );

    // 3. Generate DM if rule matched
    let dmContent = '';
    let dmSent = false;
    
    if (matchedRule) {
      const asset = assets.find(a => a.id === matchedRule.assetId);
      if (asset) {
        dmContent = await generateDMMessage(comment.user.name, asset.name, asset.url, userProfile);
        dmSent = true;
      }
    }

    // 4. Update final state
    const finalComments = tempPost.comments.map(c => 
      c.id === comment.id ? {
        ...c,
        status: 'completed' as const,
        reply: replyText,
        dmSent,
        dmContent
      } : c
    );

    onUpdatePost({ ...tempPost, comments: finalComments });
  };

  const handleSimulateUserComment = async () => {
    if (!newCommentText.trim()) return;
    setIsSimulating(true);

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'user-guest',
      user: {
        id: 'guest',
        name: 'Guest User',
        handle: '@guest_user',
        avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=random'
      },
      text: newCommentText,
      timestamp: 'Now',
      status: 'pending'
    };

    const updatedPost = {
      ...post,
      comments: [newComment, ...post.comments]
    };

    onUpdatePost(updatedPost);
    setNewCommentText('');
    
    // Trigger automation
    await processComment(newComment, updatedPost);
    setIsSimulating(false);
  };

  // Extract assets triggered in DMs for visualization
  const getDmAsset = (dmContent: string): Asset | undefined => {
    // Basic detection: checks if the asset URL is present in the AI text
    return assets.find(a => dmContent.includes(a.url));
  }

  // Helper to clean the message text by removing the raw URL (since we show a card)
  const cleanDmText = (content: string, url: string) => {
    return content.replace(url, '').trim();
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8 border border-black/5 transition-transform hover:scale-[1.002] duration-300">
      {/* Post Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={userProfile.avatar} alt="My Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
          <div>
            <h3 className="font-semibold text-gray-900 text-[15px]">{userProfile.name}</h3>
            <p className="text-xs text-gray-500 font-medium">{userProfile.title} • {post.createdAt}</p>
          </div>
        </div>
        <div className="text-[11px] font-semibold px-3 py-1 bg-[#34C759]/10 text-[#34C759] rounded-full flex items-center border border-[#34C759]/20">
          <div className="w-1.5 h-1.5 bg-[#34C759] rounded-full mr-1.5 animate-pulse"></div>
          Monitoring
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-6">
        <p className="text-gray-800 text-[15px] mb-4 leading-7 font-normal whitespace-pre-line">{post.content}</p>
        {post.image && (
          <div className="rounded-2xl overflow-hidden h-72 w-full bg-gray-50 border border-black/5 shadow-inner relative group">
             <img src={post.image} alt="Post media" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        )}
        
        {/* Social Actions */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 px-2">
          <div className="flex items-center space-x-8">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#FF2D55] transition-colors group">
              <HeartIcon className="w-6 h-6 stroke-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button 
              onClick={() => setActiveTab('comments')}
              className={`flex items-center space-x-2 transition-colors group ${activeTab === 'comments' ? 'text-[#007AFF]' : 'text-gray-500'}`}
            >
              <ChatBubbleOvalLeftIcon className="w-6 h-6 stroke-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('dms')}
              className={`flex items-center space-x-2 transition-colors group ${activeTab === 'dms' ? 'text-[#007AFF]' : 'text-gray-500'}`}
            >
              <PaperAirplaneIcon className="w-6 h-6 stroke-2 group-hover:scale-110 transition-transform -rotate-45" />
              <span className="text-sm font-medium">DMs ({post.comments.filter(c => c.dmSent).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Section */}
      <div className="bg-[#F9F9FB] border-t border-gray-100 min-h-[350px]">
        
        {/* Tab Switcher */}
        <div className="flex p-3 gap-2 justify-center border-b border-gray-200/50">
          <button 
            onClick={() => setActiveTab('comments')}
            className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === 'comments' ? 'bg-white shadow-sm text-black ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Comments
          </button>
          <button 
             onClick={() => setActiveTab('dms')}
             className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === 'dms' ? 'bg-white shadow-sm text-black ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sent DMs
          </button>
        </div>

        <div className="p-6">
          {/* COMMENTS TAB */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Input Simulation */}
              <div className="flex items-center space-x-3 mb-8 bg-white p-2 pl-3 rounded-[24px] shadow-sm border border-black/5 focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex-shrink-0"></div>
                <input 
                  type="text" 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Simulate a comment (e.g. 'send guide')..."
                  className="flex-1 text-[15px] bg-transparent border-none focus:ring-0 placeholder-gray-400 text-gray-900"
                  onKeyDown={(e) => e.key === 'Enter' && handleSimulateUserComment()}
                />
                <button 
                  onClick={handleSimulateUserComment}
                  disabled={isSimulating}
                  className="w-9 h-9 rounded-full bg-[#007AFF] flex items-center justify-center text-white hover:bg-[#0062cc] transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20"
                >
                  <ArrowUpCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex flex-col space-y-3">
                    
                    {/* User Comment */}
                    <div className="flex items-end space-x-2">
                      <img src={comment.user.avatar} alt={comment.user.name} className="w-9 h-9 rounded-full mb-1 shadow-sm border border-white" />
                      <div className="max-w-[85%]">
                        <div className="bg-white text-gray-900 px-4 py-2.5 rounded-2xl rounded-bl-none inline-block shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-gray-100">
                          <p className="text-[15px] leading-snug">{comment.text}</p>
                        </div>
                        <span className="text-[11px] text-gray-400 ml-1 mt-1.5 block font-medium">{comment.user.name}</span>
                      </div>
                    </div>

                    {/* Processing */}
                    {comment.status === 'processing' && (
                      <div className="flex justify-end items-end space-x-2">
                        <div className="bg-[#007AFF] px-4 py-3 rounded-2xl rounded-br-none inline-flex items-center space-x-1 shadow-sm opacity-50">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    )}

                    {/* AI Reply */}
                    {comment.status === 'completed' && comment.reply && (
                      <div className="flex justify-end items-end space-x-2">
                        <div className="max-w-[85%] flex flex-col items-end">
                          <div className="bg-[#007AFF] text-white px-4 py-2.5 rounded-2xl rounded-br-none inline-block shadow-md shadow-blue-500/10">
                            <p className="text-[15px] leading-snug">{comment.reply}</p>
                          </div>
                          <span className="text-[11px] text-gray-400 mr-1 mt-1.5 block font-medium">You (Auto)</span>
                        </div>
                        <img src={userProfile.avatar} alt="Me" className="w-9 h-9 rounded-full mb-1 border-2 border-white shadow-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DMs TAB */}
          {activeTab === 'dms' && (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {post.comments.filter(c => c.dmSent).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <PaperAirplaneIcon className="w-8 h-8 -ml-1 mt-1" />
                    </div>
                    <p className="text-gray-500 font-medium">No automated DMs sent yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Try commenting "guide" in the comments tab.</p>
                  </div>
               )}
               
               {post.comments.filter(c => c.dmSent).map((comment) => {
                 const asset = comment.dmContent ? getDmAsset(comment.dmContent) : undefined;
                 const displayText = asset && comment.dmContent 
                    ? cleanDmText(comment.dmContent, asset.url) 
                    : comment.dmContent;

                 return (
                  <div key={comment.id} className="bg-white p-1 rounded-2xl border border-gray-200/60 shadow-sm">
                     <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                        <div className="flex items-center space-x-2">
                           <span className="text-[11px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">TO</span>
                           <img src={comment.user.avatar} className="w-6 h-6 rounded-full border border-white shadow-sm" />
                           <span className="text-sm font-semibold text-gray-900">{comment.user.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Just now</span>
                     </div>
                     
                     <div className="p-4">
                        {/* Message Bubble */}
                        <div className="bg-[#007AFF] text-white p-3.5 rounded-2xl rounded-tr-sm inline-block max-w-[90%] text-[15px] leading-relaxed shadow-sm mb-4">
                          {displayText}
                        </div>

                        {/* RICH LINK PREVIEW CARD */}
                        {asset && (
                          <div className="mt-1 max-w-sm">
                            <div className="bg-[#F5F5F7] rounded-xl overflow-hidden border border-gray-200/80 hover:bg-[#EAEAEA] transition-colors cursor-pointer group">
                                <div className="flex p-3 space-x-3 items-center">
                                  {/* Icon Box */}
                                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 text-[#007AFF] flex-shrink-0">
                                      {asset.type === 'PDF' ? <DocumentTextIcon className="w-7 h-7" /> : <GlobeAltIcon className="w-7 h-7" />}
                                  </div>
                                  
                                  {/* Text Content */}
                                  <div className="flex-1 min-w-0">
                                      <h4 className="text-[14px] font-semibold text-gray-900 truncate pr-2">{asset.name}</h4>
                                      <p className="text-[11px] text-gray-500 truncate flex items-center mt-0.5">
                                        <LinkIcon className="w-3 h-3 mr-1" />
                                        {asset.url.replace('https://', '').split('/')[0]}
                                      </p>
                                  </div>

                                  {/* Arrow */}
                                  <div className="text-gray-300 group-hover:text-gray-500 transition-colors pr-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  </div>
                                </div>
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
                 )
               })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};