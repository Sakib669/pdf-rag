// src/components/chat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { sendChatMessage } from '@/services/api';
import { IMessage } from '@/types';
import MessageBubble from './message-bubble';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function ChatComponent() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: IMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(input);
      const assistantMessage: IMessage = {
        role: 'assistant',
        content: response.message,
        documents: response.docs,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error: Unable to get a response.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <span>Thinking</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border p-4 flex gap-3">
        <Input
          placeholder="Ask a question about your PDFs..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}