'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Key,
  ShieldCheck,
  FileCode,
  ArrowRight,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { saveProjectToStorage, getCustomApiKey } from '@/lib/storage/project-store';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { DEMO_PROJECT_SHOPSTREAM, DEMO_PROJECT_COLLABCANVAS } from '@/lib/demo/demo-projects';

const PIPELINE_STEPS = [
  'Validating uploaded technical file format & size...',
  'Extracting document text, code AST, and page indexes...',
  'Generating semantic RAG chunks & token estimation...',
  'Analyzing architecture with Gemini Generative AI...',
  'Validating structured schema with Zod & computing topology...',
];

const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.txt',
  '.md',
  '.markdown',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.go',
  '.java',
  '.rs',
  '.rb',
  '.json',
  '.yaml',
  '.yml',
  '.sql',
  '.html',
  '.css',
  '.env',
];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);

  // Manual raw text tab option
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState('');
  const [rawTitle, setRawTitle] = useState('');

  const validateFile = (file: File): string | null => {
    if (file.size === 0) {
      return 'The selected file is empty (0 bytes).';
    }
    if (file.size > 25 * 1024 * 1024) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 25MB limit.`;
    }
    const name = file.name.toLowerCase();
    const isSupported = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!isSupported) {
      return `Unsupported file format (${name}). Please upload PDF, DOCX, Markdown, plain text, or source code files.`;
    }
    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const err = validateFile(file);
      if (err) {
        setErrorMsg(err);
        setSelectedFile(null);
      } else {
        setErrorMsg(null);
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const err = validateFile(file);
      if (err) {
        setErrorMsg(err);
        setSelectedFile(null);
      } else {
        setErrorMsg(null);
        setSelectedFile(file);
      }
    }
  };

  const handleLoadDemo = (demo: any) => {
    saveProjectToStorage(demo);
    router.push(`/project/${demo.id}`);
  };

  const startAnalysis = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentStepIndex(0);

    const customKey = getCustomApiKey();
    const headers: Record<string, string> = {};
    if (customKey) {
      headers['x-gemini-api-key'] = customKey;
    }

    try {
      const stepInterval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);

      let response: Response;

      if (activeTab === 'file') {
        if (!selectedFile) {
          throw new Error('Please select a file to upload.');
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        response = await fetch('/api/analyze', {
          method: 'POST',
          headers,
          body: formData,
        });
      } else {
        if (!rawText.trim()) {
          throw new Error('Please enter document content to analyze.');
        }

        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: rawText,
            fileName: rawTitle ? `${rawTitle}.md` : 'architecture-spec.md',
          }),
        });
      }

      clearInterval(stepInterval);
      setCurrentStepIndex(PIPELINE_STEPS.length - 1);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze architecture document.');
      }

      saveProjectToStorage(data);

      setTimeout(() => {
        router.push(`/project/${data.id}`);
      }, 800);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'An unexpected error occurred during processing.');
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Source Grounding Engine
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-2">
          Upload Project Documentation & Source Files
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
          Upload software specifications, design docs, or code files (PDF, DOCX, Markdown, TXT, Python, TypeScript, etc.).
          ArchLens extracts grounded architecture without static templates.
        </p>
      </div>

      {/* Quick Demo Loader Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200">Want to test immediately without a file?</span>
            <p className="text-[11px] text-slate-400">Load a pre-configured architecture demo project with 1 click.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleLoadDemo(DEMO_PROJECT_SHOPSTREAM)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Demo 1: ShopStream (E-Commerce)
          </button>
          <button
            onClick={() => handleLoadDemo(DEMO_PROJECT_COLLABCANVAS)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            Demo 2: CollabCanvas (Realtime)
          </button>
        </div>
      </div>

      {/* Upload Modes Tab */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('file')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'file'
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upload Document File (PDF / DOCX / MD / Code)
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'text'
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Paste Technical Text Directly
        </button>
      </div>

      {/* Main Upload / Input Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
        {activeTab === 'file' ? (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,.markdown,.js,.jsx,.ts,.tsx,.py,.go,.java,.rs,.rb,.json,.yaml,.yml,.sql,.html,.css"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click to select or drag and drop document'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready to analyze`
                      : 'Supports PDF (with page tracking), Word (.docx), Markdown (.md), and code files (.ts, .py, .go, .java) up to 25MB'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Title / Specification Name
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Payment Gateway"
                value={rawTitle}
                onChange={(e) => setRawTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Architecture Documentation Content
              </label>
              <textarea
                rows={10}
                placeholder="Paste architecture overview, component descriptions, databases, protocols, endpoints..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="font-semibold block">Analysis Error</span>
              <p className="leading-relaxed">{errorMsg}</p>
              {errorMsg.includes('API key') && (
                <button
                  onClick={() => setIsKeyDialogOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded text-rose-200 text-xs font-medium transition-colors"
                >
                  <Key className="w-3.5 h-3.5" /> Enter Gemini API Key
                </button>
              )}
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Processing Architecture Documentation
                </h4>
                <p className="text-[11px] font-mono text-blue-400 mt-0.5">
                  {PIPELINE_STEPS[currentStepIndex]}
                </p>
              </div>
            </div>

            {/* Step Progress Pills */}
            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {PIPELINE_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx <= currentStepIndex ? 'bg-blue-500' : 'bg-slate-800'
                  }`}
                  title={step}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Server-side sandboxed text extraction</span>
          </div>

          <button
            onClick={startAnalysis}
            disabled={isProcessing || (activeTab === 'file' ? !selectedFile : !rawText.trim())}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg shadow-sm transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Architecture...</span>
              </>
            ) : (
              <>
                <span>Extract Architecture</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <ApiKeyDialog
        isOpen={isKeyDialogOpen}
        onClose={() => setIsKeyDialogOpen(false)}
      />
    </div>
  );
}
