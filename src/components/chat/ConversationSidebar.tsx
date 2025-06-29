import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import type { ConversationWithMessages } from '../../types/database';

interface ConversationSidebarProps {
  conversations: ConversationWithMessages[];
  activeConversation?: ConversationWithMessages;
  onConversationSelect: (conversation: ConversationWithMessages) => void;
  onNewConversation: () => void;
  onConversationsUpdate: (conversations: ConversationWithMessages[]) => void;
}

export function ConversationSidebar({
  conversations,
  activeConversation,
  onConversationSelect,
  onNewConversation,
  onConversationsUpdate
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  const handleEditStart = (conversation: ConversationWithMessages) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = async (conversationId: string) => {
    if (!editTitle.trim()) return;

    try {
      await chatService.updateConversationTitle(conversationId, editTitle.trim());
      
      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId ? { ...conv, title: editTitle.trim() } : conv
      );
      onConversationsUpdate(updatedConversations);
      
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await chatService.deleteConversation(conversationId);
      
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      onConversationsUpdate(updatedConversations);
      
      // If the deleted conversation was active, clear selection
      if (activeConversation?.id === conversationId) {
        onConversationSelect(updatedConversations[0] || null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-primary-900 border-r border-primary-200 dark:border-primary-700 flex flex-col h-full theme-transition">
      {/* Header */}
      <div className="p-4 border-b border-primary-200 dark:border-primary-700 theme-transition">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2 theme-transition"
          style={{ backgroundColor: currentTheme.accent }}
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 text-center text-primary-500 dark:text-primary-400"
            >
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </motion.div>
          ) : (
            conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card
                  className={`m-2 cursor-pointer transition-all duration-200 hover:shadow-md theme-transition ${
                    activeConversation?.id === conversation.id
                      ? 'ring-2 shadow-md'
                      : 'hover:bg-primary-50 dark:hover:bg-primary-800'
                  }`}
                  style={activeConversation?.id === conversation.id ? {
                    ringColor: currentTheme.accent,
                    backgroundColor: `${currentTheme.accent}10`
                  } : {}}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingId === conversation.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-6 text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') handleEditSave(conversation.id);
                                if (e.key === 'Escape') handleEditCancel();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSave(conversation.id);
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCancel();
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium text-primary-900 dark:text-primary-100 truncate text-sm theme-transition">
                              {conversation.title}
                            </h4>
                            <p className="text-xs text-primary-500 dark:text-primary-400 mt-1 theme-transition">
                              {formatDate(conversation.updated_at)}
                            </p>
                            {conversation.messages.length > 0 && (
                              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 truncate theme-transition">
                                {conversation.messages[conversation.messages.length - 1]?.content}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      
                      {editingId !== conversation.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(conversation);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(conversation.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}