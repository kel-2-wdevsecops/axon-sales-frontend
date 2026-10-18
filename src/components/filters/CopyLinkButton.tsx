import { useEffect, useState } from 'react';
import { copyText } from '@/lib/clipboard';
import { CheckIcon, LinkIcon } from './FilterIcons';

type CopyState = { kind: 'idle' } | { kind: 'copied' } | { kind: 'failed'; url: string };

const COPIED_VISIBLE_MS = 2500;

interface CopyLinkButtonProps {
  /** Dipanggil saat klik, supaya tautan selalu mencerminkan filter terbaru. */
  getUrl: () => string;
}

/**
 * Menyalin tautan tampilan sekarang. Bila clipboard tidak bisa dipakai
 * (mis. halaman HTTP biasa atau izin ditolak), tautan ditampilkan di kolom
 * baca-saja yang langsung terpilih supaya bisa disalin dengan Ctrl+C.
 */
export function CopyLinkButton({ getUrl }: CopyLinkButtonProps) {
  const [state, setState] = useState<CopyState>({ kind: 'idle' });

  useEffect(() => {
    if (state.kind !== 'copied') return;
    const timer = setTimeout(() => setState({ kind: 'idle' }), COPIED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    const url = getUrl();
    setState((await copyText(url)) ? { kind: 'copied' } : { kind: 'failed', url });
  }

  const copied = state.kind === 'copied';

  return (
    <div className="flex min-w-0 flex-col items-stretch gap-1.5">
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink-soft hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        {copied ? 'Tautan disalin' : 'Salin tautan'}
      </button>
      {state.kind === 'failed' && (
        <input
          type="text"
          readOnly
          value={state.url}
          aria-label="Tautan untuk disalin manual"
          onFocus={(event) => event.currentTarget.select()}
          className="h-9 w-full min-w-0 rounded-lg border border-line bg-surface px-2.5 text-[12px] text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-72"
        />
      )}
      <span role="status" className="sr-only">
        {copied && 'Tautan disalin ke clipboard.'}
        {state.kind === 'failed' && 'Tautan tidak bisa disalin otomatis. Salin dari kolom yang muncul.'}
      </span>
    </div>
  );
}
