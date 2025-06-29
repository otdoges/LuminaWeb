import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Camera, BarChart3, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../lib/supabase';
import { groqService } from '../../lib/groq';
import { scrapingBee } from '../../lib/scrapingbee';
import { useTheme } from '../../context/ThemeContext';
import type { Message, ConversationWithMessages } from '../../types/database';

interface ChatInterfaceProps {
  conversation?: ConversationWithMessages;
  onConversationUpdate?: (conversation: ConversationWithMessages) => void;
  onNewConversation?: (conversation: ConversationWithMessages) => void;
}

export function ChatInterface({ 
  conversation, 
  onConversationUpdate, 
  onNewConversation 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(conversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversation(conversation);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = [
    {
      id: 'screenshot',
      label: 'Take Screenshot',
      icon: Camera,
      prompt: 'Take a screenshot of a website and analyze its visual design'
    },
    {
      id: 'analyze',
      label: 'Analyze Website',
      icon: BarChart3,
      prompt: 'Analyze a website for SEO, performance, and user experience'
    },
    {
      id: 'optimize',
      label: 'Get Optimization Tips',
      icon: Zap,
      prompt: 'Get specific optimization recommendations for my website'
    }
  ];

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || !user) return;

    setInput('');
    setIsLoading(true);

    try {
      let conv = currentConversation;

      // Create new conversation if none exists
      if (!conv) {
        conv = await chatService.createConversation(user.id);
        setCurrentConversation(conv);
        onNewConversation?.(conv as ConversationWithMessages);
      }

      // Add user message
      if (!conv) {
        throw new Error("Conversation is undefined when trying to create a message.");
      }
      const userMessage = await chatService.createMessage({
        conversation_id: conv.id,
        role: 'user',
        content
      });

      setMessages(prev => [...prev, userMessage]);

      // Check if this is a website analysis request
      const isWebsiteAnalysis = content.toLowerCase().includes('analyze') || 
                               content.toLowerCase().includes('screenshot') ||
                               content.toLowerCase().includes('website');

      let assistantContent = '';

      if (isWebsiteAnalysis) {
        // Extract URL from message if present
        const urlMatch = content.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          const url = urlMatch[0];
          try {
            const analysis = await scrapingBee.analyzeWebsite(url);
            const analysisPrompt = `I've analyzed the website ${url}. Here are the technical metrics:
            - Load time: ${analysis.metrics.loadTime}ms
            - Page size: ${(analysis.metrics.pageSize / 1024).toFixed(2)}KB
            - Images: ${analysis.metrics.imageCount}
            - Links: ${analysis.metrics.linkCount}
            
            Please provide detailed analysis and recommendations based on this data and the user's request: "${content}"`;

            assistantContent = await groqService.analyzeWebsite({
              url,
              analysisType: ['performance', 'seo', 'user-experience'],
              customPrompt: analysisPrompt
            });
          } catch (error) {
            assistantContent = `I encountered an issue analyzing the website. However, I can still provide general website optimization advice. ${content}`;
          }
        } else {
          assistantContent = await groqService.analyzeWebsite({
            url: 'general',
            analysisType: ['performance', 'seo', 'user-experience'],
            customPrompt: content
          });
        }
      } else {
        // Regular chat with streaming
        setIsStreaming(true);
        const chatMessages = messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content
        }));
        chatMessages.push({ role: 'user', content });

        const stream = await groqService.generateChatResponse(chatMessages, true);
        
        // Create assistant message placeholder
        const assistantMessage = await chatService.createMessage({
          conversation_id: conv.id,
          role: 'assistant',
          content: ''
        });

        setMessages(prev => [...prev, assistantMessage]);

        // Handle streaming response
        if (stream && typeof (stream as any)[Symbol.asyncIterator] === 'function') {
          for await (const chunk of stream as AsyncIterable<any>) {
            const delta = chunk.choices?.[0]?.delta?.content || '';
            if (delta) {
              assistantContent += delta;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMessage.id 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          }
        }
        setIsStreaming(false);
      }

      // Update the assistant message with final content
      if (!isStreaming) {
        const assistantMessage = await chatService.createMessage({
          conversation_id: conv.id,
          role: 'assistant',
          content: assistantContent
        });

        setMessages(prev => {
          const filtered = prev.filter(m => m.role !== 'assistant' || m.content !== '');
          return [...filtered, assistantMessage];
        });
      }

      // Update conversation title if it's the first exchange
      if (messages.length === 0) {
        const title = await groqService.generateTitle([
          { role: 'user', content },
          { role: 'assistant', content: assistantContent }
        ]);
        
        const updatedConv = await chatService.updateConversationTitle(conv.id, title);
        setCurrentConversation(updatedConv as ConversationWithMessages);
        onConversationUpdate?.(updatedConv as ConversationWithMessages);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = await chatService.createMessage({
        conversation_id: currentConversation!.id,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.'
      });
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleSendMessage(action.prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-primary-900 theme-transition">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Bot className="w-16 h-16 text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
                Welcome to LuminaWeb AI
              </h3>
              <p className="text-primary-600 dark:text-primary-400 mb-8">
                I can help you analyze websites, take screenshots, and provide optimization recommendations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 theme-transition"
                      onClick={() => handleQuickAction(action)}
                    >
                      <CardContent className="p-4 text-center">
                        <action.icon 
                          className="w-8 h-8 mx-auto mb-2"
                          style={{ color: currentTheme.accent }}
                        />
                        <h4 className="font-medium text-primary-900 dark:text-primary-100">
                          {action.label}
                        </h4>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: message.role === 'user' ? currentTheme.accent : `${currentTheme.accent}20`
                    }}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4" style={{ color: currentTheme.accent }} />
                    )}
                  </div>
                  
                  <Card className={`theme-transition ${
                    message.role === 'user' 
                      ? 'bg-primary-100 dark:bg-primary-800' 
                      : 'bg-white dark:bg-primary-900 border-primary-200 dark:border-primary-700'
                  }`}>
                    <CardContent className="p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {message.content ? (
                          <div className="whitespace-pre-wrap text-primary-900 dark:text-primary-100">
                            {message.content}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-primary-200 dark:border-primary-700 p-4 theme-transition">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to analyze a website, take a screenshot, or get optimization tips..."
            className="flex-1 theme-transition"
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="theme-transition"
            style={{ backgroundColor: currentTheme.accent }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}