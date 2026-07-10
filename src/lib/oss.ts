import OSS from 'ali-oss';
import mime from 'mime-types';
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
  const type = mime.lookup(filename) || 'application/octet-stream';
  const res = await ossClient.put(uniqueName, buffer, {
    headers: {
      'Content-Type': type,
      'content-disposition': `inline;filename=${encodeURIComponent(filename)}`,
    },
  });
  /*   const previewUrl = ossClient.signatureUrl(uniqueName, {
    expires: 7 * 24 * 3600, // 7天有效期，按需调整
    response: {
      'content-disposition': `inline;filename=${encodeURIComponent(filename)}`,
      'content-type': type,
    },
  }); */
  console.log('oss', res);
  return res.url;
}
