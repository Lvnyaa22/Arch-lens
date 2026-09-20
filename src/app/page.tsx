'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Layers,
  FileText,
  Calendar,
  Trash2,
  ArrowRight,
  Database,
  Server,
  Workflow,
  Sparkles,
  ShieldCheck,
  Code2,
  FolderOpen,
  Search,
  MessageSquare,
  Zap,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { ArchitectureAnalysis } from '@/types/architecture';
import {
  getStoredProjects,
  deleteProjectFromStorage,
  saveProjectToStorage,
} from '@/lib/storage/project-store';
import { DEMO_PROJECT_SHOPSTREAM, DEMO_PROJECT_COLLABCANVAS } from '@/lib/demo/demo-projects';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ArchitectureAnalysis[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProjects(getStoredProjects());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project analysis?')) {
      deleteProjectFromStorage(id);
      setProjects(getStoredProjects());
    }
  };

  const handleLoadDemo = (demo: ArchitectureAnalysis) => {
    saveProjectToStorage(demo);
    setProjects(getStoredProjects());
    router.push(`/project/${demo.id}`);
  };

  const totalComponents = projects.reduce((acc, p) => acc + (p.components?.length || 0), 0);
  const totalFlows = projects.reduce((acc, p) => acc + (p.data_flows?.length || 0), 0);
  const totalChunks = projects.reduce((acc, p) => acc + (p.chunks?.length || 0), 0);
  const totalApis = projects.reduce((acc, p) => acc + (p.apis?.length || 0), 0);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-xs font-mono text-slate-500 animate-pulse">Loading projects...</div>
      </div>
    );
  }

  const activeProject = projects[0] || null;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Developer Architecture Intelligence
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GenAI RAG Engine Ready
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-2">
            ArchLens Architecture Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Upload software design documents, system specs, or source files to dynamically extract
            components, interactive topology diagrams, communication protocols, and grounded flows.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all hover:shadow-blue-500/20 hover:scale-[1.01]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Project Docs</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-mono text-slate-400 block">Indexed Projects</span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">
            {projects.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-mono text-slate-400 block">Extracted Components</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {totalComponents}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-mono text-slate-400 block">Traced Data Flows</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">
            {totalFlows}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-mono text-slate-400 block">RAG Document Chunks</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {totalChunks}
          </span>
        </div>
      </div>

      {/* Quick Actions Bar for Active Project */}
      {activeProject && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900/80 to-slate-900/40 border border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                Active Project Quick Actions • {activeProject.project.name}
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              Ready for Queries
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <Link
              href={`/project/${activeProject.id}/chat`}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2.5 text-xs text-slate-200 group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block group-hover:text-emerald-400 transition-colors">
                  Ask AI (RAG)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Grounded Q&A</span>
              </div>
            </Link>

            <Link
              href={`/project/${activeProject.id}/architecture`}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2.5 text-xs text-slate-200 group"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block group-hover:text-blue-400 transition-colors">
                  Architecture Graph
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Interactive Topology</span>
              </div>
            </Link>

            <Link
              href={`/project/${activeProject.id}/data-flow`}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2.5 text-xs text-slate-200 group"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block group-hover:text-cyan-400 transition-colors">
                  Trace Data Flow
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Step-by-Step Traces</span>
              </div>
            </Link>

            <Link
              href={`/project/${activeProject.id}/search`}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2.5 text-xs text-slate-200 group"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block group-hover:text-amber-400 transition-colors">
                  Search System
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Components & Chunks</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Preloaded Demo Projects Showcase */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              One-Click Pre-Indexed Demo Projects (Instant Testing)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Click to load & explore without uploading
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => handleLoadDemo(DEMO_PROJECT_SHOPSTREAM)}
            className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                1. ShopStream Cloud (E-Commerce)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                Microservices
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">
              Next.js 14 + NestJS + Go + Python FastAPI + MongoDB + PostgreSQL + RabbitMQ + Redis.
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
              <span>10 Components • 4 Pages</span>
              <span className="text-blue-400 font-sans font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Launch Demo <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div
            onClick={() => handleLoadDemo(DEMO_PROJECT_COLLABCANVAS)}
            className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                2. CollabCanvas Realtime (Whiteboard)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                WebSockets & BEAM
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">
              Flutter Web + Go WebSocket Gateway + Elixir Phoenix BEAM + Rust Worker + Redis Cluster + AWS S3.
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
              <span>8 Components • 4 Pages</span>
              <span className="text-cyan-400 font-sans font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Launch Demo <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analyzed Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase font-mono tracking-wider">
            All Indexed Systems ({projects.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => router.push(`/project/${proj.id}`)}
              className="group relative flex flex-col justify-between p-5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                      {proj.project.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.project.description}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(proj.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Technology Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[
                    ...(proj.project.technologies.frontend || []),
                    ...(proj.project.technologies.backend || []),
                    ...(proj.project.technologies.database || []),
                  ]
                    .slice(0, 4)
                    .map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {tech}
                      </span>
                    ))}
                  {([
                    ...(proj.project.technologies.frontend || []),
                    ...(proj.project.technologies.backend || []),
                    ...(proj.project.technologies.database || []),
                  ].length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800/60 text-slate-400">
                      +
                      {[
                        ...(proj.project.technologies.frontend || []),
                        ...(proj.project.technologies.backend || []),
                        ...(proj.project.technologies.database || []),
                      ].length - 4}{' '}
                      more
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Layers className="w-3 h-3 text-blue-400" />
                    {proj.components.length} nodes
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Workflow className="w-3 h-3 text-cyan-400" />
                    {proj.connections.length} edges
                  </span>
                </div>

                <span className="flex items-center gap-1 text-blue-400 font-sans group-hover:translate-x-0.5 transition-transform">
                  Inspect <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
