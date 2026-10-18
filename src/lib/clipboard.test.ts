import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from './clipboard';

// Vitest berjalan di lingkungan node: tidak ada DOM, jadi jalur cadangan
// (textarea + execCommand) hanya diuji bagian "tidak tersedia".
afterEach(() => vi.unstubAllGlobals());

// Kode memeriksa document.activeElement instanceof HTMLElement; node tidak punya kelas itu.
const stubHtmlElement = () => vi.stubGlobal('HTMLElement', class {});

describe('copyText', () => {
  it('memakai Clipboard API bila tersedia', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await expect(copyText('https://axon.test/?year=2004')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('https://axon.test/?year=2004');
  });

  it('izin ditolak dan tidak ada DOM -> false, tanpa melempar error', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) } });
    vi.stubGlobal('document', undefined);
    await expect(copyText('x')).resolves.toBe(false);
  });

  it('Clipboard API tidak ada (konteks tidak aman) dan tidak ada DOM -> false', async () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', undefined);
    await expect(copyText('x')).resolves.toBe(false);
  });

  it('jalur cadangan execCommand: berhasil bila browser menyalin, textarea dibersihkan', async () => {
    const area = { value: '', readOnly: false, tabIndex: 0, className: '', select: vi.fn(), remove: vi.fn() };
    const document = {
      body: { appendChild: vi.fn() },
      activeElement: null,
      createElement: vi.fn().mockReturnValue(area),
      execCommand: vi.fn().mockReturnValue(true),
    };
    vi.stubGlobal('navigator', {});
    stubHtmlElement();
    vi.stubGlobal('document', document);
    await expect(copyText('tautan')).resolves.toBe(true);
    expect(area.value).toBe('tautan');
    expect(area.className).toBe('sr-only');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(area.remove).toHaveBeenCalled();
  });

  it('jalur cadangan: execCommand melempar error -> false', async () => {
    const area = { select: vi.fn(), remove: vi.fn() };
    vi.stubGlobal('navigator', {});
    stubHtmlElement();
    vi.stubGlobal('document', {
      body: { appendChild: vi.fn() },
      activeElement: null,
      createElement: vi.fn().mockReturnValue(area),
      execCommand: vi.fn().mockImplementation(() => {
        throw new Error('tidak didukung');
      }),
    });
    await expect(copyText('x')).resolves.toBe(false);
    expect(area.remove).toHaveBeenCalled();
  });
});
