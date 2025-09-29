export type Attachment = {
  name: string;
  type: 'image' | 'document';
  content: string; // data URI for images, text content for documents
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};
