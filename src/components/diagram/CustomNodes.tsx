import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ComponentItem } from '@/types/architecture';
import {
  Layers,
  Server,
  Database,
  Cpu,
  Radio,
  ShieldCheck,
  Globe,
  HardDrive,
  HelpCircle,
} from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  frontend: Globe,
  backend_service: Server,
  database: Database,
  cache: Cpu,
  message_broker: Radio,
  api_gateway: Layers,
  auth_provider: ShieldCheck,
  storage: HardDrive,
  external_service: Layers,
  unknown: HelpCircle,
};

const typeColors: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  frontend: {
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    text: 'text-cyan-400',
  },
  backend_service: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    text: 'text-emerald-400',
  },
  database: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40 hover:border-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    text: 'text-amber-400',
  },
  cache: {
    bg: 'bg-violet-950/40',
    border: 'border-violet-500/40 hover:border-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    text: 'text-violet-400',
  },
  message_broker: {
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40 hover:border-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    text: 'text-rose-400',
  },
  api_gateway: {
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/40 hover:border-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    text: 'text-blue-400',
  },
  auth_provider: {
    bg: 'bg-yellow-950/40',
    border: 'border-yellow-500/40 hover:border-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    text: 'text-yellow-400',
  },
  storage: {
    bg: 'bg-teal-950/40',
    border: 'border-teal-500/40 hover:border-teal-400',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    text: 'text-teal-400',
  },
  external_service: {
    bg: 'bg-slate-900/60',
    border: 'border-slate-600 hover:border-slate-400',
    badge: 'bg-slate-700/40 text-slate-300 border-slate-600',
    text: 'text-slate-400',
  },
  unknown: {
    bg: 'bg-zinc-900/60',
    border: 'border-zinc-700 hover:border-zinc-500',
    badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    text: 'text-zinc-400',
  },
};

export const CustomComponentNode = memo(({ data, selected }: NodeProps) => {
  const comp = data as unknown as ComponentItem;
  const colors = typeColors[comp.type] || typeColors.unknown;
  const Icon = typeIcons[comp.type] || HelpCircle;

  return (
    <div
      className={`relative w-[260px] rounded-lg border backdrop-blur-md p-3.5 transition-all shadow-lg ${
        colors.bg
      } ${colors.border} ${
        selected ? 'ring-2 ring-blue-400 border-blue-400 shadow-blue-500/20' : ''
      }`}
    >
      {/* Target handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-900"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded border ${colors.badge}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-100 truncate" title={comp.name}>
              {comp.name}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
              {comp.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Confidence Pill */}
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${
            comp.confidence === 'explicit'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
          title={
            comp.confidence === 'explicit'
              ? 'Explicitly stated in documentation'
              : 'Architecturally inferred'
          }
        >
          {comp.confidence === 'explicit' ? 'explicit' : 'inferred'}
        </span>
      </div>

      {comp.technology && (
        <div className="mt-2 text-[10px] font-mono bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-800 truncate">
          Tech: {comp.technology}
        </div>
      )}

      <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
        {comp.description}
      </p>

      {/* Source page citation */}
      {comp.source_reference && (
        <div className="mt-2 text-[9px] font-mono text-slate-400 border-t border-slate-800/80 pt-1 truncate">
          Ref: {comp.source_reference}
        </div>
      )}

      {/* Source handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-blue-400 !border-2 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-blue-400 !border-2 !border-slate-900"
      />
    </div>
  );
});

CustomComponentNode.displayName = 'CustomComponentNode';

export const nodeTypes = {
  customComponent: CustomComponentNode,
};
