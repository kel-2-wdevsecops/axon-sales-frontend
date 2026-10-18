import { Component, type ReactNode } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';

interface PanelErrorBoundaryProps {
  /** Teks pengganti panel bila render-nya gagal. */
  message: string;
  children: ReactNode;
}

interface PanelErrorBoundaryState {
  failed: boolean;
}

/**
 * Mengisolasi satu panel: bila render-nya melempar error (mis. data BE tak
 * sesuai kontrak), hanya panel itu yang diganti pesan; halaman di sekitarnya
 * tetap tampil. Kegagalan memuat data ditangani `QueryState`, bukan di sini.
 */
export class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
  state: PanelErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): PanelErrorBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <EmptyState dashed>{this.props.message}</EmptyState> : this.props.children;
  }
}
