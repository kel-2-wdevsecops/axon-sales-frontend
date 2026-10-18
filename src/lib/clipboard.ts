/**
 * Salin teks ke clipboard. Urutan: Clipboard API (hanya ada di konteks aman:
 * HTTPS/localhost), lalu `execCommand('copy')` lewat textarea sementara.
 * Mengembalikan false bila keduanya gagal; pemanggil menampilkan tautannya
 * agar bisa disalin manual. Tidak pernah melempar error.
 *
 * Textarea sementara disembunyikan dengan kelas `sr-only` (bukan gaya inline),
 * jadi tetap lolos CSP `style-src 'self'`.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Izin ditolak atau dokumen tidak fokus: coba jalur cadangan.
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false;
  const area = document.createElement('textarea');
  area.value = text;
  area.readOnly = true;
  area.tabIndex = -1;
  area.className = 'sr-only';
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  document.body.appendChild(area);
  try {
    area.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
    previous?.focus();
  }
}
