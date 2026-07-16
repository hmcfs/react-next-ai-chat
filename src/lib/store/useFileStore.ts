import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type File1 = { url: string; fileType: string; fileName: string };
type Attachment = {
  url: string;
  fileType: string;
  fileName: string;
};
interface FileStore {
  fileUrls: string[];
  imageUrls: string[];
  fileList: File1[];
  imageList: File1[];
  addFile: (files: File1[]) => void;
  addImage: (images: File1[]) => void;
  clear: () => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  removeFile: (file: File1) => void;
  removeImage: (file: File1) => void;
  concatFiles: () => Attachment[] | [];
}
export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      fileUrls: [],
      imageUrls: [],
      fileList: [],
      imageList: [],
      addFile: (files) => set((state) => ({ fileList: [...state.fileList, ...files] })),
      addImage: (images) => set((state) => ({ imageList: [...state.imageList, ...images] })),
      clear: () => set({ fileUrls: [], imageUrls: [], fileList: [], imageList: [] }),
      hasHydrated: false,
      setHasHydrated: (a) => set({ hasHydrated: a }),
      removeFile: (file) =>
        set((state) => ({ fileList: state.fileList.filter((item) => item !== file) })),
      removeImage: (file) =>
        set((state) => ({ imageList: state.imageList.filter((item) => item !== file) })),
      concatFiles: () => {
        const { fileList, imageList } = get();
        const res: Attachment[] = [];
        if (fileList.length < 0 && imageList.length < 0) return res;
        if (fileList.length > 0) {
          fileList.forEach((i) => {
            res.push({
              url: i.url,
              fileType: i.fileType || 'file',
              fileName: i.fileName,
            });
          });
        }
        if (imageList.length > 0) {
          imageList.forEach((i) => {
            res.push({
              url: i.url,
              fileType: i.fileType || 'image',
              fileName: i.fileName,
            });
          });
        }
        return res;
      },
    }),
    {
      name: 'file-store',
      partialize: (state) => ({
        fileList: state.fileList,
        imageList: state.imageList,
      }),
      /*  onRehydrateStorage: (state) => {
        // 读取本地存储的原始数据
        const stored = localStorage.getItem('file-store');
        console.log('本地缓存原始值:', stored);
        return (hydratedState, error) => {
          if (error) console.error('持久化加载失败', error);
          console.log('水合完成，加载到的数据:', hydratedState);
          state.setHasHydrated(true);
        };
      }, */
    }
  )
);
