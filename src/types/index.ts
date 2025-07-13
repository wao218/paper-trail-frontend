export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export type ChatResponse = {
  answer: string;
};
