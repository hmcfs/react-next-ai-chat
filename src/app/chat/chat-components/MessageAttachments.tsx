'use client';

import { formatFileSize } from '@/lib/format';
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IMAGE_TYPES } from '@share/constants/file-types';

export type MessageAttachment = {
  url: string;
  fileType?: string;
  fileName?: string;
  minType?: string;
  size?: number;
};

 const IMAGE_EXTENSIONS = new Set(IMAGE_TYPES);
function getExtension(attachment: MessageAttachment) {
  
  const type = (attachment.fileType || attachment.minType || '').toLowerCase();
  if (type.startsWith('image/')) return type.slice('image/'.length);
  if (type && !type.includes('/')) return type.replace(/^\./, '');

  try {
    return new URL(attachment.url).pathname.split('.').pop()?.toLowerCase() || '';
  } catch {
    return '';
  }
}

function isImage(attachment: MessageAttachment) {
  const type = (attachment.fileType || attachment.minType || '').toLowerCase();
  return type.startsWith('image/') || IMAGE_EXTENSIONS.has(getExtension(attachment));
}

function getFileName(attachment: MessageAttachment) {
  if (attachment.fileName) return attachment.fileName;
  try {
    return decodeURIComponent(new URL(attachment.url).pathname.split('/').pop() || '未命名文件');
  } catch {
    return '未命名文件';
  }
}

function fileIcon(attachment: MessageAttachment) {
  const ext = getExtension(attachment);
  if (IMAGE_EXTENSIONS.has(ext)) return FileImage;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  if (['ppt', 'pptx'].includes(ext)) return Presentation;
  if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext)) return FileArchive;
  if (['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'].includes(ext)) return FileAudio;
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return FileVideo;
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return FileText;
  return File;
}

export default function MessageAttachments({ attachments }: { attachments?: MessageAttachment[] }) {
  const [previewImage, setPreviewImage] = useState<MessageAttachment | null>(null);
  const displayAttachments = attachments?.filter((attachment) => attachment.url) ?? [];

  if (!displayAttachments.length) return null;

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {displayAttachments.map((attachment, index) => {
          const image = isImage(attachment);
          const Icon = fileIcon(attachment);
          const fileName = getFileName(attachment);

          if (image) {
            return (
              <button
                key={`${attachment.url}-${index}`}
                type="button"
                onClick={() => setPreviewImage(attachment)}
                className="group relative size-20 overflow-hidden rounded-xl border border-white/25 bg-white/10 text-left shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={`预览图片：${fileName}`}
              >
                <img src={attachment.url} alt={fileName} className="size-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-1 text-xs text-white">
                  {fileName}
                </span>
              </button>
            );
          }

          return (
            <a
              key={`${attachment.url}-${index}`}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="flex max-w-60 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-2.5 py-2 text-white shadow-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              title={`打开文件：${fileName}`}
            >
              <Icon className="size-5 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm">{fileName}</span>
                {attachment.size != null && (
                  <span className="block text-xs text-white/70">{formatFileSize(attachment.size)}</span>
                )}
              </span>
            </a>
          );
        })}
      </div>

      {previewImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="图片预览"
          >
            <button
              type="button"
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={(event) => {
                event.stopPropagation();
                setPreviewImage(null);
              }}
              aria-label="关闭图片预览"
            >
              <X className="size-6" />
            </button>
            <img
              src={previewImage.url}
              alt={getFileName(previewImage)}
              className="max-h-full max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
