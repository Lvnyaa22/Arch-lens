'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArchitectureDiagram } from '@/components/diagram/ArchitectureDiagram';
import { ArchitectureAnalysis } from '@/types/architecture';
import { getProjectById } from '@/lib/storage/project-store';
import { Layers, Network, Info } from 'lucide-react';

export default function ArchitectureGraphPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);

  useEffect(() => {
    if (projectId) {
      setProject(getProjectById(projectId));
    }
  }, [projectId]);

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[650px] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400" />
            Dynamic System Topology
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-layout directed acyclic graph computed dynamically from documented components and protocols.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Explicit Component
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Inferred Component
          </span>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <ArchitectureDiagram
          components={project.components}
          connections={project.connections}
          projectName={project.project.name}
        />
      </div>
    </div>
  );
}
