import { toOrderNote } from '@/lib/operations';

interface OrderNoteProps {
  /** Catatan mentah dari BE. Dirender sebagai teks biasa (child teks React): tidak pernah sebagai HTML. */
  comments: string | null;
}

/**
 * Catatan order, dipotong 160 karakter. Bila terpotong, teks lengkap tersedia
 * lewat `title` (kursor) dan teks `sr-only` (pembaca layar); versi terpotong
 * disembunyikan dari pembaca layar agar tidak dibaca dua kali.
 */
export function OrderNote({ comments }: OrderNoteProps) {
  const note = toOrderNote(comments);

  if (!note) {
    return (
      <span className="text-[13px] text-ink-faint">
        <span aria-hidden="true">--</span>
        <span className="sr-only">Tanpa catatan</span>
      </span>
    );
  }

  if (!note.truncated) {
    return <span className="min-w-0 text-[13px] break-words text-ink-soft">{note.text}</span>;
  }

  return (
    <span className="min-w-0 text-[13px] break-words text-ink-soft">
      <span aria-hidden="true" title={note.full}>
        {note.text}
      </span>
      <span className="sr-only">{note.full}</span>
    </span>
  );
}
