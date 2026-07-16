import { customError } from '@/lib/error/error';
import { fail, success } from '@/lib/error/response';
import { uploadFileToOSS } from '@/lib/oss';
import { NextRequest } from 'next/server';

/* export async function POST(req: NextRequest) {
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
} */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    console.log('formData:', formData);
    const fileList = (formData.getAll('file') as File[]).filter((f) => f.size > 0);
    const imageList = (formData.getAll('image') as File[]).filter((f) => f.size > 0);
    let fileCollection: { url: string; fileType: string; fileName: string }[] = [];
    let imageCollection: { url: string; fileType: string; fileName: string }[] = [];
    console.log('上传文件:', fileList.length, imageList.length);
    if (!fileList.length && !imageList.length) throw new customError('请选择文件或图片');
    if (fileList.length > 5 || imageList.length > 5) throw new customError('最多上传5个文件或图片');
    if (fileList.length > 0) {
      const filePromise = fileList.map(async (file) => {
        const arrayBuf = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const { url, fileType, fileName } = await uploadFileToOSS(buffer, file.name, 'file');
        return { url, fileType, fileName };
      });
      fileCollection = await Promise.all(filePromise);
    }
    if (imageList.length > 0) {
      const imagePromise = imageList.map(async (image) => {
        const arrayBuf = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const { url, fileType, fileName } = await uploadFileToOSS(buffer, image.name, 'image');
        return { url, fileType, fileName };
      });
      imageCollection = await Promise.all(imagePromise);
    }
    return success({ fileCollection, imageCollection });
  } catch (e) {
    console.error('上传文件失败', e);
    return fail(e);
  }
}
