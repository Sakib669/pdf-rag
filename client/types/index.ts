// src/types/index.ts
export interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: IDoc[];
}

export interface IDoc {
  pageContent?: string;
  metadata?: {
    loc?: { pageNumber?: number };
    source?: string;
  };
}