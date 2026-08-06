'use client';

import { useFileStore } from '@/lib/store';
import { uploadFiles } from '@/lib/uploadFiles';
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * 返回文本域粘贴处理器：剪贴板中的图片/文件走 `/api/bff/common/upload`
 * 上传后进入待发送队列（imageList / fileList）。纯文本粘贴保持默认行为。
 */
export function useFilePaste() {
  const addImage = useFileStore((s) => s.addImage);
  const addFile = useFileStore((s) => s.addFile);

  return useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === 'file') {
          const f = it.getAsFile();
          if (f && f.size > 0) files.push(f);
        }
      }
      // 兼容部分浏览器/场景：items 为空但 files 有内容
      if (!files.length && e.clipboardData.files?.length) {
        files.push(...Array.from(e.clipboardData.files));
      }
      if (!files.length) return; // 纯文本 → 让默认粘贴继续
      e.preventDefault(); // 有文件 → 由我们处理

      const images = files.filter((f) => f.type.startsWith('image/'));
      const docs = files.filter((f) => !f.type.startsWith('image/'));
      try {
        const tasks: Promise<unknown>[] = [];
        if (images.length) tasks.push(uploadFiles(images, 'image').then((r) => addImage(r)));
        if (docs.length) tasks.push(uploadFiles(docs, 'file').then((r) => addFile(r)));
        await Promise.all(tasks);
        if (images.length) toast.success(`已添加 ${images.length} 张图片`);
        if (docs.length) toast.success(`已添加 ${docs.length} 个文件`);
      } catch (err) {
        console.error('粘贴上传失败:', err);
        toast.error('粘贴文件上传失败');
      }
    },
    [addImage, addFile]
  );
}
