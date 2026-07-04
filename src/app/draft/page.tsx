'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
export default function Draft() {
  const [file, setFile] = useState<File | null>(null);
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = e.target.files?.[0];
    if (!targetFile) return;
    setFile(targetFile);
    console.log('上传文件:', targetFile);
    const formData = new FormData();
    formData.append('file', targetFile);
    const res = await fetch('/api/common/upload', {
      method: 'POST',
      body: formData,
    });
    console.log('上传结果:', await res.json());
  };
  return (
    <div>
      <h1>草稿箱</h1>
      <Button size="sm" variant="outline" className="relative overflow-hidden">
        上传图片
        <Input
          className="absolute inset-0   opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleChange}
          type="file"
        />
      </Button>{' '}
    </div>
  );
}
