'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ComponentItem, ConnectionItem } from '@/types/architecture';
import { nodeTypes } from './CustomNodes';
import { buildFlowElements, getLayoutedElements } from './layout-dagre';
import { ComponentDetailModal } from './ComponentDetailModal';
import { Maximize2, LayoutGrid, RotateCcw, Filter } from 'lucide-react';

interface ArchitectureDiagramProps {
  components: ComponentItem[];
  connections: ConnectionItem[];
  projectName: string;
}

function ArchitectureDiagramInternal({
  components,
  connections,
  projectName,
}: ArchitectureDiagramProps) {
  const { fitView } = useReactFlow();
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
  const [filterType, setFilterType] = useState<string>('all');

  const { initialNodes, initialEdges } = useMemo(() => {
    const res = buildFlowElements(components, connections, direction);
    return { initialNodes: res.nodes, initialEdges: res.edges };
  }, [components, connections, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when initial nodes change
  useEffect(() => {
    const res = buildFlowElements(components, connections, direction);
    setNodes(res.nodes);
    setEdges(res.edges);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
  }, [components, connections, direction, fitView, setNodes, setEdges]);

  // Handle auto-layout direction toggle
  const handleToggleLayout = () => {
    const nextDir = direction === 'LR' ? 'TB' : 'LR';
    setDirection(nextDir);
    const layouted = getLayoutedElements(nodes, edges, nextDir);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  };

  const handleResetView = () => {
    fitView({ padding: 0.2, duration: 500 });
  };

  // Node click handler
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedCompId(node.id);
  }, []);

  const selectedComponent = useMemo(() => {
    if (!selectedCompId) return null;
    return components.find((c) => c.id === selectedCompId) || null;
  }, [selectedCompId, components]);

  // Filtering
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    return nodes.filter((n) => {
      const comp = n.data as unknown as ComponentItem;
      return comp.type === filterType;
    });
  }, [nodes, filterType]);

  const componentTypes = useMemo(() => {
    const types = new Set(components.map((c) => c.type));
    return Array.from(types);
  }, [components]);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-300" />
        <MiniMap
          nodeColor={(node) => {
            const comp = node.data as unknown as ComponentItem;
            switch (comp.type) {
              case 'frontend':
                return '#06b6d4';
              case 'backend_service':
                return '#10b981';
              case 'database':
                return '#f59e0b';
              case 'cache':
                return '#8b5cf6';
              case 'message_broker':
                return '#f43f5e';
              default:
                return '#64748b';
            }
          }}
          className="!bg-slate-900/90 !border-slate-800 rounded-lg !bottom-4 !left-4"
        />

        {/* Toolbar Panel */}
        <Panel position="top-left" className="m-3">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-lg text-xs shadow-lg text-slate-300">
            <span className="font-semibold text-slate-100 flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
              {nodes.length} Components
            </span>
            <span className="text-slate-600">|</span>
            <span>{edges.length} Connections</span>

            <span className="text-slate-600 ml-1">|</span>

            {/* Layout direction toggle */}
            <button
              onClick={handleToggleLayout}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
              title="Toggle Layout Direction (Left-to-Right / Top-to-Bottom)"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              Layout: {direction}
            </button>

            {/* Fit View */}
            <button
              onClick={handleResetView}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
              title="Reset Zoom & Center View"
            >
              <Maximize2 className="w-3 h-3 text-emerald-400" />
              Fit
            </button>

            {/* Filter by Type */}
            <div className="flex items-center gap-1 ml-2">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Types ({components.length})</option>
                {componentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Selected Component Modal */}
      <ComponentDetailModal
        component={selectedComponent}
        connections={connections}
        allComponents={components}
        onClose={() => setSelectedCompId(null)}
        onSelectComponent={(comp) => setSelectedCompId(comp.id)}
      />
    </div>
  );
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ArchitectureDiagramInternal {...props} />
    </ReactFlowProvider>
  );
};
