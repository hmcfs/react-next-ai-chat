'use client';

import { formatFileSize } from '@/lib/format';
import { IMAGE_TYPES } from '@share/constants/file-types';
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

          return (
            <div
              key={`${attachment.url}-${index}`}
              className="group relative flex max-w-[220px] cursor-pointer items-center gap-2.5 rounded-xl border border-border p-2 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              {image ? (
                <button
                  type="button"
                  onClick={() => setPreviewImage(attachment)}
                  className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent"
                  aria-label={`预览图片：${fileName}`}
                >
                  <img src={attachment.url} alt={fileName} className="h-full w-full object-cover" />
                </button>
              ) : (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"
                  title={`打开文件：${fileName}`}
                >
                  <Icon className="size-5" />
                </a>
              )}
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-foreground">{fileName}</span>
                {attachment.size != null && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </span>
                )}
              </span>
            </div>
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
