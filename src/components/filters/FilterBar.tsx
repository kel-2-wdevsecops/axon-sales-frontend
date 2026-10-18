import { useId, useMemo } from 'react';
import { useDashboardFilter } from '@/hooks/useDashboardFilter';
import { translateBeMessage } from '@/lib/beMessage';
import type { FilterKey, FilterPage } from '@/lib/filters';
import { activeChips, countryChoices, summarizeFilter } from '@/lib/filterState';
import { formatMonth } from '@/lib/format';
import { describeDataRange, relevantPartialPeriods } from '@/lib/period';
import { ActiveFilterChips } from './ActiveFilterChips';
import { CopyLinkButton } from './CopyLinkButton';
import { FilterSelect, type SelectChoice } from './FilterSelect';
import { ProductLineField } from './ProductLineField';

// Bulan 1-12 dengan nama Indonesia (Intl id-ID); tetap, jadi dibuat sekali.
const MONTH_CHOICES: SelectChoice[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: formatMonth(i + 1),
}));

const asChoices = (values: readonly (string | number)[]): SelectChoice[] =>
  values.map((v) => ({ value: String(v), label: String(v) }));

interface FilterBarProps {
  /** Halaman yang memasang bilah ini; menentukan filter mana yang tampil. */
  page: FilterPage;
  /** Halaman sedang memuat ulang data (grafik lama masih tampil): tampilkan "memperbarui…". */
  updating?: boolean;
}

/**
 * Bilah filter global. Kontrol yang tampil mengikuti parameter yang berlaku di
 * `page` (PAGE_FILTER_KEYS). Semua state ada di query string URL, jadi tampilan
 * bisa dibagikan lewat "Salin tautan".
 */
export function FilterBar({ page, updating = false }: FilterBarProps) {
  const titleId = useId();
  const { filter, keys, options, optionsLoading, optionsError, refetchOptions, hasFilter, setFilter, reset, getShareUrl } =
    useDashboardFilter(page);

  const shows = (key: FilterKey) => keys.includes(key);
  const disabled = !options;

  const countries = useMemo(
    () => (options ? asChoices(countryChoices(options, filter.continent)) : []),
    [options, filter.continent],
  );
  const chips = useMemo(() => activeChips(filter), [filter]);
  const partial = useMemo(
    () => (options ? relevantPartialPeriods(filter, options.dataRange) : []),
    [options, filter],
  );
  const dataRange = options ? describeDataRange(options.dataRange) : null;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
      <h2 id={titleId} className="sr-only">
        Filter data
      </h2>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
        {shows('year') && (
          <FilterSelect
            label="Tahun"
            allLabel="Semua tahun"
            value={filter.year === undefined ? '' : String(filter.year)}
            choices={asChoices(options?.years ?? [])}
            disabled={disabled}
            onChange={(v) => setFilter({ year: v === '' ? null : Number(v) })}
          />
        )}
        {shows('month') && (
          <FilterSelect
            label="Bulan"
            allLabel="Semua bulan"
            value={filter.month === undefined ? '' : String(filter.month)}
            choices={MONTH_CHOICES}
            onChange={(v) => setFilter({ month: v === '' ? null : Number(v) })}
          />
        )}
        {shows('continent') && (
          <FilterSelect
            label="Benua"
            allLabel="Semua benua"
            value={filter.continent ?? ''}
            choices={asChoices(options?.continents ?? [])}
            disabled={disabled}
            // Negara yang bukan bagian benua baru dibuang oleh normalisasi di setFilter.
            onChange={(v) => setFilter({ continent: v === '' ? null : v })}
          />
        )}
        {shows('country') && (
          <FilterSelect
            label="Negara"
            allLabel={filter.continent ? `Semua negara di ${filter.continent}` : 'Semua negara'}
            value={filter.country ?? ''}
            choices={countries}
            disabled={disabled}
            onChange={(v) => setFilter({ country: v === '' ? null : v })}
          />
        )}
        {shows('status') && (
          <FilterSelect
            label="Status"
            allLabel="Semua status"
            value={filter.status ?? ''}
            choices={asChoices(options?.statuses ?? [])}
            disabled={disabled}
            onChange={(v) => setFilter({ status: v === '' ? null : v })}
          />
        )}

        <div className="flex w-full items-start gap-2 sm:ml-auto sm:w-auto">
          <CopyLinkButton getUrl={getShareUrl} />
          <button
            type="button"
            onClick={reset}
            disabled={!hasFilter}
            className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink-soft hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-ink-muted"
          >
            Reset
          </button>
        </div>
      </div>

      {shows('productLine') && (
        <ProductLineField
          choices={options?.productLines ?? []}
          selected={filter.productLine ?? []}
          disabled={disabled}
          onChange={(next) => setFilter({ productLine: next })}
        />
      )}

      {optionsLoading && <p className="m-0 text-[12px] text-ink-muted">Memuat pilihan filter…</p>}
      {optionsError && (
        <p className="m-0 flex flex-wrap items-center gap-2 text-[12px] text-ink-soft">
          {`Pilihan filter gagal dimuat: ${translateBeMessage(optionsError.message)}`}
          <button
            type="button"
            onClick={() => void refetchOptions()}
            className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1 text-[12px] font-medium hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Coba lagi
          </button>
        </p>
      )}

      <ActiveFilterChips chips={chips} onRemove={setFilter} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-muted">
        {/* Diumumkan pembaca layar setiap filter berubah. */}
        <p role="status" aria-live="polite" className="m-0">
          {summarizeFilter(filter)}
          {updating && ' memperbarui…'}
        </p>
        {partial.map((period) => (
          <span
            key={`${period.kind}-${period.label}`}
            className="inline-flex items-center rounded-md bg-note-soft px-1.5 py-0.5 text-[11px] font-medium text-note-ink"
          >
            Parsial: {period.label}
          </span>
        ))}
        {dataRange && <span>Data tersedia {dataRange}</span>}
      </div>
    </section>
  );
}
