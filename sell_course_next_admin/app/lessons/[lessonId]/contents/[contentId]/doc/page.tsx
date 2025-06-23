"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "app/api/lessons/Doc/document";
import { Docs } from "app/types/doc";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";
import { Separator } from "../../../../../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../../../../components/ui/alert";
import { useSession } from "next-auth/react";
import { renderAsync } from "docx-preview";
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  Edit3,
  Save,
  X,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  ExternalLink,
} from "lucide-react";

const DocumentPage = ({
  params,
}: {
  params: { lessonId: string; contentId: string };
}) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [doc, setDoc] = useState<Docs | null>(null); // Using Docs type
  const [isEditing, setIsEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const docPreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setInitialLoading(true);
        const document = await getDocumentById(params.contentId);
        setDoc(document);
        setTitle(document.title);

        if (document.url.endsWith(".docx")) {
          const response = await fetch(document.url);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          if (docPreviewRef.current) {
            await renderAsync(arrayBuffer, docPreviewRef.current);
          }
        }
      } catch (error) {
        setDoc(null);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDoc();
  }, [params.contentId]);

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
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

    setLoading(true);

    try {
      if (doc && session?.accessToken) {
        const updatedDoc = await updateDocument(
          doc.docsId,
          title,
          file || undefined,
          session.accessToken
        );
        showMessage("Document updated successfully!", "success");
        setDoc(updatedDoc);
        setIsEditing(false);
      } else {
        if (!session?.accessToken) {
          throw new Error("Please log in to create a document.");
        }
        if (!file) {
          showMessage("Please select a file to upload", "error");
          return;
        }
        const newDoc = await createDocument(
          title,
          file,
          params.contentId,
          session.accessToken
        );
        showMessage("Document created successfully!", "success");
        setDoc(newDoc);
      }
      setFile(null);
    } catch (error: any) {
      showMessage(
        error.message || "An error occurred while saving the document",
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
      setDeleteDialogOpen(false);
    } catch (error: any) {
      showMessage(
        error.message || "An error occurred while deleting the document",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string | undefined) => {
    if (!fileName) {
      return <FileText className="w-8 h-8 text-gray-500" />;
    }

    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
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
      return "FILE"; // Default value if fileName does not exist
    }
    return fileName.split(".").pop()?.toUpperCase() || "FILE";
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Loading document...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {doc ? "Document Management" : "Create New Document"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {doc
              ? "View, edit, or delete your documents easily"
              : "Upload and manage your study documents"}
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert
            className={
              messageType === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {messageType === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle
              className={
                messageType === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {messageType === "success" ? "Success!" : "Error Occurred!"}
            </AlertTitle>
            <AlertDescription
              className={
                messageType === "success" ? "text-green-700" : "text-red-700"
              }
            >
              {message}
            </AlertDescription>
          </Alert>
        )}

        {doc ? (
          /* Document Management Mode */
          <Card className="overflow-hidden shadow-lg">
            {/* Document Header */}
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getFileIcon(doc.title)}
                  <div className="space-y-1">
                    {isEditing ? (
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-semibold bg-white/20 border-white/30 text-white placeholder:text-white/70"
                        placeholder="Enter document name..."
                      />
                    ) : (
                      <CardTitle className="text-xl">{doc.title}</CardTitle>
                    )}
                    <div className="flex items-center space-x-4 text-blue-100 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Created: {new Date().toLocaleDateString("en-US")}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white hover:bg-white/30"
                      >
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
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
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
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
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
                        ? "border-blue-400 bg-blue-50 scale-105"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drag and drop your file here
                    </p>
                    <p className="text-gray-500 mb-4">
                      or{" "}
                      <span className="text-blue-600 font-medium">
                        click to select a file
                      </span>
                    </p>
                    <div className="flex justify-center space-x-4 text-sm text-gray-500">
                      <span>PDF</span>
                      <span>•</span>
                      <span>DOC</span>
                      <span>•</span>
                      <span>DOCX</span>
                      <span>•</span>
                      <span>Max 10MB</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {file && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.name)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
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
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {!isEditing && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Document Preview</span>
                    </h3>

                    <div ref={docPreviewRef}></div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => window.open(doc.url, "_blank")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      View Document
                    </Button>

                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          size="lg"
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Delete Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this document? This
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
          /* Document Creation Mode */
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-xl">Create New Document</CardTitle>
              <CardDescription className="text-blue-100">
                Fill in the details below to upload a new document.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Upload File</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Select the document file (PDF, DOC, DOCX)
                  </p>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragOver
                      ? "border-blue-400 bg-blue-50 scale-105"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-gray-500 mb-4">
                    or{" "}
                    <span className="text-blue-600 font-medium">
                      click to select a file
                    </span>
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-500">
                    <span>PDF</span>
                    <span>•</span>
                    <span>DOC</span>
                    <span>•</span>
                    <span>DOCX</span>
                    <span>•</span>
                    <span>Max 10MB</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {file && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
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
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                Upload Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentPage;
