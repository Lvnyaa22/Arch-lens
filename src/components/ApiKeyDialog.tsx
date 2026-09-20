'use client';

import React, { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, X, Shield } from 'lucide-react';
import { getCustomApiKey, setCustomApiKey } from '@/lib/storage/project-store';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getCustomApiKey();
      setApiKey(stored || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setCustomApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setCustomApiKey('');
    setApiKey('');
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Gemini API Key Settings</h3>
              <p className="text-xs text-slate-400">Configure your Google Generative AI credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-start gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Your API key is kept client-side or passed securely to the Next.js server endpoint during requests. It is never logged or stored externally.
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Note: If <code className="text-blue-300 bg-slate-900 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is already configured in the server environment, this field can be left blank.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {isSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/30 p-2 rounded">
              <Check className="w-4 h-4" />
              <span>API key configuration updated successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={handleClear}
              type="button"
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
            >
              Clear Key
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                type="button"
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                type="button"
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
