'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  Database,
  Server,
  Workflow,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Globe,
  Radio,
  Loader2,
} from 'lucide-react';
import { ArchitectureAnalysis } from '@/types/architecture';
import { getProjectById } from '@/lib/storage/project-store';

export default function ArchitectureReportPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      setProject(getProjectById(projectId));
    }
  }, [projectId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !project) return;
    setIsExporting(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#090d16',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${project.project.name.toLowerCase().replace(/\s+/g, '-')}-architecture-report.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF download, falling back to print', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  if (!project) return null;

  const { project: meta, components, connections, databases, apis, data_flows, unknowns, observations } = project;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Comprehensive Architecture Specification Report
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export a high-resolution, developer-grade architecture dossier for stakeholders and engineering records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Dossier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div
        ref={reportRef}
        className="bg-slate-950 border border-slate-800 rounded-2xl p-8 sm:p-12 space-y-10 shadow-2xl text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-500 font-mono text-xs font-bold uppercase tracking-wider">
              <span>ArchLens AI Engine</span>
              <span>•</span>
              <span>System Architectural Dossier</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Generated: {new Date(project.uploadedAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 print:text-black">
              {meta.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Source File: {project.fileName} ({project.pageCount} pages parsed)
            </p>
          </div>

          <p className="text-sm text-slate-300 print:text-gray-700 leading-relaxed max-w-4xl">
            {meta.description}
          </p>
        </div>

        {/* Section 1: System Purpose & Goals */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
            1. System Purpose & Core Architectural Goals
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {meta.purpose}
          </p>
        </div>

        {/* Section 2: Technology Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
            2. Verified Technology Stack
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-cyan-400 block font-semibold">FRONTEND</span>
              <p className="mt-1 font-mono text-slate-200">
                {meta.technologies.frontend?.join(', ') || 'Not specified'}
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">BACKEND</span>
              <p className="mt-1 font-mono text-slate-200">
                {meta.technologies.backend?.join(', ') || 'Not specified'}
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-amber-400 block font-semibold">DATABASES</span>
              <p className="mt-1 font-mono text-slate-200">
                {meta.technologies.database?.join(', ') || 'Not specified'}
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-blue-400 block font-semibold">PROTOCOLS / INFRA</span>
              <p className="mt-1 font-mono text-slate-200">
                {[...(meta.technologies.infrastructure || []), ...(meta.technologies.apis_and_protocols || [])].join(', ') || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Component Catalog */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
            3. Software Component Inventory ({components.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Component</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Technology</th>
                  <th className="pb-2 font-sans">Description</th>
                  <th className="pb-2 text-right">Confidence & Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {components.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 font-bold text-slate-200">{c.name}</td>
                    <td className="py-2.5 text-slate-400">{c.type.replace('_', ' ')}</td>
                    <td className="py-2.5 text-blue-400">{c.technology || '-'}</td>
                    <td className="py-2.5 font-sans text-slate-300 pr-4">{c.description}</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[10px] block text-slate-400">{c.confidence}</span>
                      <span className="text-[10px] text-slate-500">{c.source_reference}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Inter-Component Relationships */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
            4. Inter-Component Communication Channels ({connections.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Protocol</th>
                  <th className="pb-2 font-sans">Interaction Rationale</th>
                  <th className="pb-2 text-right">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {connections.map((conn, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 text-cyan-400">{conn.source}</td>
                    <td className="py-2.5 text-emerald-400">{conn.target}</td>
                    <td className="py-2.5 text-blue-300">{conn.communication_method}</td>
                    <td className="py-2.5 font-sans text-slate-300 pr-4">{conn.explanation}</td>
                    <td className="py-2.5 text-right text-slate-500 text-[10px]">{conn.source_reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Traced Execution Flows */}
        {data_flows?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              5. Traced Execution & Data Flows
            </h3>
            <div className="space-y-4">
              {data_flows.map((flow) => (
                <div key={flow.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">{flow.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{flow.source_reference}</span>
                  </div>
                  <p className="text-xs text-slate-400">{flow.description}</p>
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {flow.steps.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-blue-400 shrink-0">
                          {s.step_number || i + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200">{s.component_id}:</span>{' '}
                          <span className="text-slate-300">{s.action}</span>
                          {s.details && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{s.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Architectural Observations */}
        {observations?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              6. Key Architectural Observations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              {observations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 7: Uncertainty & Missing Information Matrix */}
        {unknowns?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              7. Missing Information & Architectural Gaps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unknowns.map((u, i) => (
                <div key={i} className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">{u.category}</span>
                  <span className="text-slate-200 font-medium block">{u.information}</span>
                  <p className="text-slate-400 text-[11px]">Reason: {u.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
          <span>ArchLens AI Architectural Analysis Platform</span>
          <span>Verified against documentation source of truth</span>
        </div>
      </div>
    </div>
  );
}
