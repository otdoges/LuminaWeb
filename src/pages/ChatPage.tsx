import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ConversationSidebar } from '../components/chat/ConversationSidebar';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../lib/supabase';
import type { ConversationWithMessages } from '../types/database';

export function ChatPage() {
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithMessages | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Mock conversations for when Supabase is not configured
  const generateMockConversations = (): ConversationWithMessages[] => [
    {
      id: 'mock-1',
      user_id: user?.id || 'mock-user',
      title: 'Website Performance Analysis',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
                  {
            id: 'msg-1',
            conversation_id: 'mock-1',
            role: 'user',
            content: 'Can you analyze my website performance and suggest improvements?',
            metadata: null,
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'msg-2',
            conversation_id: 'mock-1',
            role: 'assistant',
            content: 'I\'d be happy to help analyze your website performance! To get started, please share your website URL and I\'ll examine key metrics like loading speed, SEO optimization, mobile responsiveness, and user experience factors.',
            metadata: null,
            created_at: new Date(Date.now() - 3550000).toISOString()
          }
      ]
    },
    {
      id: 'mock-2',
      user_id: user?.id || 'mock-user',
      title: 'SEO Optimization Tips',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      messages: [
                  {
            id: 'msg-3',
            conversation_id: 'mock-2',
            role: 'user',
            content: 'What are the most important SEO factors for a modern website?',
            metadata: null,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Check if Supabase is configured
      const hasSupabaseUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);
      const hasSupabaseKey = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      if (!hasSupabaseUrl || !hasSupabaseKey) {
        console.warn('Supabase not configured, using mock conversations');
        const mockData = generateMockConversations();
        setConversations(mockData);
        
        // Set the first conversation as active if none is selected
        if (mockData.length > 0 && !activeConversation) {
          setActiveConversation(mockData[0]);
        }
        return;
      }

      const data = await chatService.getConversations(user.id);
      setConversations(data as ConversationWithMessages[]);
      
      // Set the first conversation as active if none is selected
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0] as ConversationWithMessages);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations. Using offline mode.');
      
      // Fallback to mock data on error
      const mockData = generateMockConversations();
      setConversations(mockData);
      if (mockData.length > 0 && !activeConversation) {
        setActiveConversation(mockData[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(undefined);
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-accent-900 flex items-center justify-center p-4">
        <LiquidGlass variant="card" className="p-12 text-center max-w-md" animated glow>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div 
              className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h3 className="text-xl font-semibold text-foreground mb-2">Loading Conversations</h3>
            <p className="text-muted-foreground">
              {error ? 'Connecting to chat service...' : 'Preparing your chat experience...'}
            </p>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"
              >
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              </motion.div>
            )}
          </motion.div>
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-accent-900 flex theme-transition">
      {/* Sidebar with liquid glass effect */}
      <div className="hidden md:block">
        <LiquidGlass variant="panel" className="h-screen w-80 border-r-0 rounded-none">
          <ConversationSidebar
            conversations={conversations}
            activeConversation={activeConversation}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onConversationsUpdate={setConversations}
          />
        </LiquidGlass>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface
          conversation={activeConversation}
          onConversationUpdate={handleConversationUpdate}
          onNewConversation={handleNewConversationCreated}
        />
      </div>
      
      {/* Mobile sidebar overlay */}
      <div className="md:hidden">
        <ConversationSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          onConversationsUpdate={setConversations}
        />
      </div>
    </div>
  );
}