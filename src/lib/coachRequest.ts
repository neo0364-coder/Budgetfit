import type { BetaContentBlockParam, BetaMessageParam, MessageCreateParamsBase } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { ChatMessage, CoachContext } from '../types';
import { buildSystemPrompt } from './coachPrompt';

export const DEFAULT_MODEL = 'claude-opus-5-5';

/** 서버 측 거절 폴백(fallbacks: "default")을 지원하는 모델 */
const FALLBACK_MODELS = ['claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-sonnet-5-5'];

/**
 * 코치 요청 본문. 앱(내 API 키 모드)과 AI 코치 서버가 같은 함수를 써서
 * 시스템 프롬프트와 대화 기록이 매번 같은 모양으로 만들어지게 한다.
 * (이전 응답의 content 블록을 그대로 다시 보내야 thinking 블록이 유효하다)
 */
export function buildCoachRequest(
  context: CoachContext,
  history: ChatMessage[],
  options: { model?: string; effort?: 'low' | 'medium' | 'high'; maxTokens?: number } = {},
): MessageCreateParamsBase {
  const model = options.model ?? DEFAULT_MODEL;
  const messages: BetaMessageParam[] = history.map((m) =>
    m.role === 'assistant' && m.blocks
      ? { role: 'assistant', content: m.blocks as BetaContentBlockParam[] }
      : { role: m.role, content: m.text },
  );
  return {
    model,
    max_tokens: options.maxTokens ?? 8000,
    output_config: { effort: options.effort ?? 'low' },
    // 시스템 프롬프트와 지난 대화를 캐시해서 비용을 줄인다
    cache_control: { type: 'ephemeral' },
    ...(FALLBACK_MODELS.includes(model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    system: buildSystemPrompt(context),
    messages,
  };
}
