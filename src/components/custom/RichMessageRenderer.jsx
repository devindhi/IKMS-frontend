import { useState } from 'react';

// ─── Parsing Logic (Unchanged) ──────────────────────────────────────────────
function parseMessageParts(text) {
  const parts = [];
  let bodyLines = [];
  const TOKEN_RE = /(__META__:\{.*?\}__STEP__:\w+(?:__LABEL__:[^\n]*)?|__STEP__:\w+(?:__LABEL__:[^\n]*)?)/g;

  const flush = () => {
    const joined = bodyLines.join('\n').trim();
    if (joined) parts.push({ type: 'body', text: joined });
    bodyLines = [];
  };

  let lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) bodyLines.push(...before.split('\n'));
    lastIndex = TOKEN_RE.lastIndex;
    const token = match[1];

    const metaMatch = token.match(/^__META__:(\{.*\})__STEP__:(\w+)(?:__LABEL__:(.*))?$/);
    if (metaMatch) {
      flush();
      try {
        const meta = JSON.parse(metaMatch[1]);
        parts.push({ type: 'meta', step: metaMatch[2], label: metaMatch[3]?.trim() || metaMatch[2], meta });
      } catch { bodyLines.push(token); }
      continue;
    }

    const stepMatch = token.match(/^__STEP__:(\w+)(?:__LABEL__:(.*))?$/);
    if (stepMatch) {
      flush();
      parts.push({ type: 'step', step: stepMatch[1], label: stepMatch[2]?.trim() || stepMatch[1] });
    }
  }
  const tail = text.slice(lastIndex);
  if (tail) bodyLines.push(...tail.split('\n'));
  flush();
  return parts;
}

// ─── Sub-components (Styled with Tailwind) ───────────────────────────────────

function StepBadge({ label }) {
  return (
    <div className="flex items-center gap-2  mb-2 opacity-60">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-pulse" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">
        {label}
      </span>
    </div>
  );
}

function ResearchPlan({ meta }) {
  return (
    <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧠</span>
        <span className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">Research Plan</span>
      </div>
      {meta.plan && <p className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-4 leading-relaxed">{meta.plan}</p>}
      {meta.sub_questions?.length > 0 && (
        <div className="space-y-2">
          {meta.sub_questions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold flex items-center justify-center shadow-sm">
                {i + 1}
              </span>
              <span className="leading-snug">{q}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CitationSources({ citations }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(citations);

  return (
    <div className="my-3 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-transparent">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-2.5 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors text-xs font-medium text-neutral-600 dark:text-neutral-400"
      >
        <span className="flex items-center gap-2">📚 {entries.length} context sources</span>
        <span className="text-[10px] opacity-50 uppercase tracking-tighter">{open ? 'Close ↑' : 'View ↓'}</span>
      </button>

      {open && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 animate-in slide-in-from-top-2 duration-300">
          {entries.map(([key, c]) => (
            <div key={key} className="p-3 flex gap-3 hover:bg-neutral-50/30 dark:hover:bg-neutral-900/20">
              <span className="flex-shrink-0 h-5 px-1.5 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[9px] font-bold flex items-center justify-center font-mono uppercase">
                {key}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate font-mono">
                    {c.source?.split(/[/\\]/).pop() ?? c.source}
                  </span>
                  {c.page != null && <span className="text-[10px] text-neutral-400">p.{c.page}</span>}
                </div>
                {c.snippet && <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic line-clamp-2 mt-1">{c.snippet}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BodyText({ text, allCitations }) {
  const renderInline = (str) =>
    str.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((chunk, i) => {
      if (/^\*\*(.+)\*\*$/.test(chunk)) return <strong key={i} className="font-bold text-neutral-900 dark:text-neutral-50">{chunk.slice(2, -2)}</strong>;
      
      const citeMatch = chunk.match(/^\[(\d+)\]$/);
      if (citeMatch) {
        const n = citeMatch[1];
        const citationData = allCitations?.[n] ?? allCitations?.['C' + n];
        return (
          <sup key={i} title={citationData?.snippet} className="mx-0.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 cursor-help hover:text-neutral-900 transition-colors">
            [{n}]
          </sup>
        );
      }
      return chunk;
    });

  return (
    <div className=" leading-relaxed text-sm text-neutral-700 dark:text-neutral-300">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        
        if (/^\d+\.\s+\*\*/.test(line) || /^#{1,3}\s/.test(line)) {
          return (
            <h3 key={i} className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-6 mb-2 tracking-tight">
              {renderInline(line.replace(/^\d+\.\s+|#+\s/, ''))}
            </h3>
          );
        }

        if (/^[*\-•]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-3 pl-2">
              <span className="text-neutral-400 select-none">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export function RichAssistantMessage({ text }) {
  if (!text) return null;
  const parsed = parseMessageParts(text);
  const allCitations = {};
  parsed.forEach(p => { if (p.type === 'meta' && p.meta?.citations) Object.assign(allCitations, p.meta.citations); });

  return (
    <div className="font-sans antialiased max-w-2xl">
      {parsed.map((p, i) => {
        if (p.type === 'meta') {
          return (
            <div key={i}>
              {p.label && <StepBadge label={p.label} />}
              {(p.meta?.plan || p.meta?.sub_questions?.length) && <ResearchPlan meta={p.meta} />}
              {p.meta?.citations && Object.keys(p.meta.citations).length > 0 && <CitationSources citations={p.meta.citations} />}
            </div>
          );
        }
        if (p.type === 'step') return <StepBadge key={i} label={p.label} />;
        if (p.type === 'body') return <BodyText key={i} text={p.text} allCitations={allCitations} />;
        return null;
      })}
    </div>
  );
}