import { create } from 'zustand';
type MessageParams = { model: string; enableDeepThink: boolean; messages: Message[] };
type Message = {
  role: string;
  text: string;
  attachments?: {
    url: string;
    minType?: string;
  }[];
};
export type Model =
  | 'qwen3.6-flash'
  | 'qwen3-vl-flash'
  | 'deepseek-v3'
  | 'deepseek-r1'
  | 'z-image-turbo';
interface QuestionStore {
  model: Model;
  enableDeepThink: boolean;
  messages: Message[];
  getMessageParams: () => MessageParams;
  setModel: (model: Model) => void;
  setMessages: (messages: Message[]) => void;
  setEnableDeepThink: (enableDeepThink: boolean) => void;
  clearMessages: () => void;
  clearAll: () => void;
  chatId: string;
  setChatId: (id: string) => void;
  isNewChat: boolean;
  setIsNewChat: (isNew: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
}
export const useQuestionStore = create<QuestionStore>((set, get) => ({
  model: 'qwen3.6-flash',
  setModel: (model) => set(() => ({ model: model })),
  enableDeepThink: false,
  setEnableDeepThink: (enableDeepThink) => set(() => ({ enableDeepThink: enableDeepThink })),
  messages: [],
  getMessageParams: () => {
    const { model, enableDeepThink, messages } = get();
    return { model, enableDeepThink, messages };
  },
  setMessages: (messages) => set(() => ({ messages: messages })),
  clearMessages: () => set(() => ({ messages: [], isNewChat: false })),
  clearAll: () => {
    get().clearMessages();
    set(() => ({
      model: 'qwen3.6-flash',
      enableDeepThink: false,
      chatId: '',
      title: '',
    }));
  },
  chatId: '',
  setChatId: (id) => set(() => ({ chatId: id })),
  isNewChat: false,
  setIsNewChat: (isNew) => set(() => ({ isNewChat: isNew })),
  title: '',
  setTitle: (title) => set(() => ({ title: title })),
}));
