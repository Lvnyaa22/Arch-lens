import { ArchitectureAnalysis, ChatThread, ChatMessage } from '@/types/architecture';
import { DEMO_PROJECTS } from '../demo/demo-projects';

const STORAGE_KEY = 'archlens_projects_v2';
const CHAT_THREADS_KEY = 'archlens_chat_threads_v1';
const CURRENT_PROJECT_KEY = 'archlens_current_project_id';

export function getStoredProjects(): ArchitectureAnalysis[] {
  if (typeof window === 'undefined') return DEMO_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with demo projects by default
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PROJECTS));
      return DEMO_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_PROJECTS;
  } catch (err) {
    console.error('Failed to load projects from storage', err);
    return DEMO_PROJECTS;
  }
}

export function saveProjectToStorage(project: ArchitectureAnalysis): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredProjects();
    const filtered = existing.filter((p) => p.id !== project.id);
    const updated = [project, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(CURRENT_PROJECT_KEY, project.id);
  } catch (err) {
    console.error('Failed to save project to storage', err);
  }
}

export function getProjectById(id: string): ArchitectureAnalysis | null {
  const projects = getStoredProjects();
  const found = projects.find((p) => p.id === id);
  if (found) return found;

  const demo = DEMO_PROJECTS.find((d) => d.id === id);
  return demo || null;
}

export function deleteProjectFromStorage(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredProjects();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete project', err);
  }
}

export function getCustomApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('archlens_custom_gemini_key') || null;
}

export function setCustomApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem('archlens_custom_gemini_key');
  } else {
    localStorage.setItem('archlens_custom_gemini_key', key.trim());
  }
}

// Chat Thread History Storage
export function getChatThreadsForProject(projectId: string): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${CHAT_THREADS_KEY}_${projectId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load chat history', err);
    return [];
  }
}

export function saveChatThreadForProject(projectId: string, thread: ChatThread): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getChatThreadsForProject(projectId);
    const filtered = existing.filter((t) => t.id !== thread.id);
    const updated = [thread, ...filtered];
    localStorage.setItem(`${CHAT_THREADS_KEY}_${projectId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save chat thread', err);
  }
}

export function clearChatThreadsForProject(projectId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${CHAT_THREADS_KEY}_${projectId}`);
  } catch (err) {
    console.error('Failed to clear chat threads', err);
  }
}
