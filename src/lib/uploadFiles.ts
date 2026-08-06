export type UploadedItem = {
  url: string;
  fileType: string;
  fileName: string;
  size?: number;
};

/**
 * 上传图片或文件到 `/api/bff/common/upload`，并将后端返回的每一项与原始 File 按索引对齐，
 * 从而捕获文件大小（后端响应不含 size）。
 * @param files 待上传的 File 列表
 * @param kind 'image' → 上传到 image 字段 / imageCollection；'file' → file 字段 / fileCollection
 * @throws 全部为空文件或上传失败时抛出
 */
export async function uploadFiles(files: File[], kind: 'image' | 'file'): Promise<UploadedItem[]> {
  if (!files.length) return [];
  // 过滤空文件：后端会跳过 0 字节文件并返回「请选择文件或图片」
  const validFiles = files.filter((f) => f.size > 0);
  if (validFiles.length === 0) {
    throw new Error('文件内容为空，请选择有内容的文件');
  }
  const formData = new FormData();
  validFiles.forEach((f) => formData.append(kind === 'image' ? 'image' : 'file', f));

  const res = await fetch('/api/bff/common/upload', { method: 'POST', body: formData });
  const data = await res.json().catch(() => null);
  const key = kind === 'image' ? 'imageCollection' : 'fileCollection';
  const collection = data?.data?.[key];

  if (!res.ok || !Array.isArray(collection)) {
    throw new Error(data?.msg || '上传失败');
  }

  // 后端按提交顺序返回，与 validFiles 索引一一对应
  return collection.map((item: any, index: number) => ({
    url: item.url,
    fileType: item.fileType,
    fileName: item.fileName || validFiles[index]?.name || '未命名文件',
    size: validFiles[index]?.size,
  }));
}
