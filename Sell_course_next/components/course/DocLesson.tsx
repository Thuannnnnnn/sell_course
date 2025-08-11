"use client";
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import { apiCall } from "../../app/api/courses/lessons/lessons";
import {
  DocumentData,
  DocLessonProps as BaseDocLessonProps,
} from "../../app/types/Course/Lesson/content/document";

interface DocLessonProps extends BaseDocLessonProps {
  onComplete?: (contentId: string) => void;
  contentId?: string;
  isCompleted?: boolean;
}

export function DocLesson({
  lesson,
  documentData: propDocumentData,
  onComplete,
  contentId,
  isCompleted = false,
}: DocLessonProps) {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [completing, setCompleting] = useState(false);

  // Reading progress tracking
  const [readingProgress, setReadingProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasStartedReading, setHasStartedReading] = useState(false);
  const [canComplete, setCanComplete] = useState(false);

  // Minimum reading time (in seconds) before allowing completion
  const MIN_READING_TIME = 10;
  const ESTIMATED_READING_TIME = 300; // 5 minutes

  // Use provided document data or fetch it
  useEffect(() => {
    const fetchDocument = async () => {
      // If document data is provided, use it directly
      if (propDocumentData) {
        // Map propDocumentData to DocumentData type
        const mappedData: DocumentData = {
          contentId:
            propDocumentData.contentId || propDocumentData.docsId || "",
          contentName:
            propDocumentData.contentName || propDocumentData.title || "",
          contentType: propDocumentData.contentType || "doc",
          url: propDocumentData.url || "",
          documentUrl: propDocumentData.documentUrl,
          fileType:
            propDocumentData.fileType ||
            (propDocumentData.url
              ? propDocumentData.url.split(".").pop()?.toLowerCase()
              : "pdf"),
          fileSize: propDocumentData.fileSize,
          description: propDocumentData.description,
        };
        setDocumentData(mappedData);
        const docUrl =
          propDocumentData.url ||
          propDocumentData.documentUrl ||
          lesson.content;
        if (docUrl) {
          // Determine file type from URL extension if not provided
          let fileType = propDocumentData.fileType;
          if (!fileType && docUrl) {
            const extension = docUrl.split(".").pop()?.toLowerCase();
            fileType = extension || "pdf";
          }
          await fetchDocumentContent(docUrl, fileType || "pdf");
        }
        return;
      }

      // Otherwise, try to fetch from API (fallback)
      if (!lesson.content) {
        setDocumentContent("No document URL provided");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Try to fetch document metadata first
        try {
          const docData = await apiCall<DocumentData>(
            `/api/docs/view_doc/${lesson.content}`,
            'GET'
          );
          setDocumentData(docData);

          // If we have a document URL, try to fetch the content
          const docUrl = docData.url || docData.documentUrl || lesson.content;
          if (docUrl) {
            await fetchDocumentContent(docUrl, docData.fileType || "pdf");
          }
        } catch {
          // If metadata fetch fails, try to use the content URL directly
          await fetchDocumentContent(
            lesson.content,
            lesson.contentType || "pdf"
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load document"
        );
        setDocumentContent("Error loading document content");
      } finally {
        setLoading(false);
      }
    };

    const fetchDocumentContent = async (url: string, fileType: string) => {
      try {
        if (fileType.toLowerCase() === "pdf") {
          // For PDFs, we'll show an embedded viewer
          setDocumentContent(`PDF document loaded from: ${url}`);
        } else if (
          fileType.toLowerCase() === "doc" ||
          fileType.toLowerCase() === "docx"
        ) {
          // For Word documents, we'll show a link to Microsoft Office Online
          setDocumentContent(`Word document loaded from: ${url}`);
        } else if (fileType.toLowerCase() === "txt") {
          // For text files, try to fetch the content
          const response = await fetch(url);
          if (response.ok) {
            const text = await response.text();
            setDocumentContent(text);
          } else {
            setDocumentContent(`Text document loaded from: ${url}`);
          }
        } else {
          setDocumentContent(`Document loaded from: ${url}`);
        }
      } catch {
        setDocumentContent(`Document loaded from: ${url}`);
      }
    };

    fetchDocument();
  }, [lesson.content, lesson.contentType, propDocumentData]);

  // Track reading time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (hasStartedReading && !isCompleted) {
      interval = setInterval(() => {
        setTimeSpent((prev) => {
          const newTime = prev + 1;
          // Update progress based on time spent
          const progress = Math.min(
            (newTime / ESTIMATED_READING_TIME) * 100,
            100
          );
          setReadingProgress(progress);

          // Allow completion after minimum reading time
          if (newTime >= MIN_READING_TIME) {
            setCanComplete(true);
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStartedReading, isCompleted]);

  // Handle scroll to track reading progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasStartedReading) {
      setHasStartedReading(true);
    }

    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight - target.clientHeight;

    if (scrollHeight > 0) {
      const scrollProgress = (scrollTop / scrollHeight) * 100;
      // Combine scroll progress with time progress
      const combinedProgress = Math.max(scrollProgress, readingProgress);
      setReadingProgress(combinedProgress);

      // Allow completion if scrolled to bottom
      if (scrollProgress >= 90) {
        setCanComplete(true);
      }
    }
  };

  const handleDownload = () => {
    const url =
      documentData?.url || documentData?.documentUrl || lesson.content;
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = documentData?.contentName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleComplete = async () => {
    if (!canComplete && !isCompleted) {
      return;
    }

    setCompleting(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onComplete && contentId) {
        onComplete(contentId);
      }

      console.log("Lesson marked as completed:", lesson.title);
    } catch (err) {
      console.error("Failed to mark lesson as completed:", err);
    } finally {
      setCompleting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Document Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">
              {documentData?.contentName || lesson.title}
            </h3>
            {documentData && (
              <p className="text-sm text-muted-foreground">
                {documentData.fileType?.toUpperCase()} •{" "}
                {documentData.fileSize
                  ? `${(documentData.fileSize / 1024 / 1024).toFixed(1)}MB`
                  : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-green-600 border-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              size="sm"
              disabled={completing || !canComplete}
              className={
                canComplete ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
              }
              title={
                !canComplete
                  ? "Continue reading to unlock completion"
                  : "Mark as complete"
              }
            >
              {completing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {completing ? "Marking..." : "Mark as Complete"}
            </Button>
          )}
        </div>
      </div>

      {/* Reading Progress Bar */}
      {!isCompleted && (
        <div className="px-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Reading Progress</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(timeSpent)}</span>
                </div>
                <span>{Math.round(readingProgress)}% complete</span>
              </div>
            </div>
            <Progress value={readingProgress} className="h-2" />
            {!canComplete && (
              <p className="text-xs text-muted-foreground mt-2">
                {timeSpent < MIN_READING_TIME
                  ? `Read for ${formatTime(
                      MIN_READING_TIME - timeSpent
                    )} more to unlock completion`
                  : "Scroll to the bottom to unlock completion"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Document Content */}
      <ScrollArea className="h-[900px]" onScrollCapture={handleScroll}>
        <div className="p-6">
          {(() => {
            if (documentData?.fileType?.toLowerCase() === "pdf") {
              return (
                // PDF Viewer
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <iframe
                      src={`${
                        documentData.url ||
                        documentData.documentUrl ||
                        lesson.content
                      }#toolbar=0`}
                      className="w-full h-96 border rounded"
                      title={lesson.title}
                      onLoad={() => {
                        if (!hasStartedReading) {
                          setHasStartedReading(true);
                        }
                      }}
                    />
                  </div>
                </div>
              );
            } else if (
              documentData?.fileType?.toLowerCase() === "doc" ||
              documentData?.fileType?.toLowerCase() === "docx"
            ) {
              return (
                // Word Document Viewer
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                        documentData.url ||
                          documentData.documentUrl ||
                          lesson.content
                      )}`}
                      className="w-full h-[700px] border rounded"
                      title={lesson.title}
                      onLoad={() => {
                        if (!hasStartedReading) {
                          setHasStartedReading(true);
                        }
                      }}
                    />
                  </div>
                </div>
              );
            } else if (documentData?.fileType?.toLowerCase() === "txt") {
              return (
                // Text Content
                <div className="prose max-w-none">
                  <h4>{documentData?.contentName || lesson.title}</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {documentContent}
                  </pre>
                </div>
              );
            } else {
              return (
                // Generic Document Display
                <div className="prose max-w-none">
                  <h4>{documentData?.contentName || lesson.title}</h4>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                        <div>
                          <h5 className="font-semibold">
                            {documentData?.contentName || lesson.title}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {documentData?.fileType?.toUpperCase() ||
                              "Document"}{" "}
                            •{" "}
                            {documentData?.fileSize
                              ? `${(
                                  documentData.fileSize /
                                  1024 /
                                  1024
                                ).toFixed(1)}MB`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {documentData?.description && (
                    <div className="mt-4">
                      <h5>Description</h5>
                      <p>{documentData.description}</p>
                    </div>
                  )}
                </div>
              );
            }
          })()}
        </div>
      </ScrollArea>
    </div>
  );
}
