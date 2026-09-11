'use client';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/lib/store/useFileStore';
import { useQuestionStore } from '@/lib/store/useQuestionStore';
import { uploadFiles } from '@/lib/uploadFiles';
import { Image, ImageUp, Send } from 'lucide-react';
import type { ChangeEvent } from 'react';

import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export default function Tool() {
  const fileStore = useFileStore(
    useShallow((state) => ({
      addImage: state.addImage,
      addFile: state.addFile,
      removeImage: state.removeImage,
      removeFile: state.removeFile,
      fileList: state.fileList,
      imageList: state.imageList,
    }))
  );
  const { setEnableDeepThink, enableDeepThink } = useQuestionStore(
    useShallow((state) => ({
      setEnableDeepThink: state.setEnableDeepThink,
      enableDeepThink: state.enableDeepThink,
    }))
  );

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    // 先用 Array.from 快照文件数组（FileList 是活引用，清空 value 会把它一起清掉）
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    try {
      const uploaded = await uploadFiles(files, 'image');
      fileStore.addImage(uploaded);
    } catch (err) {
      console.error('图片上传失败:', err);
      toast.error((err as Error).message || '图片上传失败');
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    try {
      const uploaded = await uploadFiles(files, 'file');
      fileStore.addFile(uploaded);
    } catch (err) {
      console.error('文件上传失败:', err);
      toast.error((err as Error).message || '文件上传失败');
    }
  };

  return (
    <div className="w-full h-full flex flex-row items-center justify-between gap-2">
      {/* 左侧上传区域 */}
      <div className="flex flex-row items-center gap-1">
        {/* 文件上传：label 原生触发，不依赖 JS .click() */}
        <label className="flex flex-row items-center gap-1.5 py-1.5 px-2 hover:bg-accent rounded-md cursor-pointer text-foreground transition-colors">
          <ImageUp size={18} />
          <span className="text-[14px]">文件上传</span>
          <input
            onChange={handleFileChange}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
            className="hidden"
          />
        </label>

        {/* 图片上传：label 原生触发，不依赖 JS .click() */}
        <label className="flex flex-row items-center gap-1.5 py-1.5 px-2 hover:bg-accent rounded-md cursor-pointer text-foreground transition-colors">
          <Image size={18} />
          <span className="text-[14px]">图片上传</span>
          <input
            onChange={handleImageChange}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
          />
        </label>
        <div
          className={`flex flex-row items-center gap-1.5 py-1.5 px-2 hover:bg-accent rounded-md cursor-pointer text-foreground transition-colors ${
            enableDeepThink ? 'bg-card ring-1 ring-blue-400/60' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setEnableDeepThink(!enableDeepThink);
          }}
        >
          <span className={`text-[14px] ${enableDeepThink ? 'text-blue-500' : ''}`}>深度思考</span>
        </div>
      </div>

      {/* 右侧发送按钮 */}
      <Button className="flex flex-row items-center gap-1.5 py-1.5 px-4 cursor-pointer transition-colors">
        <Send size={18} />
        <span className="text-[14px]">发送</span>
      </Button>
    </div>
  );
}
