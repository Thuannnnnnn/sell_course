"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchContentsByLesson,
  deleteContent,
  createContent,
  updateContent,
  updateContentOrder,
} from "../../../../api/lessons/content";
import { fetchLessons } from "../../../../api/lessons/lesson";
import { quizApi } from "../../../../api/quiz/quiz";
import { getDocumentById } from "../../../../api/lessons/Doc/document";
import { Content } from "../../../../types/lesson";
import { Lesson } from "../../../../types/lesson";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import {
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  FileText,
  Video,
  Image,
  CircleFadingPlus,
  HelpCircle,
  School,
} from "lucide-react";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import DocumentModal from "../../../../../components/course/content/DocumentModalContent";
import { toast } from "sonner";
import VideoModal from "components/course/content/VideoModal";
import { getAllVideos } from "app/api/lessons/Video/video";
import { VideoState } from "app/types/video";

interface AddContentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lessonId: string;
}

interface EditContentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  content: Content | null;
}

function EditContentModal({
  open,
  onClose,
  onSuccess,
  content,
}: EditContentModalProps) {
  const { data: session } = useSession();
  const [contentName, setContentName] = useState("");
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasDocument, setHasDocument] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [checkingContent, setCheckingContent] = useState(false);
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  useEffect(() => {
    if (content && open) {
      setContentName(content.contentName);
      setContentType(
        content.contentType ? content.contentType.toLowerCase() : ""
      );
      setError("");
      setCheckingContent(true);
      
      const checkContent = async () => {
        try {
          const contentType = content.contentType.toLowerCase();
          
          if (contentType === 'doc') {
            const doc = await getDocumentById(content.contentId);
            setHasDocument(!!doc);
          } else if (contentType === 'quizz') {
            const quizzes = await quizApi.getQuizzesByContentId(courseId, lessonId, content.contentId);
            setHasQuiz(quizzes && quizzes.length > 0);
          } else if (contentType === 'video') {
            const videos = await getAllVideos();
            const hasVideoContent = videos.some(v => 
              v.contents && v.contents.contentId === content.contentId
            );
            setHasVideo(hasVideoContent);
          }
        } catch {
          setHasDocument(false);
          setHasQuiz(false);
          setHasVideo(false);
        } finally {
          setCheckingContent(false);
        }
      };
      
      checkContent();
    } else if (!open) {
      setContentName("");
      setContentType("");
      setError("");
      setHasDocument(false);
      setHasQuiz(false);
      setHasVideo(false);
      setCheckingContent(false);
    }
  }, [content, open, courseId, lessonId]);

  const hasExistingContent = hasDocument || hasQuiz || hasVideo;

  const getContentTypeWarning = () => {
    if (hasDocument) {
      return "Content type cannot be changed because this content has an attached document. You must delete the document first to change the content type.";
    } else if (hasQuiz) {
      return "Content type cannot be changed because this content has an attached quiz. You must delete the quiz first to change the content type.";
    } else if (hasVideo) {
      return "Content type cannot be changed because this content has an attached video. You must delete the video first to change the content type.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken || !content) return;
    if (!contentName.trim()) {
      setError("Content name is required.");
      return;
    }
    if (!contentType) {
      setError("Content type is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateContent(
        content.contentId,
        { contentName, contentType },
        session.accessToken
      );
      toast.success("Content updated successfully!", {
        style: {
          background: "#10b981",
          color: "white",
          border: "1px solid #059669",
        },
        icon: "✅",
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message || "Failed to update content."
          : "Failed to update content.";
      setError(msg);
      toast.error(msg, {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Edit Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="edit-contentName">Content Name</Label>
                <Input
                  id="edit-contentName"
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-contentType">Content Type</Label>
                {contentType && (
                  <span className="inline-block mb-1 ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    Current:{" "}
                    {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                  </span>
                )}
                {checkingContent ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    Checking content status...
                  </div>
                ) : hasExistingContent ? (
                  <div className="space-y-2">
                    <Select
                      value={contentType}
                      onValueChange={setContentType}
                      required
                      disabled
                    >
                      <SelectTrigger
                        id="edit-contentType"
                        className="bg-gray-100"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="doc">Document</SelectItem>
                        <SelectItem value="quizz">Quizz</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      <strong>Note:</strong> {getContentTypeWarning()}
                    </div>
                  </div>
                ) : (
                  <Select
                    value={contentType}
                    onValueChange={setContentType}
                    required
                  >
                    <SelectTrigger id="edit-contentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="doc">Document</SelectItem>
                      <SelectItem value="quizz">Quizz</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || checkingContent}
                  style={{
                    backgroundColor: "#513deb",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !checkingContent) {
                      e.currentTarget.style.backgroundColor = "#4f46e5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !checkingContent) {
                      e.currentTarget.style.backgroundColor = "#513deb";
                    }
                  }}
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AddContentModal({
  open,
  onClose,
  onSuccess,
  lessonId,
}: AddContentModalProps) {
  const { data: session } = useSession();
  const [contentName, setContentName] = useState("");
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setContentName("");
      setContentType("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!session?.accessToken) {
      return;
    }
    if (!contentName.trim()) {
      setError("Content name is required.");
      return;
    }
    if (!contentType) {
      setError("Content type is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createContent(
        {
          lessonId,
          contentName,
          contentType,
        },
        session.accessToken
      );
      toast.success("Content created successfully!", {
        style: {
          background: "#10b981",
          color: "white",
          border: "1px solid #059669",
        },
        icon: "✅",
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message || "Failed to add content."
          : "Failed to add content.";
      setError(msg);
      toast.error(msg, {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Add Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="contentName">Content Name</Label>
                <Input
                  id="contentName"
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={setContentType}
                  required
                >
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="doc">Document</SelectItem>
                    <SelectItem value="quizz">Quizz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#513deb",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#4f46e5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#513deb";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LessonContentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const courseId = params.courseId as string;

  console.log('🎯 LessonContentsPage loaded:', { courseId, lessonId });

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoContentId, setSelectedVideoContentId] = useState<
    string | null
  >(null);
  const [allVideos, setAllVideos] = useState<VideoState[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        if (!session?.accessToken) {
          setError("You are not logged in or lack access rights.");
          setLoading(false);
          return;
        }
        const [lessonsData, contentsData, videosData] = await Promise.all([
          fetchLessons(session.accessToken),
          fetchContentsByLesson(lessonId, session.accessToken),
          getAllVideos(),
        ]);
        console.log('📚 Loaded data:', { 
          lessonsCount: lessonsData.length, 
          contentsCount: contentsData.length,
          contents: contentsData 
        });
        
        const foundLesson = lessonsData.find(
          (l: Lesson) => l.lessonId === lessonId
        );
        if (!foundLesson) {
          console.log('❌ Lesson not found:', lessonId);
          setError("Lesson not found.");
          setLoading(false);
          return;
        }
        console.log('✅ Lesson found:', foundLesson);
        setLesson(foundLesson);
        setContents(contentsData);
        setAllVideos(videosData);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) {
      loadData();
    }
  }, [session, lessonId]);

  const handleAdd = () => {
    console.log('➕ Opening add content modal');
    setShowAddModal(true);
  };

  const handleDelete = async (contentId: string) => {
    if (!session?.accessToken) return;
    if (!window.confirm("Are you sure you want to delete this content?"))
      return;

    try {
      await deleteContent(contentId, session.accessToken);

      // Update order for remaining contents
      const remainingContents = contents.filter(
        (c) => c.contentId !== contentId
      );
      const updatedOrderContents = remainingContents.map((c, idx) => ({
        contentId: c.contentId,
        order: idx + 1,
      }));

      if (updatedOrderContents.length > 0) {
        await updateContentOrder(
          { contents: updatedOrderContents },
          session.accessToken
        );
      }

      setContents((prev) => {
        const filtered = prev.filter((c) => c.contentId !== contentId);
        const reordered = filtered.map((c, idx) => ({ ...c, order: idx + 1 }));
        return reordered;
      });

      toast.success("Content deleted successfully!", {
        style: {
          background: "#10b981",
          color: "white",
          border: "1px solid #059669",
        },
        icon: "✅",
      });
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to delete content. Please try again.";
      toast.error(msg, {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
    }
  };
  
  const refreshContents = async () => {
    if (!session?.accessToken) return;
    console.log('🔄 Refreshing contents for lesson:', lessonId);
    try {
      const contentsData = await fetchContentsByLesson(
        lessonId,
        session.accessToken
      );
      console.log('✅ Contents refreshed:', contentsData);
      setContents(contentsData);
      const videosData = await getAllVideos();
      setAllVideos(videosData);
    } catch {
      setError("Failed to reload contents.");
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" aria-label="Image content" />;
      case "quizz":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case "video":
        return "bg-blue-100 text-blue-800";
      case "image":
        return "bg-green-100 text-green-800";
      case "quizz":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleManageContent = async (content: Content) => {
    const contentType = content.contentType.toLowerCase();
    
    if (contentType === 'quizz') {
      try {
        // Check if quiz already exists for this content
        const quizzes = await quizApi.getQuizzesByContentId(courseId, lessonId, content.contentId);
        let quizUrl;
        if (quizzes && quizzes.length > 0) {
          // Quiz exists, navigate with quizId
          const existingQuiz = quizzes[0]; // Take first quiz
          quizUrl = `/course/${courseId}/${lessonId}/contents/quiz?contentId=${content.contentId}&quizId=${existingQuiz.quizzId}`;
        } else {
          // No quiz exists, navigate without quizId
          quizUrl = `/course/${courseId}/${lessonId}/contents/quiz?contentId=${content.contentId}`;
        }
        router.push(quizUrl);
      } catch {
        // Fallback to navigate without quizId
        const fallbackUrl = `/course/${courseId}/${lessonId}/contents/quiz?contentId=${content.contentId}`;
        router.push(fallbackUrl);
      }
    } else if (contentType === 'doc') {
      setSelectedContentId(content.contentId);
      setShowDocumentModal(true);
    } else if (contentType === 'video') {
      setSelectedVideoContentId(content.contentId);
      setShowVideoModal(true);
    }
  };

  const handleEdit = (content: Content) => {
    setSelectedContent(content);
    setShowEditModal(true);
  };

  if (!lesson) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">{error || "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/course/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Lesson Contents</h1>
          <p className="text-muted-foreground">{lesson.lessonName}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {contents.length} content item{contents.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push(`/course/${courseId}/exam`)}
            style={{
              backgroundColor: "#513deb",
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#513deb";
            }}
          >
            <School className="h-4 w-4 mr-2" />
            Exam
          </Button>
          <Button
            onClick={handleAdd}
            style={{
              backgroundColor: "#513deb",
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#513deb";
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </div>

      <AddContentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshContents}
        lessonId={lessonId}
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {contents
                .sort((a, b) => a.order - b.order)
                .map((content) => {
                  console.log('🎨 Rendering content:', {
                    contentId: content.contentId,
                    contentName: content.contentName,
                    contentType: content.contentType,
                    isQuizz: content.contentType.toLowerCase() === 'quizz'
                  });
                  return (
                    <div
                      key={content.contentId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {content.order}
                        </div>
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(content.contentType)}
                          <div>
                            <h3 className="font-medium">{content.contentName}</h3>
                            <Badge
                              variant="outline"
                              className={getContentTypeColor(content.contentType)}
                            >
                              {content.contentType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleManageContent(content)}
                          title={`Manage ${content.contentType}`}
                        >
                          <CircleFadingPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(content)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(content.contentId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

              {contents.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No content found for this lesson. Add your first content item
                  to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {showDocumentModal && selectedContentId && (
        <DocumentModal
          isOpen={showDocumentModal}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedContentId(null);
          }}
          params={{ lessonId, contentId: selectedContentId }}
        />
      )}
      
      {showVideoModal && selectedVideoContentId && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideoContentId(null);
          }}
          params={{ lessonId, contentId: selectedVideoContentId }}
          video={
            selectedVideoContentId
              ? allVideos.find(
                  (v) =>
                    v.contents &&
                    v.contents.contentId === selectedVideoContentId
                )
              : null
          }
        />
      )}
      
      <EditContentModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={refreshContents}
        content={selectedContent}
      />
    </div>
  );
}
