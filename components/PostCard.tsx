import React, { useState } from 'react';
import { Post, Comment, AutomationRule, Asset, UserProfile } from '../types';
import { generateCommentReply, generateDMMessage } from '../services/gemini';
import { ArrowUpCircleIcon, ChatBubbleOvalLeftIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

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

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8 border border-black/5 transition-transform hover:scale-[1.002] duration-300">
      {/* Post Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={userProfile.avatar} alt="My Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
          <div>
            <h3 className="font-semibold text-gray-900 text-[15px]">{userProfile.name}</h3>
            <p className="text-xs text-gray-500 font-medium">{userProfile.title} • {post.createdAt}</p>
          </div>
        </div>
        <div className="text-[11px] font-semibold px-3 py-1 bg-[#34C759]/10 text-[#34C759] rounded-full flex items-center border border-[#34C759]/20">
          <div className="w-1.5 h-1.5 bg-[#34C759] rounded-full mr-1.5 animate-pulse"></div>
          Active
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-4">
        <p className="text-gray-800 text-[15px] mb-4 leading-7 font-normal">{post.content}</p>
        {post.image && (
          <div className="rounded-2xl overflow-hidden h-72 w-full bg-gray-50 border border-black/5 shadow-inner">
             <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Social Actions */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 px-2">
          <div className="flex items-center space-x-8">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#FF2D55] transition-colors group">
              <HeartIcon className="w-6 h-6 stroke-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#007AFF] transition-colors group">
              <ChatBubbleOvalLeftIcon className="w-6 h-6 stroke-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors">
              <ShareIcon className="w-6 h-6 stroke-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section - iMessage Style */}
      <div className="bg-[#F9F9FB] p-5 space-y-6">
        
        {/* Input Simulation */}
        <div className="flex items-center space-x-3 mb-6 bg-white p-2 rounded-[24px] shadow-sm border border-black/5">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 ml-1"></div>
          <input 
            type="text" 
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Test automation (type 'guide')..."
            className="flex-1 text-[15px] bg-transparent border-none focus:ring-0 placeholder-gray-400 text-gray-900"
            onKeyDown={(e) => e.key === 'Enter' && handleSimulateUserComment()}
          />
          <button 
            onClick={handleSimulateUserComment}
            disabled={isSimulating}
            className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center text-white hover:bg-[#0062cc] transition-colors disabled:opacity-50"
          >
            <ArrowUpCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex flex-col space-y-3">
              
              {/* Incoming Message (User) */}
              <div className="flex items-end space-x-2">
                <img src={comment.user.avatar} alt={comment.user.name} className="w-8 h-8 rounded-full mb-1" />
                <div className="max-w-[85%]">
                   <div className="bg-[#E9E9EB] text-black px-4 py-2 rounded-2xl rounded-bl-sm inline-block shadow-sm">
                     <p className="text-[15px] leading-snug">{comment.text}</p>
                   </div>
                   <span className="text-[10px] text-gray-400 ml-1 mt-1 block font-medium">{comment.user.name} • {comment.timestamp}</span>
                </div>
              </div>

              {/* Processing Indicator */}
              {comment.status === 'processing' && (
                <div className="flex justify-end items-end space-x-2">
                   <div className="bg-[#007AFF] px-4 py-3 rounded-2xl rounded-br-sm inline-flex items-center space-x-1 shadow-sm opacity-50">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200"></div>
                   </div>
                </div>
              )}

              {/* Outgoing Message (Me/AI) */}
              {comment.status === 'completed' && comment.reply && (
                <div className="flex justify-end items-end space-x-2">
                   <div className="max-w-[85%] flex flex-col items-end">
                     <div className="bg-[#007AFF] text-white px-4 py-2 rounded-2xl rounded-br-sm inline-block shadow-sm">
                       <p className="text-[15px] leading-snug">{comment.reply}</p>
                     </div>
                     <span className="text-[10px] text-gray-400 mr-1 mt-1 block font-medium">You • Just now</span>
                   </div>
                   <img src={userProfile.avatar} alt="Me" className="w-8 h-8 rounded-full mb-1 border border-white shadow-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};