/**
 * Mock LLM Service
 * For development and testing before actual LLM integration
 */

import type {
  LLMService,
  GenerateRequest,
  GenerateResponse,
  StreamCallback,
  ModelAvailability,
  DownloadProgressCallback,
} from './types';

/**
 * Pattern-based response templates
 */
const RESPONSE_PATTERNS: Array<{
  patterns: string[];
  responses: string[];
}> = [
  {
    patterns: ['つらい', '難しい', 'きつい', '苦しい'],
    responses: [
      'その気持ち、よく分かります。少しずつでいいんですよ。今日、何か小さな一歩を踏み出せたことはありますか？',
      '大変でしたね。無理しないでくださいね。今、どんな気持ちですか？',
      'そういう日もありますよね。自分を責めないでください。',
    ],
  },
  {
    patterns: ['開いて', '見てしまった', '使って'],
    responses: [
      'なるほど、開いてしまったんですね。でも、こうして話してくれていること自体が大きな一歩です。何がきっかけで開きたくなりましたか？',
      'そうだったんですね。開いた後、どんな気持ちでしたか？',
      'それでも気づけたことが大切です。次はどうしたいですか？',
    ],
  },
  {
    patterns: ['できた', '成功', 'やった', '我慢'],
    responses: [
      'すごい！その調子です。小さな成功を積み重ねることが大切ですね。どんな気持ちですか？',
      '素晴らしいですね！その成功体験を覚えておいてください。',
      'よく頑張りましたね！自分を褒めてあげてください。',
    ],
  },
  {
    patterns: ['暇', '退屈', 'やることない'],
    responses: [
      '退屈な時って、つい開きたくなりますよね。代わりに何かやってみたいことはありますか？',
      '暇な時間をどう過ごすか、一緒に考えましょう。何か興味のあることはありますか？',
      '退屈は開くきっかけになりやすいですね。何か新しいことを試してみませんか？',
    ],
  },
  {
    patterns: ['寝れない', '眠れない', '夜'],
    responses: [
      '夜は特に開きたくなりますよね。寝る前のルーティンを作ってみませんか？',
      '睡眠の質に影響しますよね。寝る1時間前からスマホを見ない工夫をしてみましょうか？',
      '夜の時間の過ごし方、一緒に考えましょう。',
    ],
  },
  {
    patterns: ['どうすれば', 'どうしたら', 'アドバイス'],
    responses: [
      'まず、どんな時に開きたくなるか、パターンを見つけることから始めましょう。何か気づいていることはありますか？',
      '具体的にどんな場面で困っていますか？もう少し教えてください。',
      'いくつかのステップで進めていきましょう。まず、今の状況を教えてください。',
    ],
  },
];

/**
 * Default responses when no pattern matches
 */
const DEFAULT_RESPONSES = [
  'もう少し教えてもらえますか？',
  'その気持ち、大切にしてくださいね。',
  '一緒に考えていきましょう。',
  'それは大変でしたね。どうしたいですか？',
  'なるほど、続けてください。',
  'どんな時にそう感じますか？',
];

/**
 * Get random item from array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Find matching response based on input patterns
 */
function findMatchingResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  for (const { patterns, responses } of RESPONSE_PATTERNS) {
    if (patterns.some((pattern) => lowerInput.includes(pattern))) {
      return randomChoice(responses);
    }
  }

  return randomChoice(DEFAULT_RESPONSES);
}

/**
 * Simulate typing delay (for realistic feel)
 */
async function simulateTyping(
  text: string,
  onChunk: StreamCallback
): Promise<void> {
  const words = text.split(' ');

  for (let i = 0; i < words.length; i++) {
    // Random delay between 30-80ms per word
    await new Promise((resolve) =>
      setTimeout(resolve, 30 + Math.random() * 50)
    );
    onChunk(words[i] + (i < words.length - 1 ? ' ' : ''), false);
  }

  onChunk('', true);
}

/**
 * Mock LLM Service implementation
 */
export class MockLLMService implements LLMService {
  provider = 'mock' as const;
  private isLoaded = false;
  private abortController: AbortController | null = null;

  async checkAvailability(): Promise<ModelAvailability> {
    // Mock is always available
    return { available: true };
  }

  async downloadModel(onProgress?: DownloadProgressCallback): Promise<void> {
    // Simulate download progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      onProgress?.(i);
    }
  }

  async loadModel(): Promise<void> {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.isLoaded = true;
  }

  async unloadModel(): Promise<void> {
    this.isLoaded = false;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const startTime = Date.now();

    // Get last user message
    const lastMessage = request.messages.filter((m) => m.role === 'user').pop();
    const content = findMatchingResponse(lastMessage?.content || '');

    // Simulate generation delay (50-150ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 50 + Math.random() * 100)
    );

    return {
      content,
      tokensUsed: Math.ceil(content.length / 2.5),
      generationTimeMs: Date.now() - startTime,
    };
  }

  async generateStream(
    request: GenerateRequest,
    onChunk: StreamCallback
  ): Promise<void> {
    this.abortController = new AbortController();

    // Get last user message
    const lastMessage = request.messages.filter((m) => m.role === 'user').pop();
    const content = findMatchingResponse(lastMessage?.content || '');

    try {
      await simulateTyping(content, onChunk);
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        onChunk('', true);
        return;
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  abort(): void {
    this.abortController?.abort();
  }
}

// Singleton instance
let mockLLMInstance: MockLLMService | null = null;

export function getMockLLM(): MockLLMService {
  if (!mockLLMInstance) {
    mockLLMInstance = new MockLLMService();
  }
  return mockLLMInstance;
}
