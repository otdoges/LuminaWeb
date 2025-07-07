import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 Environment Variables Debug:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set ✅' : 'Missing ❌');
  
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
    console.log('📝 Please add VITE_SUPABASE_URL to your .env.local file');
  }
  
  if (!supabaseAnonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
    console.log('📝 Please add VITE_SUPABASE_ANON_KEY to your .env.local file');
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `Missing Supabase environment variables:
${!supabaseUrl ? '- VITE_SUPABASE_URL' : ''}
${!supabaseAnonKey ? '- VITE_SUPABASE_ANON_KEY' : ''}

Please create a .env.local file in your project root with:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Get these values from: https://app.supabase.com → Your Project → Settings → API`;
  
  throw new Error(errorMessage);
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