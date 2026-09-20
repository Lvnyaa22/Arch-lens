'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  FileCode2,
  Layers,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  ShieldAlert,
  Server,
  Database,
  Globe,
  Radio,
  Cpu,
} from 'lucide-react';
import { ArchitectureAnalysis, ComponentItem, ConnectionItem } from '@/types/architecture';
import { getProjectById } from '@/lib/storage/project-store';

export default function ComponentsAndRelationsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);
  const [viewTab, setViewTab] = useState<'relations' | 'components'>('relations');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');

  useEffect(() => {
    if (projectId) {
      setProject(getProjectById(projectId));
    }
  }, [projectId]);

  const compMap = useMemo(() => {
    if (!project) return new Map<string, ComponentItem>();
    return new Map(project.components.map((c) => [c.id, c]));
  }, [project]);

  const commMethods = useMemo(() => {
    if (!project) return [];
    const methods = new Set(project.connections.map((c) => c.communication_method));
    return Array.from(methods).filter(Boolean);
  }, [project]);

  const filteredConnections = useMemo(() => {
    if (!project) return [];
    return project.connections.filter((conn) => {
      const srcName = compMap.get(conn.source)?.name || conn.source;
      const tgtName = compMap.get(conn.target)?.name || conn.target;

      const matchesSearch =
        srcName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tgtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.explanation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMethod =
        selectedMethod === 'all' || conn.communication_method === selectedMethod;

      return matchesSearch && matchesMethod;
    });
  }, [project, searchTerm, selectedMethod, compMap]);

  const filteredComponents = useMemo(() => {
    if (!project) return [];
    return project.components.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.technology?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [project, searchTerm]);

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-blue-400" />
            Component & Relationship Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed technical inventory of system components and documented interaction channels.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewTab('relations')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewTab === 'relations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Relationships ({project.connections.length})
          </button>
          <button
            onClick={() => setViewTab('components')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewTab === 'components'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Component Catalog ({project.components.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={
              viewTab === 'relations'
                ? 'Search by source, target, explanation...'
                : 'Search components by name, tech, type...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {viewTab === 'relations' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="all">All Protocols ({project.connections.length})</option>
              {commMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab: Relationships View */}
      {viewTab === 'relations' && (
        <div className="space-y-3">
          {filteredConnections.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40">
              No matching relationships found for the current search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnections.map((conn, idx) => {
                const src = compMap.get(conn.source);
                const tgt = compMap.get(conn.target);

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3 shadow-sm"
                  >
                    {/* Source -> Target Badges */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-xs text-cyan-400 font-mono truncate">
                          {src?.name || conn.source}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-semibold text-xs text-emerald-400 font-mono truncate">
                          {tgt?.name || conn.target}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/30 shrink-0">
                        {conn.communication_method}
                      </span>
                    </div>

                    {/* Relationship Verb & Description */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        Relationship: {conn.relationship}
                      </span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                        {conn.explanation}
                      </p>
                    </div>

                    {/* Source Reference */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>Source Reference:</span>
                      <span className="text-slate-300">{conn.source_reference || 'Not specified'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Component Catalog View */}
      {viewTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((comp) => {
            const inbound = project.connections.filter((c) => c.target === comp.id);
            const outbound = project.connections.filter((c) => c.source === comp.id);

            return (
              <div
                key={comp.id}
                className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {comp.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-100 mt-0.5">{comp.name}</h3>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        comp.confidence === 'explicit'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {comp.confidence}
                    </span>
                  </div>

                  {comp.technology && (
                    <div className="mt-2 text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      Tech: {comp.technology}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {comp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Interactions:</span>
                    <span className="text-slate-300">
                      {inbound.length} inbound / {outbound.length} outbound
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Source Ref:</span>
                    <span className="text-slate-400 truncate max-w-[160px]" title={comp.source_reference}>
                      {comp.source_reference}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
