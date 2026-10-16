'use client';

import { useToast } from '@/components/providers/toast-provider';
import { useDiagramEditorStore } from '@/diagram-engine/hooks/diagram-editor-store';
import { useDiagramEditorDispatch } from '@/diagram-engine/state/diagram-editor-store.context';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { computeHierarchicalLayout } from '@/lib/diagram-export/layout';
import { toMermaidFlowchart } from '@/lib/diagram-export/mermaid';
import {
  diagramToPdfBlob,
  diagramToPngDataUrl,
  diagramToSvgString,
  downloadBlob,
} from '@/lib/diagram-export/image';
import { useState, type ReactNode } from 'react';

interface DiagramExportControlsProps {
  readonly isReadOnlyCanvas: boolean;
}

const buttonClass =
  'rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800';

/** Diyagram tuvalinde otomatik yerleşim ve dışa aktarma (PNG, SVG, PDF, Mermaid). */
export function DiagramExportControls(props: DiagramExportControlsProps): ReactNode {
  const { isReadOnlyCanvas } = props;
  const { t } = useTranslations();
  const { showSuccess, showError } = useToast();
  const dispatch = useDiagramEditorDispatch();
  const graph = useDiagramEditorStore((s) => s.graph);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  const diagramName: string = (graph.title || 'diagram').replace(/[^\w\-]+/g, '-').slice(0, 60) || 'diagram';

  const canvasElement = (): HTMLElement => {
    const element = document.querySelector<HTMLElement>('.react-flow');
    if (element === null) {
      throw new Error('Tuval bulunamadı');
    }
    return element;
  };

  const handleLayout = (): void => {
    const positions = computeHierarchicalLayout(
      graph.nodes.map((node) => ({ id: node.id, width: node.width, height: node.height })),
      graph.edges.map((edge) => ({ source: edge.source, target: edge.target })),
    );
    dispatch({
      type: 'APPLY_NODE_CHANGES',
      changes: graph.nodes
        .filter((node) => positions.has(node.id))
        .map((node) => ({
          id: node.id,
          type: 'position' as const,
          position: positions.get(node.id) ?? node.position,
        })),
    });
    showSuccess(t('export.layoutDone'));
  };

  const runExport = async (kind: 'png' | 'svg' | 'pdf'): Promise<void> => {
    setMenuOpen(false);
    setBusy(true);
    try {
      const element = canvasElement();
      if (kind === 'png') {
        const url = await diagramToPngDataUrl(element);
        const blob = await (await fetch(url)).blob();
        downloadBlob(blob, `${diagramName}.png`);
      } else if (kind === 'svg') {
        const svg = await diagramToSvgString(element);
        downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${diagramName}.svg`);
      } else {
        downloadBlob(await diagramToPdfBlob(element), `${diagramName}.pdf`);
      }
    } catch {
      showError(t('export.error'));
    } finally {
      setBusy(false);
    }
  };

  const mermaidSource = (): string =>
    toMermaidFlowchart(
      graph.nodes.map((node) => ({ id: node.id, label: node.data.title })),
      graph.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        label: edge.label,
        dashed: edge.appearance === 'dashed',
      })),
    );

  const handleMermaidDownload = (): void => {
    setMenuOpen(false);
    downloadBlob(new Blob([mermaidSource()], { type: 'text/plain' }), `${diagramName}.mmd`);
  };

  const handleMermaidCopy = async (): Promise<void> => {
    setMenuOpen(false);
    try {
      await navigator.clipboard.writeText(mermaidSource());
      showSuccess(t('export.copyMermaid'));
    } catch {
      showError(t('export.error'));
    }
  };

  return (
    <>
      <span className="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
      <button
        type="button"
        disabled={isReadOnlyCanvas || graph.nodes.length === 0}
        onClick={handleLayout}
        className={buttonClass}
      >
        {t('export.layout')}
      </button>
      <div className="relative">
        <button
          type="button"
          aria-expanded={menuOpen}
          disabled={busy || graph.nodes.length === 0}
          onClick={() => setMenuOpen((open) => !open)}
          className={buttonClass}
        >
          {t('export.title')}
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            <MenuItem label={t('export.png')} onClick={() => void runExport('png')} />
            <MenuItem label={t('export.svg')} onClick={() => void runExport('svg')} />
            <MenuItem label={t('export.pdf')} onClick={() => void runExport('pdf')} />
            <MenuItem label={t('export.mermaid')} onClick={handleMermaidDownload} />
            <MenuItem label={t('export.copyMermaid')} onClick={() => void handleMermaidCopy()} />
          </div>
        ) : null}
      </div>
    </>
  );
}

function MenuItem(props: { label: string; onClick: () => void }): ReactNode {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={props.onClick}
      className="block w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {props.label}
    </button>
  );
}
