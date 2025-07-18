'use client';

import { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import {
  ContentReviewData,
  VideoReviewData,
  DocReviewData,
  QuizReviewData,
  ExamReviewData
} from '../../app/api/courses/course';

// Define script data interface
interface ScriptData {
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  [key: string]: unknown;
}

// Enhanced HLS Video Player Component with Script Support
interface HLSVideoPlayerProps {
  src: string;
  scriptData: ScriptData | null;
  onLoad: () => void;
  onError: () => void;
}

function HLSVideoPlayer({ src, scriptData, onLoad, onError }: HLSVideoPlayerProps) {
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [currentScript, setCurrentScript] = useState<string>('');

  useEffect(() => {
    if (!videoRef || !src) return;

    let hlsInstance: unknown = null;

    const loadVideo = async () => {
      try {
        // Check if HLS.js is supported
        if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.src = src;
          onLoad();
          return;
        }

        // Dynamic import for HLS.js
        const HLS = await import('hls.js');
        if (HLS.default && HLS.default.isSupported()) {
          const hls = new HLS.default({
            enableWorker: false,
            lowLatencyMode: true,
          });
          hlsInstance = hls;
          hls.loadSource(src);
          hls.attachMedia(videoRef);
          hls.on(HLS.default.Events.MANIFEST_PARSED, () => {
            onLoad();
          });
          hls.on(HLS.default.Events.ERROR, (event: unknown, data: { fatal?: boolean }) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              onError();
            }
          });
        } else {
          // Fallback: try to play as regular video
          videoRef.src = src;
          onLoad();
        }
      } catch (error) {
        console.error('Failed to load HLS.js:', error);
        // If HLS.js fails to load, try native playback
        videoRef.src = src;
        onLoad();
      }
    };

    loadVideo();

    // Cleanup function
    return () => {
      if (hlsInstance && typeof hlsInstance === 'object' && hlsInstance !== null && 'destroy' in hlsInstance) {
        (hlsInstance as { destroy: () => void }).destroy();
      }
    };
  }, [videoRef, src, onLoad, onError]);

  // Script synchronization effect
  useEffect(() => {
    if (!videoRef || !scriptData?.segments) return;

    const updateScript = () => {
      const currentTime = videoRef.currentTime;
      const currentSegment = scriptData.segments?.find(
        segment => currentTime >= segment.start && currentTime <= segment.end
      );
      
      setCurrentScript(currentSegment?.text || '');
    };

    const handleTimeUpdate = () => {
      updateScript();
    };

    videoRef.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoRef.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, scriptData]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={setVideoRef}
        controls
        className="w-full h-full"
        onError={onError}
      >
        Your browser does not support HLS video playback.
      </video>
      
      {/* Script Overlay */}
      {currentScript && (
        <div className="absolute bottom-16 left-4 right-4 bg-black/80 text-white p-3 rounded-lg">
          <p className="text-sm leading-relaxed">{currentScript}</p>
        </div>
      )}
    </div>
  );
}

interface ContentModalProps {
  content: ContentReviewData;
}

interface ExamModalProps {
  exam: ExamReviewData;
}

export function ExamModal({ exam }: ExamModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <HelpCircle className="h-4 w-4" />
          Preview Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Final Exam
            <Badge variant="outline" className="text-xs">
              {exam.questions.length} QUESTIONS
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 overflow-y-auto max-h-[calc(95vh-120px)]">
          <ExamPreview exam={exam} />
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);

  // Load script data if available
  useEffect(() => {
    if (video.urlScript) {
      fetch(video.urlScript)
        .then(response => response.json())
        .then(data => {
          setScriptData(data);
        })
        .catch(err => {
          console.error('Failed to load script:', err);
        });
    }
  }, [video.urlScript]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
          <div className="relative w-full h-full">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                  <p className="text-gray-400">Loading HLS video...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Failed to load HLS video</p>
                  <p className="text-sm text-gray-500 mb-4">{error}</p>
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
              <HLSVideoPlayer
                src={video.url}
                scriptData={scriptData}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError('Unable to load HLS video stream');
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{video.title}</h3>
        <p className="text-gray-600 mb-4">{video.description}</p>
      </div>

      {/* Script Content Display - Show as reference below video */}
      {video.urlScript && scriptData && (
        <div className="bg-gray-50 rounded-lg border">
          <div className="p-4 border-b bg-gray-100 rounded-t-lg">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Video Script Reference
            </h4>
          </div>
          <div className="p-4">
            {scriptData.segments ? (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {scriptData.segments.map((segment, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-white rounded border">
                      <div className="text-xs text-gray-500 min-w-0 flex-shrink-0">
                        {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(0).padStart(2, '0')} - {Math.floor(segment.end / 60)}:{(segment.end % 60).toFixed(0).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-700 flex-1">
                        {segment.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-64">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(scriptData, null, 2)}
                </pre>
              </ScrollArea>
            )}
          </div>
        </div>
      )}
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

function ExamPreview({ exam }: { exam: ExamReviewData }) {
  return (
    <div className="space-y-4">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Final Exam Preview</h3>
        <p className="text-sm text-gray-600">
          {exam.questions.length} questions • Correct answers are highlighted in orange
        </p>
      </div>
      
      <ScrollArea className="h-[500px]">
        <div className="space-y-6">
          {exam.questions.map((question, index) => (
            <div key={question.questionId} className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
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
                        ? 'bg-orange-100 border-orange-500 text-orange-800' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        answer.isCorrect 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + answerIndex)}
                      </div>
                      <span className="flex-1">{answer.answer}</span>
                      {answer.isCorrect && <CheckCircle className="h-4 w-4 text-orange-600" />}
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
