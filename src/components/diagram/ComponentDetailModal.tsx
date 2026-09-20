'use client';

import React from 'react';
import { ComponentItem, ConnectionItem } from '@/types/architecture';
import { X, ArrowRight, ArrowLeft, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ComponentDetailModalProps {
  component: ComponentItem | null;
  connections: ConnectionItem[];
  allComponents: ComponentItem[];
  onClose: () => void;
  onSelectComponent: (comp: ComponentItem) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  connections,
  allComponents,
  onClose,
  onSelectComponent,
}) => {
  if (!component) return null;

  const inbound = connections.filter((c) => c.target === component.id);
  const outbound = connections.filter((c) => c.source === component.id);

  const compMap = new Map(allComponents.map((c) => [c.id, c]));

  return (
    <div className="absolute top-4 right-4 z-20 w-96 max-h-[calc(100vh-6rem)] overflow-y-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-5 text-slate-200">
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            {component.type.replace('_', ' ')}
          </span>
          <h3 className="text-base font-semibold text-slate-100 mt-0.5">{component.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4 text-xs">
        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase">Description</label>
          <p className="mt-1 text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
            {component.description}
          </p>
        </div>

        {component.technology && (
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase">Technology Stack</label>
            <div className="mt-1 font-mono text-slate-200 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700">
              {component.technology}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase">Detection Confidence</label>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-xs">
              {component.confidence === 'explicit' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Explicitly Documented</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">Architecturally Inferred</span>
                </>
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase">Source Reference</label>
            <div className="mt-1 font-mono text-slate-400 truncate" title={component.source_reference}>
              {component.source_reference || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Inbound Connections */}
        <div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
            <ArrowLeft className="w-3 h-3 text-cyan-400" /> Inbound Connections ({inbound.length})
          </div>
          {inbound.length === 0 ? (
            <p className="mt-1 text-[11px] text-slate-400 italic">No inbound calls detected.</p>
          ) : (
            <div className="mt-1 space-y-1.5">
              {inbound.map((c, i) => {
                const src = compMap.get(c.source);
                return (
                  <div
                    key={i}
                    onClick={() => src && onSelectComponent(src)}
                    className="p-2 rounded bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{src ? src.name : c.source}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded">
                        {c.communication_method}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{c.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Outbound Connections */}
        <div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
            <ArrowRight className="w-3 h-3 text-emerald-400" /> Outbound Calls ({outbound.length})
          </div>
          {outbound.length === 0 ? (
            <p className="mt-1 text-[11px] text-slate-400 italic">No outbound calls detected.</p>
          ) : (
            <div className="mt-1 space-y-1.5">
              {outbound.map((c, i) => {
                const tgt = compMap.get(c.target);
                return (
                  <div
                    key={i}
                    onClick={() => tgt && onSelectComponent(tgt)}
                    className="p-2 rounded bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{tgt ? tgt.name : c.target}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        {c.communication_method}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{c.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
