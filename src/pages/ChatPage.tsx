import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ConversationSidebar } from '../components/chat/ConversationSidebar';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../lib/supabase';
import type { ConversationWithMessages } from '../types/database';

export function ChatPage() {
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await chatService.getConversations(user.id);
      setConversations(data as ConversationWithMessages[]);
      
      // Set the first conversation as active if none is selected
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0] as ConversationWithMessages);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
  };

  const handleConversationSelect = (conversation: ConversationWithMessages) => {
    setActiveConversation(conversation);
  };

  const handleConversationUpdate = (updatedConversation: ConversationWithMessages) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
    setActiveConversation(updatedConversation);
  };

  const handleNewConversationCreated = (newConversation: ConversationWithMessages) => {
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary-600 dark:text-primary-400">Loading conversations...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 flex theme-transition">
      <ConversationSidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        onConversationsUpdate={setConversations}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatInterface
          conversation={activeConversation}
          onConversationUpdate={handleConversationUpdate}
          onNewConversation={handleNewConversationCreated}
        />
      </div>
    </div>
  );
}