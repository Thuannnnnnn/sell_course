"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type UploadStatus = 'uploading' | 'success' | 'error' | 'canceled';
export type UploadType = 'video' | 'doc' | 'video-update' | 'doc-update' | 'video-script-update';

export interface UploadTask {
  id: string;
  type: UploadType;
  filename: string;
  contentId?: string;
  videoId?: string;
  docsId?: string;
  progress: number; // 0 - 100
  status: UploadStatus;
  error?: string;
  startedAt: number;
  cancel: () => void;
}

interface StartUploadParams {
  type: UploadType;
  file: File;
  contentId?: string;
  videoId?: string; // for update operations
  docsId?: string;  // for document update operations
  token: string;
  title?: string; // for video
  uploader: (args: { 
    file: File; 
    contentId?: string; 
    videoId?: string;
    docsId?: string;
    token: string; 
    title?: string; 
    signal: AbortSignal; 
    onProgress: (p: number) => void; 
  }) => Promise<unknown>;
}

interface UploadManagerContextValue {
  tasks: UploadTask[];
  startUpload: (params: StartUploadParams) => string; // returns taskId
  clearTask: (id: string) => void;
  cancelTask: (id: string) => void;
}

const UploadManagerContext = createContext<UploadManagerContextValue | undefined>(undefined);

export const useUploadManager = () => {
  const ctx = useContext(UploadManagerContext);
  if (!ctx) throw new Error('useUploadManager must be used within UploadManagerProvider');
  return ctx;
};

export const UploadManagerProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const startUpload = useCallback(({ type, file, contentId, videoId, docsId, token, title, uploader }: StartUploadParams) => {
    const controller = new AbortController();
    const id = simpleId();
    const newTask: UploadTask = {
      id,
      type,
      filename: file.name,
      contentId,
      videoId,
      docsId,
      progress: 0,
      status: 'uploading',
      startedAt: Date.now(),
      cancel: () => controller.abort(),
    };
    setTasks(prev => [newTask, ...prev]);

    // Kick off async upload
    (async () => {
      try {
        await uploader({
          file,
          contentId,
          videoId,
          docsId,
          token,
          title,
          signal: controller.signal,
          onProgress: (p: number) => {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: p } : t));
          }
        });
        setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: 100, status: 'success' } : t));
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'canceled', error: 'Canceled' } : t));
        } else {
          const message = err instanceof Error ? err.message : 'Upload failed';
          setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'error', error: message } : t));
        }
      }
    })();

    return id;
  }, []);

  const clearTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const cancelTask = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) task.cancel();
      return prev; // state will be updated in async flow above
    });
  }, []);

  // Warn before unload if uploading
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (tasks.some(t => t.status === 'uploading')) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [tasks]);

  return (
    <UploadManagerContext.Provider value={{ tasks, startUpload, clearTask, cancelTask }}>
      {children}
    </UploadManagerContext.Provider>
  );
};

// Simple UUID fallback to avoid adding dependency types (not RFC4122 strict but fine for ids)
const simpleId = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now().toString(36));
