'use client';
import { Button } from '@/components/ui/button';
import { useQuestionStore } from '@/lib/store';
import { useFileStore } from '@/lib/store/useFileStore';
import { Image, ImageUp, Send } from 'lucide-react';
import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function Tool() {
  // 创建ref绑定两个文件input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<File[]>([]);
  const [imageList, setImageList] = useState<File[]>([]);
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
  const [isFocusThink, setIsFocusThink] = useState(enableDeepThink);
  // 点击按钮触发隐藏文件框
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  const triggerImageSelect = () => {
    imageInputRef.current?.click();
  };
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((i) => {
      formData.append('image', i);
    });
    /* console.log('图片列表:', files);
    console.log('formData:', ...formData); */
    const res = await fetch('/api/common/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    console.log('图片上传结果:', data);
    fileStore.addImage(
      data.data.imageCollection.map((i) => ({
        url: i.url,
        fileType: i.fileType,
        fileName: i.fileName,
      }))
    );
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((i) => {
      formData.append('file', i);
    });
    console.log('文件列表:', files);
    const res = await fetch('/api/common/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    // console.log('文件上传结果:', data);
    fileStore.addFile(
      data.data.fileCollection.map((i) => ({
        url: i.url,
        fileType: i.fileType,
        fileName: i.fileName,
      }))
    );
  };
  return (
    <div className="w-full h-full px-2 flex flex-row items-center justify-between gap-2">
      {/* 左侧上传区域 */}
      <div className="flex flex-row items-center gap-1">
        {/* 文件上传 */}
        <div
          onClick={triggerFileSelect}
          className="flex flex-row items-center gap-1.5 py-1.5 px-3 hover:bg-gray-100 rounded-md cursor-pointer text-black transition-colors"
        >
          <ImageUp size={18} />
          <span className="text-[14px]">文件上传</span>
          <input
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
            className="hidden inset-0 cursor-pointer"
          />
        </div>

        {/* 图片上传 */}
        <div
          onClick={triggerImageSelect}
          className="flex flex-row items-center gap-1.5 py-1.5 px-3 hover:bg-gray-100 rounded-md cursor-pointer text-black transition-colors"
        >
          <Image size={18} />
          <span className="text-[14px]">图片上传</span>
          <input
            onChange={handleImageChange}
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden inset-0 cursor-pointer"
          />
        </div>
        <div
          className={` flex flex-row items-center gap-1.5 py-1.5 px-3 hover:bg-gray-100 rounded-md cursor-pointer text-black transition-colors 
            ${isFocusThink ? 'bg-white   hover:bg-gray-50  ring-blue-400' : 'text-black'}
            `}
          onClick={(e) => {
            e.stopPropagation();
            setEnableDeepThink(true);
            setIsFocusThink(!isFocusThink);
          }}
        >
          <span className={`text-[14px] ${isFocusThink ? 'text-blue-400   ' : 'text-black'}`}>
            深度思考
          </span>
        </div>
      </div>

      {/* 右侧发送按钮 */}
      <Button className="flex flex-row items-center gap-1.5 py-1.5 px-4   cursor-pointer transition-colors">
        <Send size={18} />
        <span className="text-[14px]">发送</span>
      </Button>
    </div>
  );
}
