export const MODEL_PROVIDER_MAP: Record<string, { baseURL: string; apiKey: string }> = {
  // 阿里云百炼系列
  'qwen3.6-flash': {
    baseURL: process.env.BAILIAN_BASE_URL!,
    apiKey: process.env.BAILIAN_API_KEY!,
  },
  'qwen3-vl-flash': {
    baseURL: process.env.BAILIAN_BASE_URL!,
    apiKey: process.env.BAILIAN_API_KEY!,
  },
  'qwen3-vl-plus': {
    baseURL: process.env.BAILIAN_BASE_URL!,
    apiKey: process.env.BAILIAN_API_KEY!,
  },
  // DeepSeek
  'deepseek-v3': {
    baseURL: process.env.DEEPSEEK_BASE_URL!,
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
  'deepseek-r1': {
    baseURL: process.env.DEEPSEEK_BASE_URL!,
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
  'z-image-turbo': {
    baseURL: process.env.BAILIAN_IMAGE_BASE_URL!,
    apiKey: process.env.BAILIAN_IMAGE_API_KEY!,
  },
};
export const MODEL_LIST = [
  { label: '通义千问', value: 'qwen3.6-flash' },
  { label: '通义视觉', value: 'qwen3-vl-flash' },
  { label: '通义视觉plus', value: 'qwen3-vl-plus' },
  { label: 'DeepSeek V3', value: 'deepseek-v3' },
  { label: 'DeepSeek R1(深度思考)', value: 'deepseek-r1' },
  { label: 'ZSeek Image Turbo', value: 'z-image-turbo' },
];
export const MODEL_CAPABILITIES = {
  'o3-mini': { reasoningEffort: true },
  'deepseek-r1': { reasoningEffort: false, defaultThinking: true },
  'qwq-plus': { reasoningEffort: false, enableThinking: true },
  'gpt-4o': { reasoningEffort: false },
  'qwen-max': { reasoningEffort: false },
  'deepseek-chat': { reasoningEffort: false },
};
