/**
 * 알뜰핏 AI 코치 서버 (Cloudflare Workers)
 *
 * 운영자의 Anthropic API 키를 서버에만 두고, 앱 사용자는 가입·키 없이 코치를 쓴다.
 * - 요청 본문은 앱의 플랜 데이터와 대화 기록뿐이며, 시스템 프롬프트는 서버가 직접 만든다
 *   (아무 글이나 Claude에 보내는 범용 프록시로 쓰이지 않게)
 * - IP별 요청 횟수 제한, 허용된 사이트(ALLOWED_ORIGINS)에서 온 요청만 받음
 * - 응답은 SDK의 스트림을 그대로 흘려보내고, 앱은 BetaMessageStream.fromReadableStream으로 읽는다
 */
import Anthropic from '@anthropic-ai/sdk';
import { InvalidRequest, cleanContext, cleanMessages } from '../src/lib/coachContext';
import { buildCoachRequest } from '../src/lib/coachRequest';

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** 쉼표로 구분한 허용 출처. 예: https://neo0364-coder.github.io */
  ALLOWED_ORIGINS: string;
  /** 기본값 claude-opus-5-5 */
  COACH_MODEL?: string;
  /** IP당 10분에 허용할 질문 수 (기본 20) */
  RATE_LIMIT?: string;
  /** 테스트용: Anthropic API 주소 바꾸기 */
  ANTHROPIC_BASE_URL?: string;
}

const WINDOW_MS = 10 * 60 * 1000;
// 워커 인스턴스마다 따로 세는 간단한 제한이다. 비용 상한은 Claude Console의 지출 한도로 꼭 함께 걸어 둔다.
const hits = new Map<string, number[]>();

function rateLimited(ip: string, limit: number, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return false;
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  const ok = origin && allowed.includes(origin);
  return {
    ...(ok ? { 'access-control-allow-origin': origin } : {}),
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
}

function json(status: number, body: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'content-type': 'application/json; charset=utf-8' } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('origin');
    const cors = corsHeaders(origin, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json(405, { error: '지원하지 않는 요청이에요.' }, cors);
    if (!cors['access-control-allow-origin']) return json(403, { error: '허용되지 않은 사이트예요.' }, cors);

    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
    if (rateLimited(ip, Number(env.RATE_LIMIT ?? 20))) {
      return json(429, { error: '질문이 많아서 잠깐 쉬어 갈게요. 10분 뒤에 다시 물어봐 주세요 🙏' }, cors);
    }

    const text = await request.text();
    if (text.length > 120_000) return json(413, { error: '대화가 너무 길어요. 새 대화를 시작해 주세요.' }, cors);

    let params;
    try {
      const body = JSON.parse(text) as { context?: unknown; messages?: unknown };
      params = buildCoachRequest(cleanContext(body.context), cleanMessages(body.messages), {
        model: env.COACH_MODEL || undefined,
        effort: 'low',
      });
    } catch (err) {
      const message = err instanceof InvalidRequest ? err.message : '요청 형식이 올바르지 않아요.';
      return json(400, { error: message }, cors);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, baseURL: env.ANTHROPIC_BASE_URL || undefined });
    try {
      const stream = client.beta.messages.stream(params);
      // 응답 헤더가 올 때까지 기다려서, API 오류는 스트림을 열기 전에 알맞은 상태 코드로 돌려준다
      await stream.withResponse();
      return new Response(stream.toReadableStream(), {
        headers: { ...cors, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      });
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return json(429, { error: '지금 이용자가 많아요. 잠시 후 다시 시도해 주세요.' }, cors);
      if (err instanceof Anthropic.BadRequestError) return json(400, { error: '대화를 처리하지 못했어요. 새 대화를 시작해 주세요.' }, cors);
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
        console.error('Anthropic 인증 오류: 서버의 ANTHROPIC_API_KEY를 확인하세요');
        return json(503, { error: 'AI 코치가 잠시 쉬고 있어요.' }, cors);
      }
      if (err instanceof Anthropic.APIError) return json(502, { error: 'AI 서버가 잠시 불안정해요. 다시 시도해 주세요.' }, cors);
      if (err instanceof Anthropic.APIConnectionError) return json(502, { error: 'AI 서버에 연결하지 못했어요.' }, cors);
      throw err;
    }
  },
};
