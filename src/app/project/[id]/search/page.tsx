'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Search,
  Layers,
  FileCode2,
  Database,
  Radio,
  Workflow,
  ArrowRight,
  Filter,
  FileText,
  Eye,
} from 'lucide-react';
import { ArchitectureAnalysis, DocumentChunk } from '@/types/architecture';
import { getProjectById } from '@/lib/storage/project-store';
import { SourceChunkModal } from '@/components/SourceChunkModal';

export default function ProjectSearchPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  useEffect(() => {
    if (projectId) {
      setProject(getProjectById(projectId));
    }
  }, [projectId]);

  const results = useMemo(() => {
    if (!project || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const items: Array<{
      category: 'component' | 'api' | 'database' | 'flow' | 'chunk' | 'observation';
      title: string;
      subtitle: string;
      description: string;
      link?: string;
      chunk?: DocumentChunk;
    }> = [];

    // Search Components
    project.components.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.technology?.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'component',
          title: c.name,
          subtitle: `Component (${c.type.replace('_', ' ')}) • ${c.technology || 'Custom'}`,
          description: c.description,
          link: `/project/${projectId}/components`,
        });
      }
    });

    // Search APIs
    project.apis.forEach((a) => {
      if (
        a.name.toLowerCase().includes(q) ||
        a.endpoint.toLowerCase().includes(q) ||
        a.method.toLowerCase().includes(q) ||
        a.purpose.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'api',
          title: `${a.method} ${a.endpoint}`,
          subtitle: `API Endpoint • ${a.name}`,
          description: a.purpose,
          link: `/project/${projectId}`,
        });
      }
    });

    // Search Databases
    project.databases.forEach((d) => {
      if (
        d.name.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.purpose.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'database',
          title: d.name,
          subtitle: `Database / Data Store • ${d.type}`,
          description: d.purpose,
          link: `/project/${projectId}`,
        });
      }
    });

    // Search Flows
    project.data_flows.forEach((f) => {
      if (
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.steps.some((s) => s.action.toLowerCase().includes(q) || s.details.toLowerCase().includes(q))
      ) {
        items.push({
          category: 'flow',
          title: f.name,
          subtitle: `Data Flow (${f.steps.length} steps)`,
          description: f.description,
          link: `/project/${projectId}/data-flow`,
        });
      }
    });

    // Search Document Chunks
    (project.chunks || []).forEach((chk) => {
      if (chk.content.toLowerCase().includes(q) || chk.pageOrSection.toLowerCase().includes(q)) {
        items.push({
          category: 'chunk',
          title: `Source Excerpt: ${chk.fileName} (${chk.pageOrSection})`,
          subtitle: `Document Chunk ${chk.id}`,
          description: chk.content,
          chunk: chk,
        });
      }
    });

    return items;
  }, [project, searchQuery, projectId]);

  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return results;
    return results.filter((r) => r.category === activeCategory);
  }, [results, activeCategory]);

  if (!project) return null;

  const categoryCounts = {
    all: results.length,
    component: results.filter((r) => r.category === 'component').length,
    api: results.filter((r) => r.category === 'api').length,
    database: results.filter((r) => r.category === 'database').length,
    flow: results.filter((r) => r.category === 'flow').length,
    chunk: results.filter((r) => r.category === 'chunk').length,
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          Project-Wide Architecture Search
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Search components, APIs, database models, execution flows, and indexed documentation excerpts.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          autoFocus
          placeholder="Search anything (e.g. 'PostgreSQL', 'authentication', '/orders', 'RabbitMQ', 'WebSocket')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md font-mono"
        />
      </div>

      {/* Filter Tabs */}
      {searchQuery.trim() && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'component', label: 'Components' },
            { id: 'api', label: 'APIs' },
            { id: 'database', label: 'Databases' },
            { id: 'flow', label: 'Data Flows' },
            { id: 'chunk', label: 'Document Chunks' },
          ].map((tab) => {
            const count = categoryCounts[tab.id as keyof typeof categoryCounts] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === tab.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {!searchQuery.trim() ? (
          <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40 space-y-2">
            <Search className="w-6 h-6 text-slate-600 mx-auto" />
            <p>Type a keyword above to search across all components, APIs, and document chunks.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40">
            No results found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (item.chunk) {
                    setSelectedChunk(item.chunk);
                  } else if (item.link) {
                    router.push(item.link);
                  }
                }}
                className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2 group shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 block font-semibold">
                      {item.subtitle}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <span className="text-xs text-blue-400 flex items-center gap-1 font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.chunk ? 'Inspect Excerpt' : 'View'} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <SourceChunkModal chunk={selectedChunk} onClose={() => setSelectedChunk(null)} />
    </div>
  );
}
