import type { Content } from '@/types/chat.type';

export const SUMMARY_THRESHOLD = 3; // 总消息数超过此值触发首次压缩
export const COMPRESS_TRIGGER_COUNT = 5; // lastCompressedMsgId 之后新增多少条触发增量压缩

/** 纯 JS 估算 token 数（cl100k_base ≈ 中英文混合 1 token / 1.5 char） */
function estimateTokens(text: string): number {
  let tokens = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 0x80) tokens += 0.25; // ASCII
    else if (code >= 0x4E00 && code <= 0x9FFF) tokens += 0.65; // CJK
    else tokens += 0.4; // other unicode
  }
  return Math.ceil(tokens);
}

export function countTokens(contents: Content[]): number {
  let tokens = 0;
  for (const c of contents) {
    tokens += 4; // per-message overhead
    if (c.type === 'text') tokens += estimateTokens(c.text);
  }
  return tokens;
}

export function validContextSize(contents: Content[]): Content[] {
  const clone = [...contents];
  let currentToken = countTokens(clone);
  while (currentToken > 8192) {
    const idx = clone.findIndex((i) => i.type === 'text');
    if (idx === -1) break;
    const removed = clone.splice(idx, 1)[0] as { type: 'text'; text: string };
    currentToken -= 4 + estimateTokens(removed.text);
  }
  return clone;
}

/**
 * 生成或更新对话摘要
 * @param oldSummary 已有摘要（空串表示首次生成）
 * @param newContent 新的对话内容（纯文本数组）
 * @returns 合并后的新摘要
 */
export async function updateSummary(
  oldSummary: string,
  newContent: string[]
): Promise<string> {
  const newContentStr = newContent.join('\n');
  const prompt = oldSummary
    ? `以下是之前的对话摘要:\n${oldSummary}\n\n以下是新的对话记录:\n${newContentStr}\n\n请将以上所有内容合并压缩为一份简洁的新摘要，保留关键信息、决策和用户偏好。只输出摘要内容，不要任何前缀。`
    : `请将以下对话压缩为简洁摘要，保留关键信息、决策和用户偏好。只输出摘要内容，不要任何前缀。\n\n${newContentStr}`;

  try {
    const res = await fetch(`${process.env.BAILIAN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BAILIAN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3.6-flash',
        messages: [
          { role: 'system', content: '你是对话摘要压缩助手，输出精简、信息完整的对话总结' },
          { role: 'user', content: prompt },
        ],
        stream: false,
        temperature: 0.3,
      }),
    });
    if (!res.ok) {
      throw new Error(`摘要接口请求失败: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return (data.choices?.[0]?.message?.content || oldSummary).trim();
  } catch (err) {
    console.error('[Summary] 生成摘要失败:', err);
    return oldSummary;
  }
}
