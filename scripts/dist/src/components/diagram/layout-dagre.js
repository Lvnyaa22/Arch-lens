"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutedElements = getLayoutedElements;
exports.buildFlowElements = buildFlowElements;
const dagre_1 = __importDefault(require("@dagrejs/dagre"));
const NODE_WIDTH = 260;
const NODE_HEIGHT = 120;
function getLayoutedElements(nodes, edges, direction = 'LR') {
    const dagreGraph = new dagre_1.default.graphlib.Graph();
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
    dagre_1.default.layout(dagreGraph);
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
function buildFlowElements(components, connections, direction = 'LR') {
    const initialNodes = components.map((comp) => ({
        id: comp.id,
        type: 'customComponent',
        data: {
            ...comp,
        },
        position: { x: 0, y: 0 },
    }));
    const initialEdges = connections.map((conn, index) => ({
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
        labelBgPadding: [6, 2],
        data: { ...conn },
    }));
    return getLayoutedElements(initialNodes, initialEdges, direction);
}
