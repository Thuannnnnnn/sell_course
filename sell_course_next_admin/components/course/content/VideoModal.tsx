// VideoModal.tsx - React Player Implementation
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  DragEvent,
  FormEvent,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ReactPlayer from "react-player";

import {
  updateVideoFile,
  updateVideoScript,
  deleteVideo,
} from "app/api/lessons/Video/video";
import { VideoState } from "app/types/video";
import { useUploadManager } from '../../upload/UploadManagerContext';
import { createVideoWithProgress } from '../../../app/api/lessons/Video/video';

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

import {
  Video as VideoIcon,
  Upload,
  Edit3,
  Save,
  X,
  Loader2,
  Calendar,
  ExternalLink,
  LucideTrash,
} from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: { lessonId: string; contentId: string };
  triggerButton?: React.ReactNode;
  video?: VideoState | null;
  onVideoUpdate?: () => void; // Callback to notify parent of update
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  params,
  triggerButton,
  video: propVideo,
  onVideoUpdate,
}) => {
  console.log(
    "VideoModal is rendering. isOpen:",
    isOpen,
    "propVideo:",
    propVideo
  );
  const [title, setTitle] = useState<string>("Untitled Video");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [scriptContent, setScriptContent] = useState<string>("");
  const [isScriptEditing, setIsScriptEditing] = useState<boolean>(false);

  const [videoData, setVideoData] = useState<VideoState | null>(
    propVideo || null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [dragOverVideo, setDragOverVideo] = useState<boolean>(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const { data: session } = useSession();
  const { startUpload } = useUploadManager();

  useEffect(() => {
    if (isOpen) {
      if (propVideo) {
        // Chế độ cập nhật: sử dụng video từ prop
        setVideoData(propVideo);
        setTitle(propVideo.title);
        setInitialLoading(false);
        setIsEditing(false);
        // Reset player states
        setPlayerReady(false);
        setPlayerError(null);
        // Tải script nếu có urlScript
        if (propVideo.urlScript) {
          fetch(propVideo.urlScript)
            .then((res) => res.json())
            .then((data) => setScriptContent(JSON.stringify(data, null, 2)))
            .catch((err) => {
              console.error("Failed to load script:", err);
              showMessage("Failed to load script content.", "error");
              setScriptContent("");
            });
        } else {
          setScriptContent("");
        }
      } else {
        // Chế độ tạo mới: reset state
        setVideoData(null);
        setTitle("Untitled Video");
        setInitialLoading(false);
        setIsEditing(true); // Tự động vào chế độ chỉnh sửa khi tạo mới
        setScriptContent("");
        setPlayerReady(false);
        setPlayerError(null);
      }
    }
  }, [propVideo, isOpen]);

  const showMessage = (msg: string, type: "success" | "error") => {
    toast[type](msg);
  };

  // React Player event handlers
  const handlePlayerReady = () => {
    console.log("ReactPlayer: Player is ready");
    setPlayerReady(true);
    setPreviewLoading(false);
    setPlayerError(null);
  };

  const handlePlayerError = (error: string) => {
    console.error("ReactPlayer Error:", error);
    setPlayerError(error || "Failed to load video");
    setPreviewLoading(false);
    setPlayerReady(false);
    showMessage(
      "Failed to load video. Please check the URL or format.",
      "error"
    );
  };

  const handlePlayerBuffer = () => {
    console.log("ReactPlayer: Video is buffering");
    setPreviewLoading(true);
  };

  const handlePlayerBufferEnd = () => {
    console.log("ReactPlayer: Video buffering ended");
    setPreviewLoading(false);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    allowedExt: string[],
    maxSizeMB: number,
    type: string
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension =
      selectedFile.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExt.includes(fileExtension)) {
      showMessage(
        `Only ${allowedExt
          .join(", ")
          .toUpperCase()} files are allowed for ${type}`,
        "error"
      );
      setFile(null);
      return;
    }

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      showMessage(`${type} file size cannot exceed ${maxSizeMB}MB`, "error");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    setFile: (file: File | null) => void,
    allowedExt: string[],
    maxSizeMB: number,
    type: string,
    setDragOver: (isOver: boolean) => void
  ) => {
    event.preventDefault();
    setDragOver(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;

    const fileExtension =
      droppedFile.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExt.includes(fileExtension)) {
      showMessage(
        `Only ${allowedExt
          .join(", ")
          .toUpperCase()} files are allowed for ${type}`,
        "error"
      );
      setFile(null);
      return;
    }

    if (droppedFile.size > maxSizeMB * 1024 * 1024) {
      showMessage(`${type} file size cannot exceed ${maxSizeMB}MB`, "error");
      setFile(null);
      return;
    }

    setFile(droppedFile);
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    setDragOver: (isOver: boolean) => void
  ) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
    setDragOver: (isOver: boolean) => void
  ) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleUpdateScript = async () => {
    if (!videoData || !session?.accessToken) {
      showMessage(
        "Cannot update script: video data or access token missing.",
        "error"
      );
      return;
    }
    setLoading(true);
    try {
      const blob = new Blob([scriptContent], { type: "application/json" });
      const newScriptFile = new File([blob], "script.json", {
        type: "application/json",
      });
      await updateVideoScript(
        videoData.videoId,
        newScriptFile,
        session.accessToken
      );
      showMessage("Video script updated successfully!", "success");
      setIsScriptEditing(false);
      onClose();
      if (onVideoUpdate) {
        onVideoUpdate();
      } else {
        // window.location.reload();
      }
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while updating script",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      showMessage("Please enter a video title", "error");
      return;
    }
    if (!session?.accessToken) {
      showMessage("Authentication error. Please log in again.", "error");
      return;
    }

    // Update mode keeps existing logic
    if (videoData) {
      setLoading(true);
      try {
        let updateOccurred = false;
        if (videoFile) {
          await updateVideoFile(
            videoData.videoId,
            videoFile,
            session.accessToken
          );
          showMessage("Video file updated successfully!", "success");
          updateOccurred = true;
        }
        if (scriptFile) {
          await updateVideoScript(
            videoData.videoId,
            scriptFile,
            session.accessToken
          );
          showMessage("Video script updated successfully!", "success");
          updateOccurred = true;
        }
        if (
          isScriptEditing &&
          scriptContent !==
            JSON.stringify(
              videoData.urlScript
                ? await (await fetch(videoData.urlScript)).json()
                : {},
              null,
              2
            )
        ) {
          const blob = new Blob([scriptContent], { type: "application/json" });
          const newScriptFile = new File([blob], "script.json", {
            type: "application/json",
          });
          await updateVideoScript(
            videoData.videoId,
            newScriptFile,
            session.accessToken
          );
          showMessage("Video script updated successfully!", "success");
          updateOccurred = true;
        }
        if (!updateOccurred) {
          showMessage("No new file selected for update.", "success");
        }
        onClose();
        if (onVideoUpdate) onVideoUpdate();
      } catch (error) {
        showMessage(
          error instanceof Error ? error.message : "An unknown error occurred",
          "error"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Create mode -> background upload
    if (!videoFile) {
      showMessage("Please select a video file to upload", "error");
      return;
    }
    try {
      startUpload({
        type: 'video',
        file: videoFile,
        contentId: params.contentId,
        token: session.accessToken,
        title,
        uploader: async ({ file, contentId, token, title, signal, onProgress }) => {
          await createVideoWithProgress(title || file.name, file, contentId, token, signal, onProgress);
        }
      });
      showMessage("Video uploading in background", "success");
      onClose();
      // Do not reload page immediately; user can continue working
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : 'Failed to start background upload',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    if (!videoData || !session?.accessToken) {
      showMessage("Cannot delete video or missing access rights.", "error");
      return;
    }
    setLoading(true);
    try {
      await deleteVideo(videoData.videoId, session.accessToken);
      showMessage("Video deleted successfully!", "success");
      setVideoData(null);
      setDeleteDialogOpen(false);

      // Close modal and reload page after successful deletion
      onClose();
      if (onVideoUpdate) {
        onVideoUpdate(); // This will trigger page reload in parent
      } else {
        window.location.reload(); // Fallback reload if no parent callback
      }
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderVideoPreview = () => {
    if (previewLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
          <p className="text-sm text-gray-500">Loading video preview...</p>
        </div>
      );
    }

    if (!videoData?.url) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-6xl">🎥</div>
          <p className="text-lg font-medium">Video Preview</p>
          <p className="text-sm text-gray-500">
            No video available or URL is invalid.
          </p>
        </div>
      );
    }

    if (playerError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-6xl">❌</div>
          <p className="text-lg font-medium">Video Load Error</p>
          <p className="text-sm text-red-500">{playerError}</p>
          <Button
            onClick={() => {
              setPlayerError(null);
              setPlayerReady(false);
            }}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <ReactPlayer
          ref={playerRef}
          url={videoData.url}
          width="100%"
          height="100%"
          controls={true}
          playing={false} // Don\"t auto-play
          muted={true} // Muted by default for autoplay compatibility
          onReady={handlePlayerReady}
          onError={handlePlayerError}
          onBuffer={handlePlayerBuffer}
          onBufferEnd={handlePlayerBufferEnd}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous",
                preload: "metadata",
              },
              hlsOptions: {
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxBufferHole: 0.5,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 3,
                manifestLoadingRetryDelay: 1000,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 4,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 6,
              },
            },
          }}
          style={{
            borderRadius: "8px",
            overflow: "hidden",
          }}
        />

        {/* Loading overlay */}
        {!playerReady && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
              <p className="text-sm text-white">Loading video...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rest of the component remains the same as the original...
  // (Include all the other render methods and JSX from the original component)

  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mb-4" />
            <p className="text-gray-600">Loading video details...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 flex-grow flex flex-col">
        {videoData ? (
          <Card className="overflow-hidden shadow-lg border-black">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-2 rounded-lg border border-[#513deb]">
                    <VideoIcon className="w-8 h-8 text-gray-500 border-[#513deb]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {videoData.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Video ID: {videoData.videoId}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="border-[#513deb] text-[#513deb] hover:bg-[#513deb] hover:text-white"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <LucideTrash className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Video</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this video? This
                          action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Preview Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Video Preview
                  </h3>
                  {videoData.url && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(videoData.url, "_blank")}
                        className="text-[#513deb] border-[#513deb] hover:bg-[#513deb] hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View URL
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                  {renderVideoPreview()}
                </div>
              </div>

              {/* Video Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Created
                  </Label>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(videoData.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
              </div>

              <Separator />

              {/* Script Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Video Script
                  </h3>
                  {videoData.urlScript && !isScriptEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsScriptEditing(true)}
                      className="text-[#513deb] border-[#513deb] hover:bg-[#513deb] hover:text-white"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Script
                    </Button>
                  )}
                </div>
                {isScriptEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={scriptContent}
                      onChange={(e) => setScriptContent(e.target.value)}
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="Enter script content (JSON format)..."
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setIsScriptEditing(false)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateScript} // New button for script update
                        disabled={loading}
                        className="bg-[#513deb] hover:bg-[#513deb]/90 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Script
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {scriptContent ? (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64">
                        {scriptContent}
                      </pre>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        {videoData.urlScript
                          ? "Loading script..."
                          : "No script available"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Video Selected
            </h3>
            <p className="text-gray-600 mb-6">
              Create a new video to get started
            </p>
          </div>
        )}

        {/* Edit/Create Form */}
        {(isEditing || !videoData) && (
          <Card className="border-[#513deb]">
            <CardHeader>
              <CardTitle className="text-[#513deb]">
                {videoData ? "Update Video" : "Create New Video"}
              </CardTitle>
              <CardDescription>
                {videoData
                  ? "Update video file and script"
                  : "Upload a new video file and script"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Video Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                    className="border-gray-300 focus:border-[#513deb] focus:ring-[#513deb]"
                    required
                  />
                </div>

                {/* Video File Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Video File {!videoData && "*"}
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragOverVideo
                        ? "border-[#513deb] bg-[#513deb]/5"
                        : "border-gray-300 hover:border-[#513deb]"
                    }`}
                    onDrop={(e) =>
                      handleDrop(
                        e,
                        setVideoFile,
                        ["mp4", "avi", "mov", "wmv", "flv", "webm", "m3u8"],
                        500,
                        "Video",
                        setDragOverVideo
                      )
                    }
                    onDragOver={(e) => handleDragOver(e, setDragOverVideo)}
                    onDragLeave={(e) => handleDragLeave(e, setDragOverVideo)}
                  >
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept=".mp4,.avi,.mov,.wmv,.flv,.webm,.m3u8"
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setVideoFile,
                          ["mp4", "avi", "mov", "wmv", "flv", "webm", "m3u8"],
                          500,
                          "Video"
                        )
                      }
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-[#513deb]/10 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-[#513deb]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Drop video file here or{" "}
                          <button
                            type="button"
                            onClick={() => videoFileInputRef.current?.click()}
                            className="text-[#513deb] hover:underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          MP4, AVI, MOV, WMV, FLV, WebM, M3U8 up to 500MB
                        </p>
                      </div>
                      {videoFile && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <VideoIcon className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {videoFile.name}
                              </span>
                            </div>
                            <div className="text-xs text-green-600">
                              {formatFileSize(videoFile.size)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Script File Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Script File (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#513deb] transition-colors">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setScriptFile,
                          ["json"],
                          10,
                          "Script"
                        )
                      }
                      className="hidden"
                      id="script-upload"
                    />
                    <label
                      htmlFor="script-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Upload script file (JSON format, max 10MB)
                      </span>
                    </label>
                    {scriptFile && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-sm font-medium text-blue-800">
                            {scriptFile.name}
                          </span>
                          <span className="text-xs text-blue-600">
                            ({formatFileSize(scriptFile.size)})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setVideoFile(null);
                      setScriptFile(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || (!videoData && !videoFile)}
                    className="bg-[#513deb] hover:bg-[#513deb]/90 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {videoData ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {videoData ? "Update Video" : "Create Video"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Video Content
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Manage the video file and its associated script.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
