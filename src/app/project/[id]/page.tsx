'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Layers,
  Database,
  Server,
  Globe,
  Radio,
  Network,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ArchitectureAnalysis } from '@/types/architecture';
import { getProjectById } from '@/lib/storage/project-store';

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);

  useEffect(() => {
    if (projectId) {
      setProject(getProjectById(projectId));
    }
  }, [projectId]);

  if (!project) return null;

  const { project: meta, components, databases, apis, unknowns, observations } = project;

  return (
    <div className="space-y-8">
      {/* Purpose & Description Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
            System Executive Summary
          </span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {meta.description}
        </p>
        <div>
          <h4 className="text-xs font-mono text-slate-400 uppercase">Primary Purpose & Goal</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            {meta.purpose}
          </p>
        </div>
      </div>

      {/* Detected Tech Stack Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider">
          Detected Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Frontend */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-medium">
              <Globe className="w-4 h-4" />
              <span>Frontend / Client</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {meta.technologies.frontend?.length > 0 ? (
                meta.technologies.frontend.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Not specified in document</span>
              )}
            </div>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-medium">
              <Server className="w-4 h-4" />
              <span>Backend & Services</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {meta.technologies.backend?.length > 0 ? (
                meta.technologies.backend.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Not specified in document</span>
              )}
            </div>
          </div>

          {/* Database */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-medium">
              <Database className="w-4 h-4" />
              <span>Databases & Stores</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {meta.technologies.database?.length > 0 ? (
                meta.technologies.database.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-amber-950/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Not specified in document</span>
              )}
            </div>
          </div>

          {/* Infra & Protocols */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-medium">
              <Radio className="w-4 h-4" />
              <span>Protocols & Infra</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                ...(meta.technologies.infrastructure || []),
                ...(meta.technologies.apis_and_protocols || []),
              ].length > 0 ? (
                [
                  ...(meta.technologies.infrastructure || []),
                  ...(meta.technologies.apis_and_protocols || []),
                ].map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-blue-950/40 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Not specified in document</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Highlights & Quick Nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => router.push(`/project/${projectId}/architecture`)}
          className="p-5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <Network className="w-4 h-4" />
              <span className="text-xs font-mono uppercase font-semibold">Graph Diagram</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400">
            Interactive topology visualizer rendering {components.length} components and {project.connections.length} communication links.
          </p>
        </div>

        <div
          onClick={() => router.push(`/project/${projectId}/data-flow`)}
          className="p-5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-mono uppercase font-semibold">Data Flows</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400">
            Step-by-step sequential execution traces for user login, state mutations, and data persistence.
          </p>
        </div>

        <div
          onClick={() => router.push(`/project/${projectId}/chat`)}
          className="p-5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-mono uppercase font-semibold">Grounded AI Chat</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400">
            Ask targeted questions with exact document page citations and anti-hallucination guardrails.
          </p>
        </div>
      </div>

      {/* Observations & Important Findings */}
      {observations?.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <h3 className="text-xs font-mono uppercase font-semibold tracking-wider">
              Architectural Observations & Patterns
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detected APIs Catalog Table */}
      {apis?.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase font-semibold tracking-wider text-slate-300">
              Detected System APIs & Endpoints ({apis.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Endpoint</th>
                  <th className="pb-2 font-medium font-sans">Purpose</th>
                  <th className="pb-2 font-medium text-right">Source Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {apis.map((api, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          api.method.toUpperCase() === 'GET'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : api.method.toUpperCase() === 'POST'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : api.method.toUpperCase() === 'DELETE'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {api.method}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-200">{api.endpoint}</td>
                    <td className="py-2.5 font-sans text-slate-300">{api.purpose}</td>
                    <td className="py-2.5 text-slate-500 text-right text-[10px]">
                      {api.source_reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Uncertainty & Unknowns Matrix */}
      {unknowns?.length > 0 && (
        <div className="bg-slate-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-mono uppercase font-semibold tracking-wider text-slate-300">
              Uncertainty & Missing Information Matrix ({unknowns.length})
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            ArchLens refuses to invent missing architecture. The following aspects were not specified in the uploaded document:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {unknowns.map((u, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-1 text-xs"
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                  {u.category}
                </span>
                <span className="font-medium text-slate-200 block">{u.information}</span>
                <p className="text-slate-400 text-[11px] pt-1 border-t border-zinc-800/60 leading-relaxed">
                  Reason: {u.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
