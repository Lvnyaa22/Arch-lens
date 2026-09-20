'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  UploadCloud,
  FileCode2,
  Key,
  FolderGit2,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { ApiKeyDialog } from './ApiKeyDialog';
import { getCustomApiKey, getProjectById } from '@/lib/storage/project-store';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [currentProjectTitle, setCurrentProjectTitle] = useState<string | null>(null);

  useEffect(() => {
    const key = getCustomApiKey();
    setHasKey(!!key);

    // Extract project id from /project/[id]
    const match = pathname.match(/\/project\/([^/]+)/);
    if (match && match[1]) {
      const proj = getProjectById(match[1]);
      if (proj) {
        setCurrentProjectTitle(proj.project.name);
      } else {
        setCurrentProjectTitle(null);
      }
    } else {
      setCurrentProjectTitle(null);
    }
  }, [pathname, isKeyDialogOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand and Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/30 transition-all">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
                  ArchLens <span className="text-blue-500 font-mono text-xs">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-1">
                  Dynamic Architecture Analyzer
                </span>
              </div>
            </Link>

            {currentProjectTitle && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-slate-800">
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-mono text-slate-300 max-w-[200px] truncate">
                  {currentProjectTitle}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links & Action buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Projects</span>
            </Link>

            <Link
              href="/upload"
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/upload'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Docs</span>
            </Link>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsKeyDialogOpen(true)}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span
                className={`w-2 h-2 rounded-full ${
                  hasKey ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-slate-500'
                }`}
              />
              <span className="hidden md:inline">API Key</span>
            </button>
          </div>
        </div>
      </header>

      <ApiKeyDialog
        isOpen={isKeyDialogOpen}
        onClose={() => setIsKeyDialogOpen(false)}
      />
    </>
  );
};
