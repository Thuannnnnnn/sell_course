"use client";
import React, { useState } from 'react';
import { useUploadManager } from './UploadManagerContext';
import { FileText, Film, Trash2, PauseCircle, Loader2, FileVideo } from 'lucide-react';
import { Progress } from '../../components/ui/progress';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export const FloatingUploadPanel: React.FC = () => {
  const { tasks, clearTask, cancelTask } = useUploadManager();
  const [collapsed, setCollapsed] = useState(false);

  const active = tasks.some(t => t.status === 'uploading');
  const visibleTasks = tasks.slice(0, 5); // show recent 5

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 shadow-lg border bg-white rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>Uploads</span>
          {active && <Badge variant="secondary" className="animate-pulse">Active</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed(c => !c)} className="text-xs px-2 py-1 rounded hover:bg-background border">
            {collapsed ? 'Show' : 'Hide'}
          </button>
          <button onClick={() => tasks.forEach(t => { if (t.status !== 'uploading') clearTask(t.id); })} className="text-xs px-2 py-1 rounded hover:bg-background border">
            Clear Done
          </button>
          <button onClick={() => tasks.forEach(t => cancelTask(t.id))} disabled={!active} className="text-xs px-2 py-1 rounded hover:bg-background border disabled:opacity-40">
            Cancel All
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="max-h-96 overflow-y-auto divide-y">
          {visibleTasks.map(task => {
            const getIcon = (type: string) => {
              switch(type) {
                case 'video':
                case 'video-update':
                  return Film;
                case 'video-script-update':
                  return FileVideo;
                case 'doc':
                case 'doc-update':
                  return FileText;
                default:
                  return FileText;
              }
            };
            
            const Icon = getIcon(task.type);
            const statusColor = task.status === 'success' ? 'text-green-600' : task.status === 'error' ? 'text-red-600' : task.status === 'canceled' ? 'text-yellow-600' : 'text-blue-600';
            
            const getTypeLabel = (type: string) => {
              switch(type) {
                case 'video': return 'Creating Video';
                case 'video-update': return 'Updating Video';
                case 'video-script-update': return 'Updating Script';
                case 'doc': return 'Creating Document';
                case 'doc-update': return 'Updating Document';
                default: return type;
              }
            };
            
            return (
              <div key={task.id} className="p-3 text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 ${statusColor}`} />
                  <div className="flex-1">
                    <div className="font-medium truncate" title={task.filename}>{task.filename}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`capitalize ${statusColor} flex items-center gap-1`}>
                        {task.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {task.status}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{getTypeLabel(task.type)}</span>
                      {task.error && <span className="text-red-500" title={task.error}>Error</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.status === 'uploading' && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cancelTask(task.id)} title="Cancel">
                        <PauseCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {task.status !== 'uploading' && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => clearTask(task.id)} title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              </div>
            );
          })}
          {tasks.length > visibleTasks.length && (
            <div className="p-2 text-[10px] text-center text-muted-foreground">{tasks.length - visibleTasks.length} more hidden...</div>
          )}
          {active && (
            <div className="p-2 text-[10px] text-center text-amber-600 bg-amber-50 border-t">Uploading in progress, please do not close this tab</div>
          )}
        </div>
      )}
    </div>
  );
};
