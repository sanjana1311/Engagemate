import React, { useState } from 'react';
import { Post, Comment, AutomationRule, Asset, UserProfile } from '../types';
import { generateCommentReply, generateDMMessage } from '../services/gemini';
import { ArrowPathIcon, ChatBubbleLeftIcon, PaperAirplaneIcon, HeartIcon } from '@heroicons/react/24/outline';
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
        avatar: 'https://picsum.photos/seed/guest/50/50'
      },
      text: newCommentText,
      timestamp: 'Just now',
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      {/* Post Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={userProfile.avatar} alt="My Avatar" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-slate-800">{userProfile.name}</h3>
            <p className="text-xs text-slate-500">{userProfile.title} • {post.createdAt}</p>
          </div>
        </div>
        <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
          Monitoring
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-slate-700 text-sm mb-3 leading-relaxed">{post.content}</p>
        {post.image && (
          <div className="rounded-lg overflow-hidden h-64 w-full bg-slate-100">
             <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-center space-x-6 mt-4 text-slate-500">
          <div className="flex items-center space-x-1 cursor-pointer hover:text-red-500 transition-colors">
            <HeartIcon className="w-5 h-5" />
            <span className="text-xs font-medium">{post.likes}</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-indigo-500 transition-colors">
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-xs font-medium">{post.comments.length}</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-800 transition-colors">
            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
          </div>
        </div>
      </div>

      {/* Simulation Area */}
      <div className="bg-slate-50 p-4 border-t border-slate-100">
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Simulate a user comment (e.g. 'Send me the PDF')..."
            className="flex-1 text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSimulateUserComment()}
          />
          <button 
            onClick={handleSimulateUserComment}
            disabled={isSimulating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSimulating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Post'}
          </button>
        </div>
      </div>

      {/* Comments Feed */}
      <div className="bg-slate-50/50 p-4 space-y-6 max-h-96 overflow-y-auto">
        {post.comments.map((comment) => (
          <div key={comment.id} className="flex flex-col space-y-2">
            
            {/* The User Comment */}
            <div className="flex space-x-3">
              <img src={comment.user.avatar} alt={comment.user.name} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 inline-block">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-semibold text-xs text-slate-900">{comment.user.name}</span>
                    <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700">{comment.text}</p>
                </div>
              </div>
            </div>

            {/* Processing State */}
            {comment.status === 'processing' && (
              <div className="ml-11 flex items-center space-x-1 text-xs text-slate-400 font-medium">
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            )}

            {/* My Reply (The Automated One, but styled natively) */}
            {comment.status === 'completed' && comment.reply && (
              <div className="flex space-x-3 pl-8"> {/* Indent reply */}
                <div className="shrink-0">
                  <img src={userProfile.avatar} alt="Me" className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                </div>
                <div className="flex-1">
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none inline-block">
                    <div className="flex justify-between items-center mb-1 gap-2">
                       <span className="text-xs font-bold text-slate-900">{userProfile.name}</span>
                       <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">{comment.reply}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};