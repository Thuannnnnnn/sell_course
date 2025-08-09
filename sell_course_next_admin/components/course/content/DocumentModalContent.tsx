"use client";

import React, { useState, useEffect } from "react";
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "app/api/lessons/Doc/document";
import { Docs } from "app/types/doc";
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

import { useSession } from "next-auth/react";
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  Calendar,
  ExternalLink,
  LucideTrash,
} from "lucide-react";

import { toast } from "sonner";
import { useUploadManager } from '../../upload/UploadManagerContext';
import { createDocumentWithProgress } from 'app/api/lessons/Doc/document';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: { lessonId: string; contentId: string };
  triggerButton?: React.ReactNode;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  params,
  triggerButton,
}) => {
  const [title, setTitle] = useState<string>("Untitled");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [doc, setDoc] = useState<Docs | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewKey, setPreviewKey] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const { startUpload } = useUploadManager();

  useEffect(() => {
    if (isOpen) {
      const fetchDoc = async () => {
        try {
          setInitialLoading(true);
          const document = await getDocumentById(params.contentId);
          setDoc(document);
          setTitle(document.title);
          setPreviewKey((prev) => prev + 1);
        } catch {
          setDoc(null);
        } finally {
          setInitialLoading(false);
        }
      };

      fetchDoc();
    }
  }, [params.contentId, isOpen]);
  useEffect(() => {
    const generatePreviewUrl = () => {
      if (doc && doc.url) {
        try {
          setPreviewLoading(true);
          const fileExtension = doc.url.split(".").pop()?.toLowerCase();

          if (fileExtension === "docx") {
            const encodedUrl = encodeURIComponent(doc.url);
            setPreviewUrl(
              `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`
            );
          } else {
            setPreviewUrl("");
          }
        } catch (error) {
          console.error("Error generating preview URL:", error);
          setPreviewUrl("");
        } finally {
          setPreviewLoading(false);
        }
      } else {
        setPreviewUrl("");
        setPreviewLoading(false);
      }
    };

    generatePreviewUrl();
  }, [doc, previewKey]);

  const showMessage = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const allowedExtensions = ["docx"];
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension || "")) {
        showMessage("Only DOCX files are allowed", "error");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        showMessage("File size cannot exceed 10MB", "error");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];
      const allowedExtensions = ["docx"];
      const fileExtension = droppedFile.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension || "")) {
        showMessage("Only DOCX files are allowed", "error");
        return;
      }

      if (droppedFile.size > 10 * 1024 * 1024) {
        showMessage("File size cannot exceed 10MB", "error");
        return;
      }

      setFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      showMessage("Please enter a document title", "error");
      return;
    }

    if (!doc) {
      // Create mode with background upload
      if (!session?.accessToken) {
        showMessage('Authentication required', 'error');
        return;
      }
      if (!file) {
        showMessage('Please select a file to upload', 'error');
        return;
      }
      try {
        startUpload({
          type: 'doc',
          file,
            contentId: params.contentId,
          token: session.accessToken,
          title,
          uploader: async ({ file, contentId, token, title, signal, onProgress }) => {
            await createDocumentWithProgress(title || file.name, file, contentId, token, signal, onProgress);
          }
        });
        showMessage('Document uploading in background', 'success');
        onClose();
      } catch {
        showMessage('Failed to start background upload', 'error');
      }
      return;
    }

    // Existing update logic
    setLoading(true);
    try {
      if (doc && session?.accessToken) {
        const updatedDoc = await updateDocument(
          doc.docsId,
          title,
          file || undefined,
          session.accessToken,
          params.contentId
        );
        showMessage("Document updated successfully!", "success");
        setDoc(updatedDoc);
        setIsEditing(false);
      }
      const fetchedDoc = await getDocumentById(params.contentId);
      setDoc(fetchedDoc);
      setPreviewKey((prev) => prev + 1);
    } catch (error: unknown) {
      showMessage(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the document",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      if (!doc || !session?.accessToken) {
        showMessage(
          "Cannot delete document or missing access rights.",
          "error"
        );
        return;
      }
      await deleteDocument(doc.docsId, session.accessToken);
      showMessage("Document deleted successfully!", "success");
      setDoc(null);

      // Fetch lại trạng thái sau khi xóa
      const fetchedDoc = await getDocumentById(params.contentId);
      setDoc(fetchedDoc);
      setPreviewUrl(""); // Xóa preview URL
      setDeleteDialogOpen(false);
    } catch (error: unknown) {
      showMessage(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the document",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (fileName: string | undefined) => {
    if (!fileName) {
      return "FILE";
    }
    return fileName.split(".").pop()?.toUpperCase() || "FILE";
  };

  const renderPreview = () => {
    if (previewLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
          <p className="text-sm text-gray-500">Loading preview...</p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-6xl">📄</div>
          <p className="text-lg font-medium">Document Preview</p>
          <p className="text-sm text-gray-500">
            Preview not available for this file type
          </p>
          <p className="text-xs text-gray-400">
            Click &quot;View Full Document&quot; to open the file
          </p>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <iframe
          key={previewKey} // Add key to force iframe refresh
          src={previewUrl}
          className="w-full h-full border-0 rounded"
          title="Document Preview"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="lazy"
          onLoad={() => setPreviewLoading(false)}
          onError={() => {
            setPreviewLoading(false);
            setPreviewUrl("");
          }}
        />
        {previewLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
              <p className="text-sm text-gray-500">Loading preview...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mb-4" />
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 flex-grow flex flex-col">
        {doc ? (
          <Card className="overflow-hidden shadow-lg border-black">
            <CardHeader>
              <div className="flex items-center  justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-2 rounded-lg border border-[#513deb]">
                    <FileText
                      className="w-8 h-8 text-gray-500 border-[#513deb]"
                      color="#513deb"
                    />
                  </div>
                  <div className="space-y-1">
                    {isEditing ? (
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-semibold"
                        placeholder="Enter document name..."
                      />
                    ) : (
                      <CardTitle className="text-xl">{doc.title}</CardTitle>
                    )}
                    <div className="flex items-center space-x-4  text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" color="#513deb" />
                        <span>{new Date().toLocaleDateString("en-US")}</span>
                      </div>
                      <Badge className="bg-[#513deb]  hover:bg-[#4f46e5]">
                        {getFileExtension(doc.title)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        size="sm"
                        className="bg-[#513deb] hover:bg-[#4f46e5]"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setTitle(doc.title);
                          setFile(null);
                        }}
                        size="sm"
                        variant="outline"
                        className="bg-[#FF6B1E] hover:bg-[#FF6B1E]/90 transition-all duration-200 text-white"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      className="bg-[#513deb] hover:bg-[#4f46e5]  transition-all duration-200 hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* File Upload Section (when editing) */}
              {isEditing && (
                <>
                  <Separator className="bg-[#00BFFF]/20" />
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Update File (optional)
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Select a new file to replace the current document
                      </p>
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                        dragOver
                          ? "border-[#A259FF] bg-purple-50 scale-105"
                          : "border-black hover:border-[#00BFFF] hover:bg-purple-50/50"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        Drag and drop your file here
                      </p>
                      <p className="text-gray-500 mb-4">
                        or{" "}
                        <span className=" font-medium">
                          click to select a file
                        </span>
                      </p>
                      <div className="flex justify-center space-x-4 text-sm text-gray-500">
                        <span>DOCX</span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {file && (
                      <Card className="border-black bg-sky-50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <FileText
                              className="w-8 h-8 text-gray-500 border-[#513deb]"
                              color="#513deb"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#000000] truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFile(null)}
                              className="hover:bg-red-100 hover:text-red-600"
                            >
                              <LucideTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <Separator className="bg-[#00BFFF]/20" />
                </>
              )}

              {!isEditing && (
                <>
                  <Separator className="bg-[#00BFFF]/20" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-[#2596be]" />
                      <span>Document Preview</span>
                    </h3>

                    <div className="border border-[#00BFFF]/20 rounded-lg bg-white h-96 overflow-hidden">
                      {renderPreview()}
                    </div>

                    {!previewUrl && !previewLoading && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          Preview requires the document to be publicly
                          accessible
                        </p>
                        <p className="text-xs text-gray-400">
                          Some file types may not support preview
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-[#00BFFF]/20" />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => window.open(doc.url, "_blank")}
                      className="flex-1 bg-[#513deb] hover:bg-[#4f46e5] text-white transition-all duration-200 hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Document
                    </Button>

                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-red-600">
                            Delete Document
                          </DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{doc.title}
                            &quot;? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="bg-[#FF6B1E] hover:bg-[#FF6B1E]/90 transition-all duration-200 text-white"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-black shadow-lg">
            <CardHeader className="">
              <CardTitle className="text-xl flex items-center space-x-2">
                <Upload className="w-6 h-6" color="#2596be" />
                <span>Create New Document</span>
              </CardTitle>
              <CardDescription className="">
                Upload a document to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Separator className="bg-[#00BFFF]/20" />
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Document Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="border-black/50 hover:border-black/100 focus:border-black focus:ring-1 transition-all duration-200"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Upload File</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Select a document file to upload (Max 10MB)
                    </p>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                      dragOver
                        ? "border-[#A259FF] bg-purple-50 scale-105"
                        : "border-black hover:border-[#00BFFF] hover:bg-purple-50/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
                    <p className="text-lg font-medium  mb-2">
                      Drag and drop your file here
                    </p>
                    <p className="text-gray-500 mb-4">
                      or{" "}
                      <span className=" font-medium">
                        click to select a file
                      </span>
                    </p>
                    <div className="flex justify-center space-x-4 text-sm text-gray-500">
                      <span>DOCX</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {file && (
                    <Card className="border-black bg-sky-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <FileText
                            className="w-8 h-8 text-gray-500 border-[#513deb]"
                            color="#513deb"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFile(null)}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <LucideTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || !title?.trim() || !file}
                  className="w-full bg-[#513deb] hover:bg-[#4f46e5] text-white transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Create Document
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Document Manager
          </DialogTitle>
          <DialogDescription>
            Manage your documents - upload, edit, preview, and organize your
            files
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentModal;
