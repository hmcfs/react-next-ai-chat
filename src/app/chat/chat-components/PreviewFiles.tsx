import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatFileSize } from '@/lib/format';
import { useFileStore } from '@/lib/store';
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  Presentation,
  FileSpreadsheet,
  FileText,
  FileVideo,
  X,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { OFFICE_EMBED } from '@/constants/preview';

function fileIcon(fileType: string) {
  const ext = (fileType || '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'ico'].includes(ext)) return FileImage;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  if (['ppt', 'pptx'].includes(ext)) return Presentation;
  if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext)) return FileArchive;
  if (['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'].includes(ext)) return FileAudio;
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return FileVideo;
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'xlsx', 'xls'].includes(ext)) return FileText;
  return File;
}

// 判断文件是否支持在线预览
function canPreview(ext: string) {
  return ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext);
}

export default function PreviewFiles() {
  const fileStore = useFileStore(
    useShallow((state) => ({
      fileList: state.fileList,
      imageList: state.imageList,
      removeImage: state.removeImage,
      removeFile: state.removeFile,
    }))
  );
  const { fileList, imageList } = fileStore;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (fileList.length === 0 && imageList.length === 0) return null;

  const removeBtn = (onRemove: () => void) => (
    <button
      type="button"
      aria-label="移除"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
      className="absolute -right-1.5 -top-1.5 z-10 flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-destructive hover:bg-accent"
    >
      <X className="size-3" />
    </button>
  );

  const handleFileClick = (file: { url: string; fileType: string }) => {
    const ext = (file.fileType || '').toLowerCase();
    if (['xls', 'xlsx', 'ppt', 'pptx', 'doc', 'docx'].includes(ext)) {
      // Office 文件用微软在线预览
      window.open(OFFICE_EMBED + encodeURIComponent(file.url), '_blank');
    } else if (canPreview(ext)) {
      // PDF、TXT 等直接在浏览器打开
      window.open(file.url, '_blank');
    } else {
      // 压缩包等触发下载
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.fileName;
      a.click();
    }
  };

  return (
    <div className="flex w-full flex-wrap gap-2 px-3 pt-3">
      {/* 图片：缩略图卡片 */}
      {imageList.map((file, index) => (
        <div
          key={`img-${index}`}
          onClick={() => setPreviewImage(file.url)}
          className="group relative flex max-w-[220px] cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-card p-2 pr-8 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent">
            <img
              src={file.url}
              alt={file.fileName}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-foreground">{file.fileName}</span>
            {file.size != null && (
              <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
            )}
          </span>
          {removeBtn(() => fileStore.removeImage(file))}
        </div>
      ))}

      {/* 文件：图标卡片 */}
      {fileList.map((file, index) => {
        const Icon = fileIcon(file.fileType);
        return (
          <div
            key={`file-${index}`}
            onClick={() => handleFileClick(file)}
            className="group relative flex max-w-[220px] cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-card p-2 pr-8 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-foreground">{file.fileName}</span>
              {file.size != null && (
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              )}
            </span>
            {removeBtn(() => fileStore.removeFile(file))}
          </div>
        );
      })}

      {/* 图片全屏预览 - 用 Portal 渲染到 body 避免父组件 CSS 限制 */}
      {previewImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <button
              type="button"
              className="fixed right-4 top-4 z-[10000] flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
            >
              <X className="size-6" />
            </button>
            <img
              src={previewImage}
              alt="预览"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </div>
  );
}