import { uploadFileToOSS } from '@/lib/oss';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as 'image' | 'file') || 'file';
    if (!file)
      return Response.json(
        {
          msg: '文件不存在',
          code: 0,
        },
        { status: 400 }
      );
    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const url = await uploadFileToOSS(buffer, file.name, type);
    return Response.json({
      msg: '上传成功',
      code: 1,
      data: { url },
    });
  } catch (e) {
    console.error('上传文件失败', e);
    return Response.json(
      {
        msg: '上传失败',
        code: 0,
      },
      { status: 500 }
    );
  }
}
