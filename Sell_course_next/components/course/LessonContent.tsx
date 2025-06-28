import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { VideoLesson } from './VideoLesson'
import { DocLesson } from './DocLesson'
import { QuizComponent } from './QuizComponent'
import { apiCall } from '../../app/api/courses/lessons/lessons'
import {
  VideoResponse,
  DocumentResponse,
  QuizResponse,
  ContentResponse,
  ContentData
} from '../../app/types/Course/Lesson/Lessons'

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: string;
    content?: VideoResponse | DocumentResponse | QuizResponse | { text: string };
    contents?: ContentResponse[];
  };
  content?: ContentResponse | null;
  onContentComplete?: (contentId: string) => void;
}

export function LessonContent({ lesson, content, onContentComplete }: LessonContentProps) {
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const selected = content || (lesson.contents && lesson.contents[0]);
      if (!selected) {
        setContentData(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        switch (selected.contentType.toLowerCase()) {
          case 'video':
            const videoData = await apiCall<VideoResponse>(`/api/video/view_video/${selected.contentId}`);
            setContentData({ type: 'video', data: videoData });
            break;
          case 'doc':
            const docData = await apiCall<DocumentResponse>(`/api/docs/view_doc/${selected.contentId}`);
            setContentData({ type: 'doc', data: docData });
            break;
          case 'quiz':
            const quizData = await apiCall<QuizResponse>(`/api/quizz/random`);
            setContentData({ type: 'quiz', data: quizData });
            break;
          default:
            setContentData({ type: 'text', data: { text: 'Content not available' } });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
        setContentData({ type: 'text', data: { text: 'Error loading content' } });
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [lesson.contents, lesson.title, content]);

  const renderLessonContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      );
    }

    if (!contentData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No content available</p>
          </div>
        </div>
      );
    }

    switch (contentData.type) {
      case 'video':
        const videoData = contentData.data as VideoResponse;
        return (
          <VideoLesson 
            lesson={{
              title: lesson.title,
              content: {
                videoUrl: videoData.url || '',
                description: videoData.description || ''
              }
            }} 
          />
        );

      case 'doc':
        const docData = contentData.data as DocumentResponse;
        return (
          <DocLesson 
            lesson={{
              title: content?.contentName || lesson.contents?.[0]?.contentName || lesson.title,
              content: docData.url || '',
              contentType: docData.fileType || 'pdf'
            }}
            documentData={docData}
            onComplete={onContentComplete}
            contentId={content?.contentId || lesson.contents?.[0]?.contentId}
          />
        );

      case 'quiz':
        return (
          <QuizComponent 
            lesson={{
              id: lesson.id,
              title: lesson.title,
              quiz: {
                id: lesson.contents?.[0]?.contentId || '',
                questions: []
              }
            }}
          />
        );

      default:
        return (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Unsupported content type: {contentData.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{content?.contentName || lesson.contents?.[0]?.contentName || lesson.title}</h1>
        <p className="text-muted-foreground">{lesson.duration}</p>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {renderLessonContent()}
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-file-text"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Lesson Slides</div>
              <div className="text-sm text-muted-foreground">PDF, 2.3MB</div>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-code-2"
              >
                <polyline points="18 8 22 12 18 16" />
                <polyline points="6 8 2 12 6 16" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Code Examples</div>
              <div className="text-sm text-muted-foreground">ZIP, 1.1MB</div>
            </div>
          </Card>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Previous Lesson
        </Button>
        <Button className="flex items-center gap-2">
          Next Lesson
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
