import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { VideoLesson } from "./VideoLesson";
import { DocLesson } from "./DocLesson";
import QuizIntegration from "./QuizIntegration";
import { apiCall } from "../../app/api/courses/lessons/lessons";
import {
  DocumentResponse,
  QuizResponse,
  ContentResponse,
  ContentData,
} from "../../app/types/Course/Lesson/Lessons";
import { VideoState } from "@/app/types/Course/Lesson/content/video";

// Enhanced interface to match CourseLearnPage structure
interface ContentWithProgress extends ContentResponse {
  isCompleted: boolean;
}
import AIChatWindow from "@/components/course/AIChatWindow";
import { preloadChatSuggestions } from "@/app/api/ChatBot/chatbot";

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: string;
    content?: VideoState | DocumentResponse | QuizResponse | { text: string };
    contents?: ContentResponse[];
  };
  content?: ContentWithProgress | null; // Updated to include progress data
  courseId: string;
  onContentComplete?: (contentId: string) => void;
  isContentCompleted?: boolean; // Additional prop to track completion status
  token: string; // Additional prop to include token
}

export function LessonContent({
  lesson,
  content,
  courseId,
  onContentComplete,
  isContentCompleted = false,
  token,
}: LessonContentProps) {
  const searchParams = useSearchParams();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localCompleted, setLocalCompleted] = useState(false);
  // Update local completion state when prop changes
  useEffect(() => {
    setLocalCompleted(isContentCompleted);
  }, [isContentCompleted]);

  const [urlBot, setUrlBot] = useState<string | null>(null);
  useEffect(() => {
    const fetchContent = async () => {
      // Determine which content to load
      let selected = content;
      
      // If no content prop provided, try to find content by URL contentId
      if (!selected && lesson.contents) {
        const urlContentId = searchParams.get('contentId');
        if (urlContentId) {
          const foundContent = lesson.contents.find(c => c.contentId === urlContentId);
          selected = foundContent ? { ...foundContent, isCompleted: false } : { ...lesson.contents[0], isCompleted: false };
        } else {
          selected = { ...lesson.contents[0], isCompleted: false };
        }
      }
      
      if (!selected) {
        setContentData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        switch (selected.contentType.toLowerCase()) {
          case "video":
            const videoData = await apiCall<VideoState>(
              `/api/video/view_video_content/${selected.contentId}`,
              token
            );
            setContentData({ type: "video", data: videoData });
            setUrlBot(videoData.urlScript);
            // Preload chat suggestions when video content is loaded
            if (videoData.urlScript) {
              preloadChatSuggestions(videoData.urlScript);
            }
            break;

          case "doc":
            const docData = await apiCall<DocumentResponse>(
              `/api/docs/view_doc/${selected.contentId}`,
              token
            );
            setContentData({ type: "doc", data: docData });
            setUrlBot(docData.url);
            // Preload chat suggestions when document content is loaded
            if (docData.url) {
              preloadChatSuggestions(docData.url);
            }
            break;

          case "quiz":
          case "quizz":
            console.log("📝 LessonContent - Loading quiz content...");
            const quizData = await apiCall<QuizResponse>(
              `/api/courses/${courseId}/lessons/${lesson.id}/contents/${selected.contentId}/quizzes/random`,
              token
            );
            console.log("✅ LessonContent - Quiz content loaded:", quizData);
            setContentData({ type: "quiz", data: quizData });
            break;

          default:
            console.log(
              "❌ LessonContent - Unknown content type:",
              selected.contentType
            );
            setContentData({
              type: "text",
              data: { text: "Content not available" },
            });
        }
      } catch (err) {
        setError(err instanceof Error ? "Not have Content" : "Failed to load content");
        setContentData({
          type: "text",
          data: { text: "Error loading content" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [lesson.contents, lesson.title, content, courseId, lesson.id, token, searchParams]);

  // Enhanced completion handler
  const handleContentComplete = async (contentId: string) => {
    console.log("📋 LessonContent - Handling content completion:", contentId);
    console.log(
      "📋 LessonContent - onContentComplete exists:",
      !!onContentComplete
    );

    // Update local state immediately for better UX
    setLocalCompleted(true);

    // Call parent completion handler
    if (onContentComplete) {
      try {
        console.log("📋 LessonContent - Calling parent onContentComplete...");
        await onContentComplete(contentId);
        console.log(
          "✅ LessonContent - Content completion handled successfully"
        );
      } catch (error) {
        console.error(
          "❌ LessonContent - Failed to handle content completion:",
          error
        );
        // Revert local state if API call fails
        setLocalCompleted(false);
      }
    } else {
      console.log("❌ LessonContent - No onContentComplete callback provided");
    }
  };

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

    const currentContentId =
      content?.contentId || 
      searchParams.get('contentId') || 
      lesson.contents?.[0]?.contentId;

    switch (contentData.type) {
      case "video":
        const videoData = contentData.data as VideoState;
        return (
          <VideoLesson
            videoData={videoData}
            videoId={videoData.videoId}
            title={videoData.title}
            description={videoData.description}
            url={videoData.url}
            urlScript={videoData.urlScript}
            createdAt={videoData.videoId}
            contents={videoData.contents}
            onComplete={() => {
              if (currentContentId) {
                handleContentComplete(currentContentId);
              }
            }}
            isCompleted={localCompleted} // Pass completion status
          />
        );

      case "doc":
        const docData = contentData.data as DocumentResponse;
        return (
          <DocLesson
            lesson={{
              id: lesson.id,
              title:
                content?.contentName ||
                lesson.contents?.[0]?.contentName ||
                lesson.title,
              content: docData.url || "",
              contentType: docData.fileType || "pdf",
            }}
            documentData={docData}
            onComplete={() => {
              if (currentContentId) {
                handleContentComplete(currentContentId);
              }
            }}
            contentId={currentContentId}
            isCompleted={localCompleted} // Pass completion status
          />
        );

      case "quiz":
        const quizData = contentData.data as QuizResponse;
        return (
          <QuizIntegration
            courseId={courseId}
            lessonId={lesson.id}
            contentId={currentContentId || ""}
            quizId={quizData.quizzId}
            title={content?.contentName || lesson.title}
            description={
              quizData.description || "Test your knowledge with this quiz"
            }
            showResults={true}
            onComplete={(score, results) => {
              console.log("🎯 Quiz completed:", { score, results });
              console.log(
                "🎯 Score type:",
                typeof score,
                "Score value:",
                score
              );
              console.log(
                "🎯 Results type:",
                typeof results,
                "Results:",
                results
              );

              if (currentContentId && score !== undefined) {
                // Use the score directly from QuizTaking since it's already calculated
                const finalScore = score;
                console.log("🎯 Final score:", finalScore);
                console.log("🎯 Content ID:", currentContentId);

                if (finalScore >= 50) {
                  console.log("✅ Score >= 50%, marking content as complete");
                  handleContentComplete(currentContentId);
                } else {
                  console.log("❌ Score < 50%, not marking as complete");
                }
              } else {
                console.log("❌ Missing contentId or score:", {
                  currentContentId,
                  score,
                });
              }
            }}
            isCompleted={localCompleted}
          />
        );

      default:
        return (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              Unsupported content type: {contentData.type}
            </p>
          </div>
        );
    }
  };

  const currentContentName =
    content?.contentName || lesson.contents?.[0]?.contentName || lesson.title;

  return (
    <div className="space-y-6">
      {/* Header with completion indicator */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{currentContentName}</h1>
            {localCompleted && (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">{lesson.duration}</p>
        </div>

        {/* Manual completion button for certain content types */}
        {!localCompleted && contentData?.type === "doc" && (
          <Button
            variant="outline"
            onClick={() => {
              const currentContentId =
                content?.contentId || 
                searchParams.get('contentId') || 
                lesson.contents?.[0]?.contentId;
              if (currentContentId) {
                handleContentComplete(currentContentId);
              }
            }}
            className="ml-4"
          >
            Mark as Complete
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">{renderLessonContent()}</CardContent>
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
      <AIChatWindow urlBot={urlBot || ""} />
    </div>
  );
}
