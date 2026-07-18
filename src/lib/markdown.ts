import { markdownToTxt } from 'markdown-to-txt';
export function markdownToText(md: string): string {
  if (!md) return '';
  return markdownToTxt(md);
}
export function markdownToPlainText(md: string): string {
  if (!md) return '';
  const text = md
    // 1. 多行代码块 ```...```
    .replace(/```[\s\S]*?```/g, '')
    // 2. 行内代码 `内容`
    .replace(/`([^`]+)`/g, '$1')
    // 3. 标题 # ## ###
    .replace(/^#{1,6}\s+/gm, '')
    // 4. 粗体 **内容**
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // 5. 斜体 *内容*
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // 6. 删除线 ~~内容~~
    .replace(/~~(.+?)~~/g, '$1')
    // 7. 链接 [文字](url) 只保留文字
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // 8. 图片 ![alt](url) 只保留alt
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1')
    // 9. 列表前缀 - / * / + / 1.
    .replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, '')
    // 10. 引用 >
    .replace(/^\s*>\s?/gm, '')
    // 11. 分割线 --- ***
    .replace(/^(\*{3,}|-{3,})$/gm, '')
    // 12. 表格竖线与分割行
    .replace(/\|/g, ' ')
    .replace(/^\s*[-:]+(\s*\|\s*[-:]+)*\s*$/gm, '')
    // 13. 清除全部 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 14. 压缩多余空行、首尾空格
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();

  return text;
}
