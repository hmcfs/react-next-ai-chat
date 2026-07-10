import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface FileStore {
  fileUrls: string[];
  imageUrls: string[];
  addFile: (urls: string[]) => void;
  addImage: (urls: string[]) => void;
  clear: () => void;
}
export const useFileStore = create<FileStore>()(
  persist(
    (set) => ({
      fileUrls: [],
      imageUrls: [],
      addFile: (urls) => set((state) => ({ fileUrls: [...state.fileUrls, ...urls] })),
      addImage: (urls) => set((state) => ({ imageUrls: [...state.imageUrls, ...urls] })),
      clear: () => set({ fileUrls: [], imageUrls: [] }),
    }),
    {
      name: 'file-store',
      partialize: (state) => ({
        fileUrls: state.fileUrls,
        imageUrls: state.imageUrls,
      }),
    }
  )
);
