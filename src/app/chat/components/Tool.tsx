'use client';
import { useFileStore } from '@/lib/store/useFileStore';
import { Image, ImageUp, Send } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Tool() {
  // 创建ref绑定两个文件input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<File[]>([]);
  const [imageList, setImageList] = useState<File[]>([]);
  const fileStore = useFileStore((state) => state);
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
    fileStore.addImage(data.data.imageCollection.map((i) => ({ url: i.url, name: i.name })));
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
    fileStore.addFile(data.data.fileCollection.map((i) => ({ url: i.url, name: i.name })));
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
      </div>

      {/* 右侧发送按钮 */}
      <div className="flex flex-row items-center gap-1.5 py-1.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md cursor-pointer transition-colors">
        <Send size={18} />
        <span className="text-[14px]">发送</span>
      </div>
    </div>
  );
}
