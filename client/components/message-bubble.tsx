// src/components/message-bubble.tsx
'use client';

import { IMessage } from '@/types';

export default function MessageBubble({ message }: { message: IMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-2xl px-4 py-2 shadow-md ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted text-foreground rounded-tl-none'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {message.documents && message.documents.length > 0 && (
          <div className="mt-2 text-sm border-t border-border pt-2">
            <p className="font-semibold text-foreground">📚 Sources:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              {message.documents.map((doc, i) => (
                <li key={i}>
                  <span className="text-primary hover:underline cursor-pointer">{doc.metadata?.source || `Source ${i+1}`}</span>
                  {doc.metadata?.loc?.pageNumber && (
                    <span className="text-muted-foreground"> – page {doc.metadata.loc.pageNumber}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}