'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Workflow,
  ArrowDown,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Server,
  Database,
  Globe,
} from 'lucide-react';
import { ArchitectureAnalysis, DataFlowItem, ComponentItem } from '@/types/architecture';
import { getProjectById, getCustomApiKey } from '@/lib/storage/project-store';

export default function DataFlowPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);

  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [customFlowQuery, setCustomFlowQuery] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customFlowError, setCustomFlowError] = useState<string | null>(null);
  const [flows, setFlows] = useState<DataFlowItem[]>([]);

  useEffect(() => {
    if (projectId) {
      const data = getProjectById(projectId);
      if (data) {
        setProject(data);
        setFlows(data.data_flows || []);
        if (data.data_flows?.length > 0) {
          setSelectedFlowId(data.data_flows[0].id);
        }
      }
    }
  }, [projectId]);

  const compMap = React.useMemo(() => {
    if (!project) return new Map<string, ComponentItem>();
    return new Map(project.components.map((c) => [c.id, c]));
  }, [project]);

  const currentFlow = flows.find((f) => f.id === selectedFlowId) || flows[0];

  const handleGenerateCustomFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFlowQuery.trim() || !project) return;

    setIsGeneratingCustom(true);
    setCustomFlowError(null);

    const customKey = getCustomApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (customKey) {
      headers['x-gemini-api-key'] = customKey;
    }

    try {
      const response = await fetch('/api/flow', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: customFlowQuery.trim(),
          projectSummary: {
            name: project.project.name,
            components: project.components,
            connections: project.connections,
          },
          documentContext: project.documentText,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to trace flow.');
      }

      setFlows((prev) => [result, ...prev]);
      setSelectedFlowId(result.id);
      setCustomFlowQuery('');
    } catch (err: any) {
      setCustomFlowError(err.message || 'Error tracing custom data flow.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
          <Workflow className="w-4 h-4 text-cyan-400" />
          Interactive Execution & Data Flows
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Step-by-step transaction walkthroughs grounded in documented system components and protocols.
        </p>
      </div>

      {/* Ad-hoc Custom Flow Form */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Ask about a specific operation or user interaction</span>
        </div>

        <form onSubmit={handleGenerateCustomFlow} className="flex gap-2">
          <input
            type="text"
            placeholder='e.g. "How does user authentication work?" or "What happens when data is persisted?"'
            value={customFlowQuery}
            onChange={(e) => setCustomFlowQuery(e.target.value)}
            disabled={isGeneratingCustom}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isGeneratingCustom || !customFlowQuery.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            {isGeneratingCustom ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Trace Flow</span>
          </button>
        </form>

        {customFlowError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{customFlowError}</span>
          </div>
        )}
      </div>

      {/* Flow Selectors & Flow Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Flow list */}
        <div className="space-y-2 lg:col-span-1">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Documented Flows ({flows.length})
          </label>
          {flows.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 bg-slate-950/40 rounded-xl border border-slate-800">
              No specific flows documented. Use the input box above to analyze a custom operation.
            </p>
          ) : (
            flows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => setSelectedFlowId(flow.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedFlowId === flow.id
                    ? 'bg-blue-600/15 border-blue-500/40 text-slate-100 shadow-sm'
                    : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold line-clamp-1">{flow.name}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                  <span>{flow.steps?.length || 0} steps</span>
                  <span className="truncate max-w-[100px]">{flow.source_reference}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right: Step-by-Step Flow Visualizer */}
        <div className="lg:col-span-3 space-y-4">
          {currentFlow ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-100">{currentFlow.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Source: {currentFlow.source_reference || 'Documentation'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {currentFlow.description}
                </p>
              </div>

              {/* Steps timeline / cards */}
              {currentFlow.steps?.length > 0 ? (
                <div className="relative space-y-4 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                  {currentFlow.steps.map((step, idx) => {
                    const comp = compMap.get(step.component_id);

                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        {/* Step Number Circle */}
                        <div className="relative z-10 w-8 h-8 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-xs font-mono font-bold text-blue-400 shrink-0">
                          {step.step_number || idx + 1}
                        </div>

                        {/* Step Card */}
                        <div className="flex-1 p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-200">
                                {comp ? comp.name : step.component_id}
                              </span>
                              {comp && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                                  {comp.type.replace('_', ' ')}
                                </span>
                              )}
                            </div>

                            {step.communication_method && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
                                {step.communication_method}
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-medium text-slate-300">{step.action}</p>

                          {step.details && (
                            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                              {step.details}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center space-y-2">
                  <HelpCircle className="w-6 h-6 text-zinc-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">
                    The uploaded project documentation does not provide enough information to trace this operation.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ArchLens strictly refuses to hallucinate unverified execution steps.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40">
              Select or generate a data flow to inspect execution sequence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
