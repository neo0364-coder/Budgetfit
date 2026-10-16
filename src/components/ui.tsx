import { useEffect, useState, type ReactNode } from 'react';

/** 숫자 입력: 입력 중에는 문자열로 들고 있어서 지우고 다시 쓸 때 앞에 0이 남지 않는다 */
export function NumberField({
  value,
  onChange,
  unit,
  decimal,
  label,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  decimal?: boolean;
  label: string;
  min?: number;
  max?: number;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    setDraft((d) => (Number(d) === value ? d : String(value)));
  }, [value]);
  const pattern = decimal ? /^\d*\.?\d{0,1}$/ : /^\d*$/;
  return (
    <div className="input-wrap">
      <input
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        aria-label={label}
        value={draft}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const v = e.target.value.replace(',', '.');
          if (!pattern.test(v)) return;
          const cleaned = v.replace(/^0+(?=\d)/, '');
          setDraft(cleaned);
          if (cleaned !== '' && cleaned !== '.') onChange(Number(cleaned));
        }}
        onBlur={() => {
          let n = Number(draft);
          if (!draft || Number.isNaN(n)) n = value;
          if (min !== undefined) n = Math.max(min, n);
          if (max !== undefined) n = Math.min(max, n);
          setDraft(String(n));
          onChange(n);
        }}
      />
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}

export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        {children}
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ['#1fae67', '#ff7a59', '#f5b400', '#3d8bfd', '#7ddcae', '#ff9fb2'];

export function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rot: Math.random() * 360,
    })),
  );
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  );
}

export function ProgressRing({ value, size = 92, children }: { value: number; size?: number; children?: ReactNode }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#fff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, value))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}
