// Aliyun Bailian (DashScope) OpenAI-compatible chat client.
// Supports normal + streaming completions, with adjustable timeout for fast UX.

const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL = 'qwen-turbo';
const DEFAULT_TIMEOUT_MS = 60_000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  jsonMode?: boolean;
  model?: string;
  timeoutMs?: number;
}

function buildBody(opts: ChatOptions, stream: boolean): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: opts.model ?? DEFAULT_MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    stream,
  };
  if (opts.jsonMode) body.response_format = { type: 'json_object' };
  return body;
}

async function postChat(opts: ChatOptions, stream: boolean): Promise<Response> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY missing');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildBody(opts, stream)),
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Bailian API error (${res.status}): ${errText.slice(0, 300)}`);
  }
  return res;
}

export async function chatWithBailian(options: ChatOptions): Promise<string> {
  const res = await postChat(options, false);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Bailian API empty response');
  return content;
}

/**
 * Stream chat completion; returns a ReadableStream<Uint8Array> of plain
 * text deltas (not SSE), suitable for piping to the frontend via
 * `new Response(stream)`.
 */
export async function streamChatWithBailian(
  options: ChatOptions
): Promise<ReadableStream<Uint8Array>> {
  const res = await postChat(options, true);
  if (!res.body) throw new Error('Bailian API stream missing body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        // OpenAI-compatible SSE: lines start with "data: " and end with "\n\n".
        const text = decoder.decode(value, { stream: true });
        for (const rawLine of text.split('\n')) {
          const line = rawLine.trim();
          if (!line || !line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta: string | undefined =
              parsed?.choices?.[0]?.delta?.content ??
              parsed?.choices?.[0]?.message?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // ignore malformed chunk
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });
}

export function hasBailianKey(): boolean {
  return !!process.env.DASHSCOPE_API_KEY;
}
