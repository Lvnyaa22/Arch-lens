'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  FileCode,
  FolderOpen,
  Layers,
  Search,
  Copy,
  Check,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ArchitectureAnalysis, DocumentChunk } from '@/types/architecture';
import { getProjectById } from '@/lib/storage/project-store';
import { SourceChunkModal } from '@/components/SourceChunkModal';

export default function DocumentExplorerPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  useEffect(() => {
    if (projectId) {
      setProject(getProjectById(projectId));
    }
  }, [projectId]);

  const chunks = useMemo(() => {
    if (!project) return [];
    return project.chunks || [];
  }, [project]);

  const filteredChunks = useMemo(() => {
    if (!searchTerm.trim()) return chunks;
    const term = searchTerm.toLowerCase();
    return chunks.filter(
      (c) =>
        c.content.toLowerCase().includes(term) ||
        c.pageOrSection.toLowerCase().includes(term) ||
        c.fileName.toLowerCase().includes(term)
    );
  }, [chunks, searchTerm]);

  const handleCopyRaw = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.documentText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 1500);
  };

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            Document & Chunk Repository
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Indexed document chunks, page boundaries, and metadata used for RAG architecture reasoning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRaw}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRaw ? 'Copied Full Text' : 'Copy Extracted Text'}</span>
          </button>
        </div>
      </div>

      {/* File Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">PRIMARY FILE</span>
          <span className="text-sm font-semibold text-slate-100 mt-1 block truncate">
            {project.fileName}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">TOTAL PAGES</span>
          <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
            {project.pageCount}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">INDEXED CHUNKS</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {chunks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">TOTAL TOKENS (EST)</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">
            {chunks.reduce((acc, c) => acc + c.tokenEstimate, 0)}
          </span>
        </div>
      </div>

      {/* Search Chunks */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search extracted chunks by text, page number, section, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Chunks Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Showing {filteredChunks.length} of {chunks.length} chunks
          </span>
        </div>

        {filteredChunks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40">
            No chunks match the current search keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                onClick={() => setSelectedChunk(chunk)}
                className="group p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {chunk.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {chunk.pageOrSection}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      ~{chunk.tokenEstimate} tokens
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono mt-2.5 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                    {chunk.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-blue-400 font-medium">
                  <span className="flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3.5 h-3.5" /> Inspect Chunk
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{chunk.fileName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SourceChunkModal chunk={selectedChunk} onClose={() => setSelectedChunk(null)} />
    </div>
  );
}
