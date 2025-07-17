'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Play,
  FileText,
  HelpCircle,
  CheckCircle,
  Video,
  ExternalLink,
  Download
} from 'lucide-react';
import {
  ContentReviewData,
  VideoReviewData,
  DocReviewData,
  QuizReviewData,
} from '../../app/api/courses/course';

interface ContentModalProps {
  content: ContentReviewData;
}


export function ContentModal({ content }: ContentModalProps) {
  const [open, setOpen] = useState(false);

  const getIcon = () => {
    switch (content.contentType) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'doc':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'quizz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getButtonColor = () => {
    switch (content.contentType) {
      case 'video':
        return 'bg-red-600 hover:bg-red-700';
      case 'doc':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'quiz':
        return 'bg-green-600 hover:bg-green-700';
      case 'quizz':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className={`${getButtonColor()} text-white`}
        >
          {getIcon()}
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {content.contentName}
            <Badge variant="outline" className="text-xs">
              {content.contentType.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 overflow-y-auto max-h-[calc(95vh-120px)]">
          {content.video && <VideoPreview video={content.video} />}
          {content.doc && <DocPreview doc={content.doc} />}
          {content.quiz && <QuizPreview quiz={content.quiz} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VideoPreview({ video }: { video: VideoReviewData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isYouTube = video.url.includes('youtube.com') || video.url.includes('youtu.be');
  const isVimeo = video.url.includes('vimeo.com');
  const isDirectVideo = video.url.match(/\.(mp4|webm|ogg|mov|avi)$/i);

  const getEmbedUrl = () => {
    if (isYouTube) {
      // Convert YouTube URL to embed URL
      const videoId = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
    } else if (isVimeo) {
      // Convert Vimeo URL to embed URL
      const videoId = video.url.match(/vimeo\.com\/(\d+)/);
      return videoId ? `https://player.vimeo.com/video/${videoId[1]}` : null;
    } else if (isDirectVideo) {
      // Direct video file
      return video.url;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
          {embedUrl ? (
            <div className="relative w-full h-full">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                    <p className="text-gray-400">Loading video...</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Failed to load video</p>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Video
                    </a>
                  </div>
                </div>
              )}
              
              {!error && (
                <>
                  {isDirectVideo ? (
                    <video
                      src={embedUrl}
                      controls
                      className="w-full h-full"
                      onLoadStart={() => setLoading(true)}
                      onLoadedData={() => setLoading(false)}
                      onError={() => {
                        setLoading(false);
                        setError('Unable to load video');
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        setLoading(false);
                        setError('Unable to load video');
                      }}
                      title={video.title}
                    />
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Video preview not available</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported: YouTube, Vimeo, direct video files
                </p>
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Video
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{video.title}</h3>
        <p className="text-gray-600 mb-4">{video.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Video URL:</span>
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {video.url}
            </a>
          </div>
          
          {video.urlScript && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Script:</span>
              <a 
                href={video.urlScript} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Download Script
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocPreview({ doc }: { doc: DocReviewData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGoogleDoc = doc.url.includes('docs.google.com');
  const isPdf = doc.url.toLowerCase().includes('.pdf');
  const isOfficeDoc = doc.url.toLowerCase().includes('.docx') || doc.url.toLowerCase().includes('.doc');

  const getEmbedUrl = () => {
    if (isGoogleDoc) {
      return doc.url.replace('/edit', '/preview');
    } else if (isPdf) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}&embedded=true`;
    } else if (isOfficeDoc) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.url)}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{doc.title}</h3>
        <div className="flex items-center gap-2 mb-4">
          <a 
            href={doc.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            {doc.url}
          </a>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Document Preview</h4>
          </div>
        </div>
        <div className="p-4">
          {embedUrl ? (
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading document...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 p-8 rounded-lg text-center">
                  <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">Failed to load document preview</p>
                  <p className="text-sm text-red-500 mb-4">{error}</p>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </a>
                </div>
              )}
              {!error && (
                <iframe
                  src={embedUrl}
                  className="w-full h-[600px] border rounded-lg"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError('Unable to load document preview');
                  }}
                  title={doc.title}
                />
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Document preview not available for this file type</p>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: Google Docs, PDF, Word documents
              </p>
              <a 
                href={doc.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizPreview({ quiz }: { quiz: QuizReviewData }) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Quiz Preview</h3>
        <p className="text-sm text-gray-600">
          {quiz.questions.length} questions • Correct answers are highlighted in green
        </p>
      </div>
      
      <ScrollArea className="h-[500px]">
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.questionId} className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Badge variant="outline" className="text-xs mr-2">
                    {question.difficulty}
                  </Badge>
                  <span className="text-xs text-gray-500">Weight: {question.weight}</span>
                </div>
              </div>
              
              <h4 className="font-medium mb-3">{question.question}</h4>
              
              <div className="space-y-2">
                {question.answers.map((answer, answerIndex) => (
                  <div 
                    key={answer.answerId} 
                    className={`p-3 rounded-lg border-2 ${
                      answer.isCorrect 
                        ? 'bg-green-100 border-green-500 text-green-800' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        answer.isCorrect 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + answerIndex)}
                      </div>
                      <span className="flex-1">{answer.answer}</span>
                      {answer.isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
