"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { pdfjs, Page, Document as PDFDocument } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  createDoc,
  fetchDocByIdAdmin,
  updateDoc,
} from "@/app/api/docs/DocsAPI";
import { useSession } from "next-auth/react";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocsPage = () => {
  const searchParams = useSearchParams();
  const contentsId = searchParams.get("contentId");
  const [formData, setFormData] = useState<{
    title: string;
    file: File | null;
    fileUrl: string;
    docsId: string;
  }>({ title: "", file: null, fileUrl: "", docsId: "" });
  const [errors, setErrors] = useState<{ title?: string; file?: string }>({});
  const [documents, setDocuments] = useState<string[]>([]);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;
  const [checkUpdate, setCheckUpdate] = useState<boolean>();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };
  const token = session?.user.token;
  useEffect(() => {
    const loadCourse = async () => {
      if (contentsId) {
        if (!token) {
          return;
        }
        const str = contentsId;
        const parts = str.split("?");
        const doc = await fetchDocByIdAdmin(parts[0] as string, token);
        if (!doc) {
          setCheckUpdate(false);
        } else {
          setFormData((prev) => ({
            ...prev,
            url: doc.url,
            title: doc.title,
            docsId: doc.docsId,
          }));
          setCheckUpdate(true);
        }
      }
    };

    if (contentsId) loadCourse();
  }, [contentsId, token]);

  const createNotification = (
    type: "info" | "success" | "warning" | "error",
    message: string
  ) => {
    return () => {
      switch (type) {
        case "info":
          NotificationManager.info(message || "Info message");
          break;
        case "success":
          NotificationManager.success(message || "Success!");
          break;
        case "warning":
          NotificationManager.warning(message || "Warning!", 3000);
          break;
        case "error":
          NotificationManager.error(message || "Error occurred", 5000);
          break;
      }
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, file: "Chỉ chấp nhận .docx hoặc .pdf" }));
      return;
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFormData((prev) => ({ ...prev, file }));

    setFilePreview(
      file.type === "application/pdf" ? URL.createObjectURL(file) : null
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; file?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tên tài liệu không được để trống";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Tên tài liệu phải có ít nhất 3 ký tự";
    } else if (documents.includes(formData.title.trim())) {
      newErrors.title = "Tên tài liệu đã tồn tại";
    }

    if (!formData.file) {
      newErrors.file = "Bạn phải chọn một tệp tin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !formData.file) return;
    const token = session?.user.token;
    if (!token) {
      return;
    }
    const str = contentsId || "";
    const data = str.split("?");
    try {
      if (checkUpdate == true) {
        console.log("check vao day");
        const doc = await updateDoc(
          formData.docsId,
          formData.title,
          formData.file,
          data[0] || "",
          token
        );

        if (doc === 400) {
          createNotification("error", "content này đã có dữ liệu")();
        }
        setDocuments((prev) => [...prev, formData.title.trim()]);
        localStorage.setItem("documentUpdateSuccessFull", "true");
        router.push(`/${locale}/admin/courseAdmin/lesson?courseId=${data[1]}`);
      } else {
        const doc = await createDoc(
          formData.title,
          data[0] || "",
          formData.file,
          token
        );

        if (doc === 400) {
          createNotification("error", "content này đã có dữ liệu")();
        }
        setDocuments((prev) => [...prev, formData.title.trim()]);
        localStorage.setItem("documentSuccessFull", "true");
        router.push(`/${locale}/admin/courseAdmin/lesson?courseId=${data[1]}`);
      }
    } catch (error) {
      createNotification(
        "error",
        "Có lỗi xảy ra khi tải tài liệu lên" + error
      )();
    }
  };
  return (
    <div className="container mt-5 mb-5">
      <h1>Document Upload</h1>
      <div className="container mt-5">
        <h2>Thêm Tài Liệu Mới (Word / PDF)</h2>
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
          <div className="mb-3">
            <label className="form-label">Tên tài liệu</label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              value={formData.title}
              onChange={handleInputChange}
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Chọn tệp tin (Word / PDF)</label>
            <input
              type="file"
              className={`form-control ${errors.file ? "is-invalid" : ""}`}
              onChange={handleFileChange}
            />
            {errors.file && (
              <div className="invalid-feedback">{errors.file}</div>
            )}
          </div>

          {filePreview && formData.file?.type === "application/pdf" && (
            <div className="mb-3">
              <p>Xem trước tài liệu PDF:</p>
              <PDFDocument
                file={filePreview}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="border p-2"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={500}
                  />
                ))}
              </PDFDocument>
            </div>
          )}

          {formData.file &&
            formData.file.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <div className="mb-3">
                <p>
                  <strong>Tên tệp:</strong> {formData.file.name}
                </p>
                <p>
                  <i>
                    (Không thể hiển thị nội dung Word, vui lòng mở tệp trên máy
                    tính)
                  </i>
                </p>
              </div>
            )}
          <button type="submit" className="btn btn-primary">
            Thêm tài liệu
          </button>
        </form>

        {documents.length > 0 && (
          <div className="mt-4">
            <h4>Danh sách tài liệu:</h4>
            <ul className="list-group">
              {documents.map((doc, index) => (
                <li key={index} className="list-group-item">
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <NotificationContainer />
    </div>
  );
};

export default DocsPage;
