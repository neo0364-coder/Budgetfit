import Anthropic from '@anthropic-ai/sdk';
import { BetaMessageStream } from '@anthropic-ai/sdk/lib/BetaMessageStream';
import type { BetaMessage } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { ChatMessage, CoachContext } from '../types';
import { COACH_API_URL, type CoachMode } from './coachConfig';
import { buildCoachRequest } from './coachRequest';

export class AiError extends Error {}

function toReply(message: BetaMessage): ChatMessage {
  if (message.stop_reason === 'refusal') {
    throw new AiError('이 질문에는 답변할 수 없어요. 질문을 바꿔서 다시 시도해 주세요.');
  }
  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return { role: 'assistant', text, blocks: message.content as unknown[] };
}

async function viaServer(context: CoachContext, history: ChatMessage[], onText: (d: string) => void, signal?: AbortSignal) {
  let res: Response;
  try {
    res = await fetch(COACH_API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ context, messages: history }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw new AiError('응답을 중단했어요.');
    throw new AiError('AI 코치 서버에 연결할 수 없어요.', { cause: err });
  }
  if (!res.ok || !res.body) {
    let msg = `AI 코치 서버 오류(${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) msg = data.error;
    } catch {
      // 본문이 JSON이 아니면 기본 문구
    }
    throw new AiError(msg);
  }
  const stream = BetaMessageStream.fromReadableStream(res.body);
  stream.on('text', onText);
  try {
    return toReply(await stream.finalMessage());
  } catch (err) {
    if (err instanceof AiError) throw err;
    if (signal?.aborted) throw new AiError('응답을 중단했어요.');
    throw new AiError('응답을 받는 중에 연결이 끊겼어요.', { cause: err });
  }
}

async function viaKey(apiKey: string, context: CoachContext, history: ChatMessage[], onText: (d: string) => void, signal?: AbortSignal) {
  // 키는 이 기기의 localStorage에만 저장되고 Anthropic API로 직접 전송된다
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    const stream = client.beta.messages.stream(buildCoachRequest(context, history, { effort: 'medium' }), { signal });
    stream.on('text', onText);
    return toReply(await stream.finalMessage());
  } catch (err) {
    if (err instanceof AiError) throw err;
    if (err instanceof Anthropic.APIUserAbortError) throw new AiError('응답을 중단했어요.');
    if (err instanceof Anthropic.AuthenticationError) throw new AiError('API 키가 올바르지 않아요. 내 정보에서 키를 확인해 주세요.');
    if (err instanceof Anthropic.PermissionDeniedError) throw new AiError('이 API 키로는 모델을 사용할 권한이 없어요.');
    if (err instanceof Anthropic.RateLimitError) throw new AiError('요청이 많아요. 잠시 후 다시 시도해 주세요.');
    if (err instanceof Anthropic.BadRequestError) throw new AiError(`요청 오류: ${err.message}`);
    if (err instanceof Anthropic.APIConnectionError) throw new AiError('네트워크에 연결할 수 없어요.');
    if (err instanceof Anthropic.APIError) throw new AiError(`서버 오류(${err.status ?? '?'}): 잠시 후 다시 시도해 주세요.`);
    throw err;
  }
}

/** 코치에게 질문하고 응답을 스트리밍한다. history의 마지막 항목은 이번 질문이어야 한다. */
export function askCoach(
  mode: Exclude<CoachMode, 'basic'>,
  apiKey: string,
  context: CoachContext,
  history: ChatMessage[],
  onText: (delta: string) => void,
  signal?: AbortSignal,
): Promise<ChatMessage> {
  return mode === 'server' ? viaServer(context, history, onText, signal) : viaKey(apiKey, context, history, onText, signal);
}
