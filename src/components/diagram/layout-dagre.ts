import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';
import { ComponentItem, ConnectionItem } from '@/types/architecture';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 120;

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 90,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function buildFlowElements(
  components: ComponentItem[],
  connections: ConnectionItem[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const initialNodes: Node[] = components.map((comp) => ({
    id: comp.id,
    type: 'customComponent',
    data: {
      ...comp,
    },
    position: { x: 0, y: 0 },
  }));

  const initialEdges: Edge[] = connections.map((conn, index) => ({
    id: `e-${conn.source}-${conn.target}-${index}`,
    source: conn.source,
    target: conn.target,
    label: conn.communication_method || conn.relationship,
    animated: conn.communication_method?.toLowerCase().includes('socket') ||
      conn.communication_method?.toLowerCase().includes('event') ||
      conn.communication_method?.toLowerCase().includes('queue'),
    style: { stroke: '#64748b', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 500 },
    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85, rx: 4, ry: 4 },
    labelBgPadding: [6, 2] as [number, number],
    data: { ...conn },
  }));

  return getLayoutedElements(initialNodes, initialEdges, direction);
}
