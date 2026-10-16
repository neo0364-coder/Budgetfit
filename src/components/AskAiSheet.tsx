import { useState } from 'react';
import { buildSharePrompt } from '../lib/coachPrompt';
import type { CoachContext } from '../types';
import { Sheet } from './ui';

const APPS = [
  { name: 'ChatGPT', emoji: '🟢', url: 'https://chatgpt.com/' },
  { name: 'Claude', emoji: '🟠', url: 'https://claude.ai/new' },
  { name: 'Gemini', emoji: '🔷', url: 'https://gemini.google.com/app' },
  { name: '뤼튼', emoji: '🟣', url: 'https://wrtn.ai/' },
];

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 클립보드 API가 막힌 브라우저용
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

interface Props {
  context: CoachContext;
  initialQuestion: string;
  onClose: () => void;
  onCopied: (msg: string) => void;
}

/** 내 플랜을 담은 질문을 복사해서, 이용자가 쓰는 AI 앱에 붙여넣게 한다 (비용 0원) */
export default function AskAiSheet({ context, initialQuestion, onClose, onCopied }: Props) {
  const [question, setQuestion] = useState(initialQuestion);
  const prompt = buildSharePrompt(context, question);

  return (
    <Sheet onClose={onClose}>
      <div>
        <h2>🤖 내 AI 앱에 물어보기</h2>
        <p className="muted small" style={{ margin: '6px 0 0' }}>
          내 플랜을 담은 질문이 복사돼요. AI 앱이 열리면 입력창을 길게 눌러 <b>붙여넣기</b>만 하세요. 무료 계정으로도 쓸 수 있어요.
        </p>
      </div>
      <div className="field">
        <span className="label">물어볼 내용</span>
        <textarea rows={3} value={question} maxLength={500} onChange={(e) => setQuestion(e.target.value)} placeholder="예: 이번 주 식단에서 더 아낄 방법 알려줘" />
      </div>
      <div className="options two">
        {APPS.map((a) => (
          <a
            key={a.name}
            className="option"
            href={a.url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={() => {
              void copy(prompt).then((ok) => onCopied(ok ? `📋 복사됐어요! ${a.name}에 붙여넣기 하세요` : '복사가 안 됐어요. 아래 "질문만 복사"를 눌러 주세요'));
            }}
          >
            <span className="emoji">{a.emoji}</span>
            <b>{a.name}</b>
            <span>복사하고 열기</span>
          </a>
        ))}
      </div>
      <button
        className="btn ghost block"
        onClick={() => void copy(prompt).then((ok) => onCopied(ok ? '📋 복사됐어요! 쓰는 AI 앱에 붙여넣기 하세요' : '복사가 안 됐어요'))}
      >
        질문만 복사
      </button>
      <details className="small muted">
        <summary>복사되는 내용 보기</summary>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '8px 0 0' }}>{prompt}</pre>
      </details>
      <p className="muted tiny">AI 앱에는 위 내용(나이·키·체중·식단 등)이 전달돼요. 이름은 보내지 않아요.</p>
    </Sheet>
  );
}
