'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  Code2,
  GraduationCap,
  Briefcase,
  History,
  Trash2,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { ArchitectureAnalysis, ChatMessage, ChatThread, DocumentChunk, ExplanationMode } from '@/types/architecture';
import {
  getProjectById,
  getCustomApiKey,
  getChatThreadsForProject,
  saveChatThreadForProject,
  clearChatThreadsForProject,
} from '@/lib/storage/project-store';
import { SourceChunkModal } from '@/components/SourceChunkModal';

const QUICK_QUESTIONS = [
  'Explain the overall project architecture.',
  'Where and how is data stored in this system?',
  'How does the client communicate with the backend services?',
  'What happens when a user performs a key action or login?',
  'Which API endpoints are responsible for main operations?',
  'What are the main technical trade-offs and potential bottlenecks?',
];

export default function GroundedChatPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ArchitectureAnalysis | null>(null);

  const [mode, setMode] = useState<ExplanationMode>('developer');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('current-session');
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      const data = getProjectById(projectId);
      if (data) {
        setProject(data);
        const storedThreads = getChatThreadsForProject(projectId);
        setThreads(storedThreads);

        // Initialize with default greeting
        setMessages([
          {
            id: 'init-msg',
            role: 'assistant',
            content: `Hello! I am ArchLens AI, dedicated specifically to **${data.project.name}**. I have ingested the ${data.pageCount}-page technical documentation and indexed ${(data.chunks || []).length} chunks. Ask me anything about components, protocols, databases, or execution flows.`,
            citations: [`${data.fileName}`],
            mode: 'developer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (questionText: string) => {
    const text = questionText.trim();
    if (!text || isLoading || !project) return;

    setErrorMsg(null);
    setInputValue('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      mode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    const customKey = getCustomApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (customKey) {
      headers['x-gemini-api-key'] = customKey;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: text,
          mode,
          chunks: project.chunks || [],
          projectSummary: {
            name: project.project.name,
            description: project.project.description,
            technologies: project.project.technologies,
            components: project.components,
            connections: project.connections,
            databases: project.databases,
            apis: project.apis,
            unknowns: project.unknowns,
          },
          documentContext: project.documentText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate answer.');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        referencedChunks: data.referencedChunks || [],
        mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Save to chat thread history
      if (projectId) {
        const thread: ChatThread = {
          id: activeThreadId === 'current-session' ? `th-${Date.now()}` : activeThreadId,
          projectId,
          title: text.length > 35 ? text.slice(0, 35) + '...' : text,
          createdAt: new Date().toISOString(),
          messages: finalMessages,
        };
        saveChatThreadForProject(projectId, thread);
        setThreads(getChatThreadsForProject(projectId));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while communicating with Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (!project) return;
    setActiveThreadId(`th-${Date.now()}`);
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `New conversation started for **${project.project.name}**. Ask me any technical question!`,
        citations: [`${project.fileName}`],
        mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSelectThread = (thread: ChatThread) => {
    setActiveThreadId(thread.id);
    setMessages(thread.messages);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all stored chat history for this project?')) {
      clearChatThreadsForProject(projectId);
      setThreads([]);
      handleNewChat();
    }
  };

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[620px] bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden relative">
      {/* Top Banner & Mode Switcher */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Grounded Architecture RAG</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Context: {project.project.name} • {(project.chunks || []).length} chunks
            </span>
          </div>
        </div>

        {/* Explanation Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setMode('developer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              mode === 'developer'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Detailed technical explanation with components, APIs, files, and protocols"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer</span>
          </button>

          <button
            onClick={() => setMode('beginner')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              mode === 'beginner'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Simplified conceptual explanation using plain-English analogies and minimal jargon"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Beginner</span>
          </button>

          <button
            onClick={() => setMode('interview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              mode === 'interview'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="System design interview focus on trade-offs, scalability, and bottlenecks"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Interview</span>
          </button>
        </div>

        {/* History and New Chat buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              showHistory
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Chat History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History ({threads.length})</span>
          </button>

          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs transition-colors flex items-center gap-1"
            title="Start New Chat Session"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Container: Chat + History Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-emerald-400'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`p-4 rounded-xl space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Clickable Citations and Chunk Badges */}
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                      Grounded Source References:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {msg.citations.map((cite, i) => {
                        const matchingChunk = (project.chunks || []).find(
                          (c) =>
                            cite.toLowerCase().includes(c.pageOrSection.toLowerCase()) ||
                            cite.toLowerCase().includes(c.id.toLowerCase())
                        );

                        return (
                          <button
                            key={i}
                            onClick={() => matchingChunk && setSelectedChunk(matchingChunk)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 hover:bg-blue-950/60 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{cite}</span>
                            {matchingChunk && <ExternalLink className="w-2.5 h-2.5 opacity-70" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[9px] font-mono pt-1">
                  <span className={msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}>
                    {msg.timestamp}
                  </span>
                  {msg.mode && (
                    <span className="text-slate-500 uppercase tracking-wider">
                      {msg.mode} mode
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs max-w-xl">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 rounded-tl-none flex items-center gap-2 text-slate-400 font-mono text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Retrieving document chunks & reasoning in {mode} mode...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* History Slide-over Drawer */}
        {showHistory && (
          <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col p-4 space-y-3 z-10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-400" />
                <span>Chat History</span>
              </h4>
              {threads.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {threads.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2 text-center">
                  No previous sessions saved yet.
                </p>
              ) : (
                threads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectThread(t)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      activeThreadId === t.id
                        ? 'bg-blue-600/20 border-blue-500/40 text-slate-100'
                        : 'bg-slate-950/40 hover:bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-medium truncate text-slate-200">{t.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1 flex justify-between">
                      <span>{t.messages.length} messages</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0">Prompts:</span>
        {QUICK_QUESTIONS.slice(0, 3).map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Ask about ${project.project.name} in ${mode} mode...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <SourceChunkModal chunk={selectedChunk} onClose={() => setSelectedChunk(null)} />
    </div>
  );
}
