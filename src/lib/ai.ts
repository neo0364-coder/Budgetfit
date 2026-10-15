import Anthropic from '@anthropic-ai/sdk';
import type { BetaContentBlockParam, BetaMessageParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { ChatMessage } from '../types';

export const MODEL = 'claude-opus-5-5';

export class AiError extends Error {}

function client(apiKey: string) {
  // 키는 사용자 기기의 localStorage에만 저장되고 Anthropic API로 직접 전송됩니다.
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

function toParams(history: ChatMessage[]): BetaMessageParam[] {
  return history.map((m) =>
    m.role === 'assistant' && m.blocks
      ? { role: 'assistant', content: m.blocks as BetaContentBlockParam[] }
      : { role: m.role, content: m.text },
  );
}

/**
 * 코치에게 질문하고 응답을 스트리밍한다.
 * history의 마지막 항목은 이번 사용자 메시지여야 한다.
 */
export async function askCoach(
  apiKey: string,
  system: string,
  history: ChatMessage[],
  onText: (delta: string) => void,
  signal?: AbortSignal,
): Promise<ChatMessage> {
  try {
    const stream = client(apiKey).beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system,
        messages: toParams(history),
      },
      { signal },
    );
    stream.on('text', onText);
    const message = await stream.finalMessage();

    if (message.stop_reason === 'refusal') {
      throw new AiError('이 질문에는 답변할 수 없어요. 질문을 바꿔서 다시 시도해 주세요.');
    }
    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return { role: 'assistant', text, blocks: message.content as unknown[] };
  } catch (err) {
    if (err instanceof AiError) throw err;
    if (err instanceof Anthropic.APIUserAbortError) throw new AiError('응답을 중단했어요.');
    if (err instanceof Anthropic.AuthenticationError) throw new AiError('API 키가 올바르지 않아요. 설정에서 키를 확인해 주세요.');
    if (err instanceof Anthropic.PermissionDeniedError) throw new AiError('이 API 키로는 모델을 사용할 권한이 없어요.');
    if (err instanceof Anthropic.RateLimitError) throw new AiError('요청이 많아요. 잠시 후 다시 시도해 주세요.');
    if (err instanceof Anthropic.BadRequestError) throw new AiError(`요청 오류: ${err.message}`);
    if (err instanceof Anthropic.APIConnectionError) throw new AiError('네트워크에 연결할 수 없어요.');
    if (err instanceof Anthropic.APIError) throw new AiError(`서버 오류(${err.status ?? '?'}): 잠시 후 다시 시도해 주세요.`);
    throw err;
  }
}

export const QUICK_PROMPTS = [
  '이번 주 식비를 더 줄이려면 어떤 메뉴를 바꾸면 좋을까?',
  '야근 때문에 운동을 못 한 날은 어떻게 보충해?',
  '편의점에서 살 수 있는 고단백 저렴한 조합 알려줘',
  '오늘 저녁 메뉴를 냉장고 재료로 바꾸고 싶어. 계란, 두부, 김치가 있어',
  '무릎이 조금 아픈데 하체 운동 대체해줘',
];
