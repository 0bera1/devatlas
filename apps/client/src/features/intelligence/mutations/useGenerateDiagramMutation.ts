'use client';

import { diagramApi } from '@/api/diagrams/diagramApi';
import { intelligenceApi } from '@/api/intelligence/intelligenceApi';
import { diagramQueryKeys } from '@/api/query/diagram-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  DiagramRecord,
  DiagramSaveEdgeBody,
  DiagramSaveNodeBody,
  SaveDiagramGraphBody,
} from '@/domains/diagramDomains';
import type {
  GeneratedDiagramEdge,
  GeneratedDiagramNode,
  GeneratedDiagramTemplate,
} from '@/domains/intelligenceDomains';
import { parseDiagramNodeType } from '@/diagram-engine/nodes/atlas-node.constants';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

export interface GenerateDiagramFromPromptInput {
  readonly prompt: string;
}

export interface GenerateDiagramFromPromptResult {
  readonly diagram: DiagramRecord;
  readonly template: GeneratedDiagramTemplate;
}

/**
 * "Generate diagram from prompt" akışını uçtan uca yöneten mutation:
 *  1) Heuristic motoru çağırır (POST /intelligence/diagrams/generate)
 *  2) Boş bir diagram oluşturur (POST /diagrams)
 *  3) Şablon node + edge'lerini diagramda kalıcılaştırır (PUT /diagrams/:id)
 *  4) Diagram cache'lerini invalide eder
 *
 * Auth zorunludur (diagram oluşturmak için token gerekli).
 */
export function useGenerateDiagramMutation(): UseMutationResult<
  GenerateDiagramFromPromptResult,
  Error,
  GenerateDiagramFromPromptInput
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: ['intelligence', 'generate-diagram'],
    mutationFn: async (
      input: GenerateDiagramFromPromptInput,
    ): Promise<GenerateDiagramFromPromptResult> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }

      const template: GeneratedDiagramTemplate =
        await intelligenceApi.generateDiagramFromPrompt(
          { prompt: input.prompt },
          token,
        );

      const created: DiagramRecord = await diagramApi.create(token, {
        title: template.templateName,
      });

      const graph: SaveDiagramGraphBody = mapTemplateToSaveGraph(template);
      const saved: DiagramRecord = await diagramApi.saveGraph(
        token,
        created.id,
        graph,
      );

      return { diagram: saved, template };
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: diagramQueryKeys.lists() });
    },
  });
}

/**
 * Template'in sabit `localId` değerlerini (örn. "client", "gateway", "db")
 * global olarak benzersiz Node id'lerine çevirir. `Node.id` Prisma şemasında
 * global primary key olduğundan, aynı template birden fazla kez üretildiğinde
 * sabit localId'ler P2002 (unique constraint) hatasına yol açar.
 */
function buildLocalIdToNodeIdMap(
  template: GeneratedDiagramTemplate,
): ReadonlyMap<string, string> {
  const idByLocalId: Map<string, string> = new Map<string, string>();
  for (const node of template.nodes) {
    idByLocalId.set(node.localId, crypto.randomUUID());
  }
  return idByLocalId;
}

function mapTemplateNodeToSaveBody(
  node: GeneratedDiagramNode,
  idByLocalId: ReadonlyMap<string, string>,
): DiagramSaveNodeBody {
  const persistedId: string = idByLocalId.get(node.localId) ?? crypto.randomUUID();
  return {
    id: persistedId,
    label: node.label,
    type: parseDiagramNodeType(node.type),
    x: node.x,
    y: node.y,
    width: node.width ?? null,
    height: node.height ?? null,
  };
}

function mapTemplateEdgeToSaveBody(
  edge: GeneratedDiagramEdge,
  idByLocalId: ReadonlyMap<string, string>,
): DiagramSaveEdgeBody {
  const fromId: string = idByLocalId.get(edge.fromLocalId) ?? edge.fromLocalId;
  const toId: string = idByLocalId.get(edge.toLocalId) ?? edge.toLocalId;
  const baseBody: DiagramSaveEdgeBody = {
    from: fromId,
    to: toId,
    type: edge.type ?? 'smoothstep',
    animated: edge.animated ?? false,
  };
  if (edge.label === undefined) {
    return baseBody;
  }
  return { ...baseBody, label: edge.label };
}

function mapTemplateToSaveGraph(
  template: GeneratedDiagramTemplate,
): SaveDiagramGraphBody {
  const idByLocalId: ReadonlyMap<string, string> =
    buildLocalIdToNodeIdMap(template);

  const nodes: DiagramSaveNodeBody[] = template.nodes.map(
    (node: GeneratedDiagramNode): DiagramSaveNodeBody =>
      mapTemplateNodeToSaveBody(node, idByLocalId),
  );

  const edges: DiagramSaveEdgeBody[] = template.edges.map(
    (edge: GeneratedDiagramEdge): DiagramSaveEdgeBody =>
      mapTemplateEdgeToSaveBody(edge, idByLocalId),
  );

  return { nodes, edges };
}
