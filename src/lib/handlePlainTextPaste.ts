/**
 * 纯文本粘贴处理器
 * 阻止默认粘贴行为，只插入纯文本，丢弃所有 HTML 标签和样式
 *
 * @param e - ClipboardEvent 事件对象
 * @param fallbackHandler - 可选的备用处理器（如文件上传），当剪贴板包含文件时调用
 */
export function handlePlainTextPaste(e: ClipboardEvent, fallbackHandler?: () => void): void {
  // 检查是否有文件
  const items = e.clipboardData?.items;
  if (items) {
    const hasFile = Array.from(items).some((it) => it.kind === 'file');
    if (hasFile) {
      fallbackHandler?.();
      return;
    }
  }

  // 纯文本粘贴：阻止默认行为，只插入纯文本
  e.preventDefault();
  const text = e.clipboardData?.getData('text/plain') || '';
  const selection = window.getSelection();

  if (selection?.rangeCount) {
    const range = selection.getRangeAt(0);
    range.deleteContents();

    // 将文本按换行符分割，每行用 <br> 分隔
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line) {
        range.insertNode(document.createTextNode(line));
      }
      if (index < lines.length - 1) {
        range.insertNode(document.createElement('br'));
      }
    });

    // 光标移到末尾
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
