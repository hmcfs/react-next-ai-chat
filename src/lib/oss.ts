import OSS from 'ali-oss';

const ossClient = new OSS({
  region: process.env.OSS_REGION!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET_NAME!,
  secure: true,
});

/**
 * 上传文件Buffer到OSS
 * @param buffer 文件二进制
 * @param filename 原始文件名
 * @param dir 存储目录 image / file
 * @returns oss完整url
 */
export async function uploadFileToOSS(
  buffer: Buffer,
  filename: string,
  dir: 'image' | 'file'
): Promise<string> {
  // 生成唯一文件名防止重名
  const ext = filename.split('.').pop();
  const uniqueName = `${dir}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const res = await ossClient.put(uniqueName, buffer);
  return res.url;
}
