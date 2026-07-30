// Frontend Markdown utility (BBF only keeps what the UI needs)
export function markdownToText(md: string): string {
  if (!md) return '';
  const text = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^(\*{3,}|-{3,})$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^\s*[-:]+(\s*\|\s*[-:]+)*\s*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
  return text;
}
