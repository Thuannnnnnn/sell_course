"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Card,
  ListGroup,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import styles from "@/style/Video.module.css";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { uploadVideo } from "@/app/api/video/video";

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: "video123",
      name: "example-video.mp4",
      url: "https://sample-videos.com/video123.mp4",
      script: "Generated script for example-video.mp4",
    },
    {
      id: "image456",
      name: "sample-image.png",
      url: "https://via.placeholder.com/150",
    },
  ]);
  const [editFileId, setEditFileId] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const localActive = useLocale();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile || !session?.user.token || !contentId) return;

    try {
      await uploadVideo(
        selectedFile,
        contentId,
        selectedFile.name,
        session.user.token
      );
      const newFileData = {
        id: `file${Date.now()}`,
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
        script: selectedFile.name.endsWith(".mp4")
          ? `Generated script for ${selectedFile.name}`
          : undefined,
        file: selectedFile,
      };
      setUploadedFiles([...uploadedFiles, newFileData]);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  const handleDelete = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  const handleEditScript = (id: string) => {
    router.push(
      `/${localActive}/admin/courseAdmin/lesson/content/video/script?id=${id}`
    );
  };

  const handleReplaceFile = async () => {
    if (!newFile || !editFileId || !session?.user.token || !contentId) return;
    if (!window.confirm("Bạn có chắc muốn cập nhật không?")) return;

    try {
      await uploadVideo(newFile, editFileId, newFile.name, session.user.token);

      const updatedFiles = uploadedFiles.map((file) =>
        file.id === editFileId
          ? {
              ...file,
              name: newFile.name,
              url: URL.createObjectURL(newFile),
              script: newFile.name.endsWith(".mp4")
                ? `Generated script for ${newFile.name}`
                : file.script,
              file: newFile,
            }
          : file
      );
      setUploadedFiles(updatedFiles);
      setEditFileId(null);
      alert("File replaced successfully!");
    } catch (error) {
      console.error("Error replacing file:", error);
      alert("Failed to replace file.");
    }
  };

  return (
    <Container style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 className={styles.title}>Upload</h2>
      <Card
        className={styles.uploadBox}
        onClick={() => fileInputRef.current?.click()}
      >
        <Card.Body className={styles.dragDropArea}>
          <p className={styles.dragText}>
            Drag & drop files or{" "}
            <span
              className={styles.browse}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse
            </span>
          </p>
          <input
            type="file"
            title="file"
            ref={fileInputRef}
            className={styles.fileInput}
            onChange={handleUpload}
          />
          <Button onClick={handleUpload} className={styles.uploadButton}>
            UPLOAD FILES
          </Button>
        </Card.Body>
      </Card>
      <ListGroup className={styles.uploadedSection}>
        <p className={styles.uploadedText}>Uploaded Files</p>
        {uploadedFiles.map((file) => (
          <ListGroup.Item key={file.id} className={styles.uploadedFile}>
            {file.name.endsWith(".mp4") ? (
              <video src={file.url} width="150" controls></video>
            ) : (
              <img src={file.url} alt={file.name} width="150" />
            )}
            <span>{file.name}</span>
            {file.script && (
              <Button
                variant="primary"
                onClick={() => handleEditScript(file.id)}
              >
                Edit Script
              </Button>
            )}
            <Button variant="warning" onClick={() => setEditFileId(file.id)}>
              🖉
            </Button>
            <Button variant="danger" onClick={() => handleDelete(file.id)}>
              🗑
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Modal show={!!editFileId} onHide={() => setEditFileId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Replace File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFile">
              <Form.Label>Choose new file</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setNewFile((e.target as HTMLInputElement).files?.[0] || null)
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditFileId(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReplaceFile}>
            Update File
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
