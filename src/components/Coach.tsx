import { useEffect, useRef, useState } from 'react';
import { AiError, QUICK_PROMPTS, askCoach } from '../lib/ai';
import type { ChatMessage, Conversation } from '../types';

interface Props {
  apiKey: string;
  setApiKey: (k: string) => void;
  conversation: Conversation;
  setConversation: (c: Conversation) => void;
  planStamp: string;
  onNewConversation: () => void;
}

export default function Coach({ apiKey, setApiKey, conversation, setConversation, planStamp, onNewConversation }: Props) {
  const [input, setInput] = useState('');
  const [keyDraft, setKeyDraft] = useState('');
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [conversation.messages.length, streaming]);

  if (!apiKey) {
    return (
      <div className="page">
        <h1>AI 코치</h1>
        <section className="card form">
          <p>
            AI 코치는 Anthropic의 Claude를 사용해요. <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Claude Console</a>
            에서 API 키를 발급받아 입력하세요.
          </p>
          <p className="muted small">키는 이 기기의 브라우저에만 저장되고 Anthropic API로 직접 전송돼요. 공용 기기에서는 사용 후 키를 삭제하세요.</p>
          <label>
            API 키
            <input type="password" value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder="sk-ant-..." autoComplete="off" />
          </label>
          <button className="btn primary" disabled={!keyDraft.trim()} onClick={() => setApiKey(keyDraft.trim())}>
            저장
          </button>
        </section>
      </div>
    );
  }

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || streaming !== null) return;
    setError('');
    setInput('');
    const history: ChatMessage[] = [...conversation.messages, { role: 'user', text: q }];
    setConversation({ ...conversation, messages: history });
    setStreaming('');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const reply = await askCoach(apiKey, conversation.system, history, (d) => setStreaming((s) => (s ?? '') + d), controller.signal);
      setConversation({ ...conversation, messages: [...history, reply] });
    } catch (err) {
      // 실패한 질문은 기록에서 빼고 입력창으로 되돌려 다시 보낼 수 있게 한다
      setConversation({ ...conversation, messages: conversation.messages });
      setInput(q);
      setError(err instanceof AiError ? err.message : '알 수 없는 오류가 발생했어요.');
    } finally {
      setStreaming(null);
      abortRef.current = null;
    }
  };

  return (
    <div className="page coach">
      <div className="section-head">
        <h1>AI 코치</h1>
        <button className="btn ghost sm" onClick={onNewConversation} disabled={streaming !== null}>
          새 대화
        </button>
      </div>
      {conversation.planStamp !== planStamp && (
        <p className="notice">플랜이나 프로필이 바뀌었어요. 새 대화를 시작하면 최신 플랜을 기준으로 상담해요.</p>
      )}

      <div className="chat">
        {conversation.messages.length === 0 && streaming === null && (
          <div className="card">
            <p>이번 주 플랜을 알고 있어요. 예산, 메뉴 교체, 운동 조정, 바쁜 날 대처법 등 무엇이든 물어보세요.</p>
            <div className="chips">
              {QUICK_PROMPTS.map((p) => (
                <button key={p} className="chip" onClick={() => send(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {conversation.messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
        {streaming !== null && <div className="bubble assistant">{streaming || <span className="typing">생각 중…</span>}</div>}
        {error && <p className="notice error">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          value={input}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="코치에게 물어보기"
        />
        {streaming !== null ? (
          <button type="button" className="btn ghost" onClick={() => abortRef.current?.abort()}>
            중단
          </button>
        ) : (
          <button className="btn primary" disabled={!input.trim()}>
            전송
          </button>
        )}
      </form>
    </div>
  );
}
