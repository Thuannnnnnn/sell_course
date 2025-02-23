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
    if (!fileType) return;

    if (fileType === "docx") {
      const fetchDocx = async () => {
        try {
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const file = new File([blob], "document.docx");

          const reader = new FileReader();
          reader.onload = async () => {
            const result = reader.result;
            if (result instanceof ArrayBuffer) {
              const arrayBuffer: ArrayBuffer = result;
              const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
              setContent(htmlResult.value);
            }
          };
          reader.readAsArrayBuffer(file);
        } catch (error) {
          console.error("Lỗi khi tải tệp DOCX:", error);
        }
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
        <div
          className="docx-preview"
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      )}

      {fileType !== "pdf" && fileType !== "docx" && (
        <p>Định dạng tệp không được hỗ trợ</p>
      )}

      <button onClick={onComplete}>Mark as Read</button>
    </div>
  );
}
