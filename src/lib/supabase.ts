import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions for database operations
export const chatService = {
  // User operations
  async createUser(user: { id: string; name: string; email: string; avatar_url?: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Conversation operations
  async createConversation(userId: string, title?: string) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(
          id,
          role,
          content,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getConversation(id: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(
          id,
          role,
          content,
          metadata,
          created_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConversationTitle(id: string, title: string) {
    const { data, error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteConversation(id: string) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Message operations
  async createMessage(message: {
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: any;
  }) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};