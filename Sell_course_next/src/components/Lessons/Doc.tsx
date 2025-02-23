"use client";
import { useEffect, useState } from "react";
import * as mammoth from "mammoth";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
interface DocumentLessonProps {
  title: string;
  fileUrl: string;
  onComplete: () => void;
}

export default function DocumentLesson({
  title,
  fileUrl,
  onComplete,
}: DocumentLessonProps) {
  const [content, setContent] = useState<string>("");
  const getFileType = (url: string) => {
    return url.split(".").pop()?.toLowerCase();
  };

  const fileType = getFileType(fileUrl);

  useEffect(() => {
    const fileType = getFileType(fileUrl);

    if (fileType === "docx") {
      const fetchDocx = async () => {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setContent(result.value);
      };
      fetchDocx();
    }
  }, [fileUrl]);
  return (
    <div className="lesson-container">
      <h2>{title}</h2>

      {fileType === "pdf" && (
        <div className="pdf-viewer">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
          >
            <Viewer fileUrl={fileUrl} />
          </Worker>
        </div>
      )}

      {fileType === "docx" && (
        <div className="doc-content">
          <p>{content}</p>
        </div>
      )}

      {fileType !== "pdf" && fileType !== "docx" && (
        <p>Định dạng tệp không được hỗ trợ</p>
      )}

      <button onClick={onComplete}>Mark as Read</button>
    </div>
  );
}
