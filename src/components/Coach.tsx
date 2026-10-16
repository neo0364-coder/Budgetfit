import { useEffect, useRef, useState } from 'react';
import { AiError, askCoach } from '../lib/ai';
import { coachMode } from '../lib/coachConfig';
import { basicAnswer } from '../lib/basicCoach';
import type { ChatMessage, Conversation } from '../types';
import AskAiSheet from './AskAiSheet';

const QUICK_PROMPTS = [
  '💰 식비를 더 줄이고 싶어',
  '🥚 계란이랑 두부밖에 없어. 뭐 만들지?',
  '🏪 편의점에서 뭐 먹지?',
  '😣 무릎이 아파',
  '⏱ 야근이라 운동 못 했어',
  '😮‍💨 의욕이 없어',
];

interface Props {
  apiKey: string;
  conversation: Conversation;
  setConversation: (c: Conversation) => void;
  planStamp: string;
  onNewConversation: () => void;
  onToast: (msg: string) => void;
}

export default function Coach({ apiKey, conversation, setConversation, planStamp, onNewConversation, onToast }: Props) {
  const [askAi, setAskAi] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const mode = coachMode(apiKey);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [conversation.messages.length, streaming]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || streaming !== null) return;
    setError('');
    setInput('');

    const local = (note?: string): void => {
      const answer = basicAnswer(q, conversation.context);
      setConversation({
        ...conversation,
        messages: [
          ...conversation.messages,
          { role: 'user', text: q, local: true },
          { role: 'assistant', text: note ? `${note}\n\n${answer}` : answer, local: true },
        ],
      });
    };
    if (mode === 'basic') return local();

    // AI에는 기본 코치가 답한 대화를 빼고 보낸다 (AI가 본 기록은 늘 앞에서부터 그대로 유지)
    const aiHistory: ChatMessage[] = [...conversation.messages.filter((m) => !m.local), { role: 'user', text: q }];
    setConversation({ ...conversation, messages: [...conversation.messages, { role: 'user', text: q }] });
    setStreaming('');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const reply = await askCoach(mode, apiKey, conversation.context, aiHistory, (d) => setStreaming((s) => (s ?? '') + d), controller.signal);
      setConversation({ ...conversation, messages: [...conversation.messages, { role: 'user', text: q }, reply] });
    } catch (err) {
      const msg = err instanceof AiError ? err.message : '알 수 없는 오류가 발생했어요.';
      if (controller.signal.aborted) {
        setConversation({ ...conversation, messages: conversation.messages });
        setInput(q);
      } else {
        // AI가 안 되면 기본 코치가 대신 답한다
        local(`(${msg} 그래서 기본 코치가 대신 답할게요 🙂)`);
      }
      setError(controller.signal.aborted ? msg : '');
    } finally {
      setStreaming(null);
      abortRef.current = null;
    }
  };

  return (
    <div className="page coach">
      <div className="page-head">
        <div>
          <h1>코치 💬</h1>
          <p className="muted small coach-mode">
            {mode === 'basic' ? '🟢 무료 기본 코치' : '🤖 AI 코치 · 내 플랜을 알고 답해요'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn soft sm" onClick={() => setAskAi(input || '')}>
            🤖 AI 앱으로
          </button>
          <button className="btn ghost sm" onClick={onNewConversation} disabled={streaming !== null}>
            새 대화
          </button>
        </div>
      </div>
      {conversation.planStamp !== planStamp && conversation.messages.length > 0 && (
        <p className="notice info">플랜이 바뀌었어요. "새 대화"를 누르면 최신 플랜으로 상담해요.</p>
      )}

      <div className="chat">
        <div className="coach-avatar">
          <span className="face">🧑‍🏫</span>
          <div className="bubble assistant">
            안녕하세요! 이번 주 식단과 운동을 알고 있어요. 식비 줄이기, 메뉴 바꾸기, 운동 대체, 바쁜 날 대처법까지 편하게 물어보세요 😊
          </div>
        </div>
        {conversation.messages.length === 0 && streaming === null && (
          <div className="chips">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} className="chip" onClick={() => send(p.replace(/^\S+\s/, ''))}>
                {p}
              </button>
            ))}
          </div>
        )}
        {conversation.messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="bubble user">
              {m.text}
            </div>
          ) : (
            <div key={i} className="coach-avatar">
              <span className="face">🧑‍🏫</span>
              <div className="bubble assistant">
                {m.text}
                {m.local && conversation.messages[i - 1]?.role === 'user' && (
                  <button className="ask-more" onClick={() => setAskAi(conversation.messages[i - 1].text)}>
                    🤖 AI 앱에 더 자세히 물어보기
                  </button>
                )}
              </div>
            </div>
          ),
        )}
        {streaming !== null && (
          <div className="coach-avatar">
            <span className="face">🧑‍🏫</span>
            <div className="bubble assistant">{streaming || <span className="typing">생각하는 중… 💭</span>}</div>
          </div>
        )}
        {error && <p className="notice error">{error}</p>}
        <div ref={endRef} />
      </div>

      {askAi !== null && (
        <AskAiSheet
          context={conversation.context}
          initialQuestion={askAi}
          onClose={() => setAskAi(null)}
          onCopied={(msg) => {
            onToast(msg);
          }}
        />
      )}

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
          maxLength={1000}
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
            보내기
          </button>
        )}
      </form>
    </div>
  );
}
