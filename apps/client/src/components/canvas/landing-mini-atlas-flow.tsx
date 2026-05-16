'use client';

import '@xyflow/react/dist/style.css';

import { LandingScrollDrawEdge } from '@/components/canvas/landing-scroll-draw-edge';
import { applyAtlasFlowPresentation } from '@/components/diagrams/flow/atlas-flow-presentation';
import { useAtlasDiagramNodeTypes } from '@/components/diagrams/flow/atlas-diagram-node-views';
import {
  ATLAS_DEFAULT_EDGE_OPTIONS,
  type AtlasFlowNode,
} from '@/diagram-engine/core/react-flow.adapter';
import { DiagramEditorStoreProvider } from '@/diagram-engine/hooks/diagram-editor-store';
import { revealStagger } from '@/lib/sceneMath';
import {
  Background,
  BackgroundVariant,
  type Edge,
  type NodeChange,
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
} from '@xyflow/react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

const LANDING_EDGE_TYPE = 'landingScrollDraw' as const;

function buildLandingDemoGraph(): {
  readonly nodes: AtlasFlowNode[];
  readonly edges: Edge[];
} {
  const nodes: AtlasFlowNode[] = [
    {
      id: 'n1',
      type: 'service',
      position: { x: 40, y: 60 },
      data: {
        type: 'service',
        title: 'Auth',
        description: 'JWT + oturum',
        status: 'active',
      },
    },
    {
      id: 'n2',
      type: 'database',
      position: { x: 260, y: 40 },
      data: {
        type: 'database',
        title: 'Postgres',
        status: 'default',
      },
    },
    {
      id: 'n3',
      type: 'api',
      position: { x: 150, y: 200 },
      data: {
        type: 'api',
        title: 'REST',
        description: 'Bilgi tabanı',
        status: 'active',
      },
    },
    {
      id: 'n4',
      type: 'cache',
      position: { x: 320, y: 200 },
      data: {
        type: 'cache',
        title: 'Redis',
        status: 'warning',
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: 'e1',
      source: 'n1',
      target: 'n2',
      type: LANDING_EDGE_TYPE,
      data: { drawT: 0 },
    },
    {
      id: 'e2',
      source: 'n1',
      target: 'n3',
      type: LANDING_EDGE_TYPE,
      data: { drawT: 0 },
    },
    {
      id: 'e3',
      source: 'n3',
      target: 'n4',
      type: LANDING_EDGE_TYPE,
      data: { drawT: 0 },
    },
  ];

  return { nodes, edges };
}

function landingNodeReveal(nodeId: string, flowT: number): number {
  switch (nodeId) {
    case 'n1':
      return revealStagger(flowT, 0.05, 0.26);
    case 'n2':
      return revealStagger(flowT, 0.14, 0.34);
    case 'n3':
      return revealStagger(flowT, 0.22, 0.42);
    case 'n4':
      return revealStagger(flowT, 0.3, 0.5);
    default:
      return 0;
  }
}

/** Önce Service→REST, sonra Service→DB, sonra REST→Redis. */
function landingEdgeDrawT(edgeId: string, flowT: number): number {
  switch (edgeId) {
    case 'e2':
      return revealStagger(flowT, 0.28, 0.5);
    case 'e1':
      return revealStagger(flowT, 0.4, 0.62);
    case 'e3':
      return revealStagger(flowT, 0.52, 0.76);
    default:
      return 0;
  }
}

interface LandingMiniAtlasFlowProps {
  readonly visible: number;
  readonly graphPulse: number;
  readonly flowTimeline: number;
}

/**
 * Gerçek Atlas node görünümleri + scroll ile kademeli düğüm ve çizilen kenarlar.
 */
export function LandingMiniAtlasFlow(
  props: LandingMiniAtlasFlowProps,
): ReactNode {
  const { visible, graphPulse, flowTimeline } = props;
  const { nodes: seedNodes, edges: seedEdges } = useMemo(
    () => buildLandingDemoGraph(),
    [],
  );
  const [nodes, setNodes] = useState<AtlasFlowNode[]>(seedNodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onNodesChange = useCallback((changes: NodeChange<AtlasFlowNode>[]) => {
    setNodes((previous: AtlasFlowNode[]) =>
      applyNodeChanges(changes, previous),
    );
  }, []);

  const nodeTypes = useAtlasDiagramNodeTypes();

  const edgeTypes = useMemo(
    () => ({
      [LANDING_EDGE_TYPE]: LandingScrollDrawEdge,
    }),
    [],
  );

  const edgesWithScroll: Edge[] = useMemo(() => {
    return seedEdges.map((edge: Edge) => ({
      ...edge,
      type: LANDING_EDGE_TYPE,
      data: { drawT: landingEdgeDrawT(edge.id, flowTimeline) },
    }));
  }, [seedEdges, flowTimeline]);

  const { nodes: presentedNodes, edges: presentedEdges } = useMemo(
    () => applyAtlasFlowPresentation(nodes, edgesWithScroll, selectedId, null),
    [edgesWithScroll, nodes, selectedId],
  );

  const nodesForFlow: AtlasFlowNode[] = useMemo(() => {
    return presentedNodes.map((node: AtlasFlowNode) => {
      const reveal: number = landingNodeReveal(node.id, flowTimeline);
      const baseOpacity: number =
        typeof node.style?.opacity === 'number' ? node.style.opacity : 1;
      return {
        ...node,
        style: {
          ...node.style,
          opacity: baseOpacity * reveal,
        },
      };
    });
  }, [flowTimeline, presentedNodes]);

  const pulseTransform: string =
    graphPulse > 0.02
      ? `scale(${1 + graphPulse * 0.02}) translateZ(0)`
      : 'translateZ(0)';

  return (
    <DiagramEditorStoreProvider diagramId="landing-cinematic-demo">
      <div
        className="pointer-events-auto relative mx-auto h-[min(48vh,400px)] w-full max-w-3xl origin-center transition-transform duration-300 ease-out"
        style={{
          opacity: visible,
          transform: pulseTransform,
          filter: `saturate(${1 + graphPulse * 0.15})`,
        }}
      >
        <ReactFlowProvider>
          <ReactFlow
            className="rounded-2xl border border-zinc-200/85 bg-white/90 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_24px_80px_-32px_rgba(99,102,241,0.22)] dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_-32px_rgba(99,102,241,0.45)]"
            nodes={nodesForFlow}
            edges={presentedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={ATLAS_DEFAULT_EDGE_OPTIONS}
            onNodesChange={onNodesChange}
            onNodeClick={(_, node) => {
              setSelectedId(node.id);
            }}
            fitView
            minZoom={0.4}
            maxZoom={1.2}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1}
              color="rgba(148,163,184,0.18)"
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </DiagramEditorStoreProvider>
  );
}
