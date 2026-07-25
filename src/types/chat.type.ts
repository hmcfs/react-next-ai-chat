export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: Content[];
}
export type Content =
  | { type: 'text'; text: string }
  | {
      type: 'image_url';
      image_url: { url: string; detail?: 'low' | 'high' | 'auto' };
    };
