/**
 * Keterangan cakupan angka di halaman Pelanggan: apa yang ikut filter, dan
 * bahwa penjualan sales rep/kantor memakai penugasan saat ini (BE tidak
 * menyimpan riwayat penugasan).
 */
export function ScopeNote() {
  return (
    <aside aria-label="Keterangan angka" className="flex flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3 text-[12px] text-ink-muted">
      <p className="m-0">
        Filter tahun memengaruhi penjualan, order, customer aktif, dan rata-rata nilai order. Customer terdaftar, prospek,
        customer tanpa sales rep, dan segmen credit limit tidak berubah saat tahun diganti.
      </p>
      <p className="m-0">
        Penjualan sales rep dan kantor dihitung dari penugasan saat ini (riwayat pergantian sales rep tidak tersedia).
        Customer tanpa sales rep tidak masuk ke penjualan sales rep maupun kantor. Filter benua dan negara menyaring customer;
        semua sales rep dan kantor tetap tampil.
      </p>
    </aside>
  );
}
