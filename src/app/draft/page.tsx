'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
export default function Draft() {
  const [file, setFile] = useState<File | null>(null);
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = e.target.files?.[0];
    if (!targetFile) return;
    const MAX_SIZE = 1024 * 1024 * 8;
    if (targetFile.size > MAX_SIZE) {
      toast.error('文件过大，请上传小于8MB的文件');
      return;
    }
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
  const router = useRouter();
  router.push('/draft/123');
  return (
    <div>
      <h1>草稿箱</h1>
      <Button size="sm" variant="outline" className="relative overflow-hidden">
        上传图片
        <Input
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z"
          className="absolute inset-0   opacity-0 cursor-pointer"
          onChange={handleChange}
          type="file"
        />
      </Button>{' '}
    </div>
  );
}
