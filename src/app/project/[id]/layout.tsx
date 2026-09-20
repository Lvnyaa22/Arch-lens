'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Layers,
  Network,
  FileCode2,
  Workflow,
  MessageSquare,
  FileText,
  FolderOpen,
  Search,
  ChevronRight,
  AlertCircle,
  FileCheck2,
  HelpCircle,
  ArrowLeft,
  Key,
} from 'lucide-react';
import { ArchitectureAnalysis } from '@/types/architecture';
import { getProjectById } from '@/lib/storage/project-store';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (projectId) {
      const data = getProjectById(projectId);
      setProject(data);
    }
  }, [projectId]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-xs font-mono text-slate-500 animate-pulse">Loading project data...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-200">Project Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The requested project analysis could not be loaded from local storage. It may have been cleared or not yet analyzed.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload Architecture Document</span>
        </Link>
      </div>
    );
  }

  const basePath = `/project/${projectId}`;

  const navTabs = [
    { href: basePath, label: 'Overview', icon: Layers, exact: true },
    { href: `${basePath}/architecture`, label: 'Architecture Graph', icon: Network },
    { href: `${basePath}/components`, label: 'Components & Relations', icon: FileCode2 },
    { href: `${basePath}/data-flow`, label: 'Data Flows', icon: Workflow },
    { href: `${basePath}/chat`, label: 'RAG Chat', icon: MessageSquare },
    { href: `${basePath}/files`, label: 'Files & Chunks', icon: FolderOpen },
    { href: `${basePath}/search`, label: 'Search', icon: Search },
    { href: `${basePath}/report`, label: 'Report & Export', icon: FileText },
  ];

  return (
    <div className="flex-1 flex flex-col w-full bg-[#090d16]">
      {/* Project Subheader Banner */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Link href="/" className="hover:text-slate-200 transition-colors">
                Projects
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200">{project.project.name}</span>
            </div>

            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>{project.project.name}</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {project.fileName}
              </span>
            </h1>

            <p className="text-xs text-slate-400 line-clamp-1 max-w-3xl">
              {project.project.description}
            </p>
          </div>

          {/* Confidence & Source Summary Pills */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300" title="Total pages parsed">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{project.pageCount} {project.pageCount === 1 ? 'page' : 'pages'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400" title="Explicitly documented components">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{project.confidence_summary.explicit_count} explicit</span>
            </div>

            {project.confidence_summary.inferred_count > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400" title="Architecturally inferred components">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{project.confidence_summary.inferred_count} inferred</span>
              </div>
            )}

            {project.confidence_summary.unknown_count > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-400" title="Unknown or missing architecture specifications">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>{project.confidence_summary.unknown_count} unknowns</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-none">
          {navTabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</div>
    </div>
  );
}
