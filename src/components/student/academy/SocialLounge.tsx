import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, MessageCircle, Lock, Users, Smile } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SocialLoungeProps {
  isDarkMode?: boolean;
}

const channels = [
  { id: 'general', name: 'general', icon: Hash, unread: 3 },
  { id: 'study-groups', name: 'study-groups', icon: Users, unread: 0 },
  { id: 'memes', name: 'memes', icon: Smile, unread: 12 },
];

const mockMessages = [
  { 
    id: 1, 
    user: 'Sarah K.', 
    avatar: '👩', 
    message: "Who's studying tonight? I need help with grammar 📚", 
    time: '2m ago',
    reactions: ['👍', '🔥'],
  },
  { 
    id: 2, 
    user: 'Mike T.', 
    avatar: '👨', 
    message: 'Just finished my 30-day streak! 🎉', 
    time: '5m ago',
    reactions: ['🎉', '👏', '🔥'],
  },
  { 
    id: 3, 
    user: 'Emma L.', 
    avatar: '👧', 
    message: "The new vocab lesson is amazing! Can't stop learning 🚀", 
    time: '8m ago',
    reactions: ['❤️'],
  },
];

export const SocialLounge: React.FC<SocialLoungeProps> = ({
  isDarkMode = true,
}) => {
  const [activeChannel, setActiveChannel] = useState('general');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden ${
        isDarkMode 
          ? 'bg-[#1a1a2e] border border-purple-900/30' 
          : 'bg-white border border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isDarkMode ? 'border-purple-900/30' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <MessageCircle className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Social Lounge
          </h3>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          isDarkMode ? 'bg-purple-600/20 text-purple-300' : 'bg-purple-100 text-purple-700'
        }`}>
          <Users className="w-3 h-3" />
          <span>42 online</span>
        </div>
      </div>
      
      <div className="flex h-64">
        {/* Channel Sidebar */}
        <div className={`w-32 p-2 border-r ${
          isDarkMode ? 'bg-[#0f0f1a] border-purple-900/30' : 'bg-gray-50 border-gray-100'
        }`}>
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isActive = activeChannel === channel.id;
            
            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? isDarkMode
                      ? 'bg-purple-600/30 text-purple-300'
                      : 'bg-purple-100 text-purple-700'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{channel.name}</span>
                {channel.unread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {channel.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 relative">
          {/* Messages */}
          <div className="p-3 space-y-3 h-full overflow-y-auto">
            {mockMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex gap-2 p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={isDarkMode ? 'bg-purple-600/30' : 'bg-purple-100'}>
                    {msg.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-medium text-sm ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-700'
                    }`}>
                      {msg.user}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {msg.message}
                  </p>
                  {msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.reactions.map((reaction, i) => (
                        <span 
                          key={i}
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                          }`}
                        >
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
                    }`}
                  />
                ))}
              </div>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                Jake is typing...
              </span>
            </div>
          </div>
          
          {/* Coming Soon Overlay */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm ${
            isDarkMode ? 'bg-[#0f0f1a]/80' : 'bg-white/80'
          }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600' 
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500'
              }`}
            >
              <Lock className="w-4 h-4 text-white" />
              <span className="text-white font-bold">Coming Soon!</span>
            </motion.div>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Connect with fellow learners soon
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
