import { create } from 'zustand';

interface ChatStore {
  chatId: string;
  setChatId: (id: string) => void;
  isNewChat: boolean;
  setIsNewChat: (isNew: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
}
export const useChatStore = create<ChatStore>((set) => ({
  chatId: '',
  setChatId: (id) => set(() => ({ chatId: id })),
  isNewChat: false,
  setIsNewChat: (isNew) => set(() => ({ isNewChat: isNew })),
  title: '',
  setTitle: (title) => set(() => ({ title: title })),
  content: '',
  setContent: (content) => set(() => ({ content: content })),
}));
