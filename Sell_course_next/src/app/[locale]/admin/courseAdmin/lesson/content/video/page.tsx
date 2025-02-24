"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, ListGroup, Button, Modal, Form } from "react-bootstrap";
import styles from "@/style/Video.module.css";
import { useLocale } from "next-intl";

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: "video123", name: "example-video.mp4", url: "https://sample-videos.com/video123.mp4", script: "Generated script for example-video.mp4" },
    { id: "image456", name: "sample-image.png", url: "https://via.placeholder.com/150" }
  ]);
  const [editFileId, setEditFileId] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const localActive = useLocale();

  const handleUpload = () => {
    if (!file) return;
    const newFileData = { 
      id: `file${Date.now()}`, 
      name: file.name, 
      url: URL.createObjectURL(file), 
      script: file.name.endsWith(".mp4") ? `Generated script for ${file.name}` : undefined,
      file 
    };
    setUploadedFiles([...uploadedFiles, newFileData]);
  };

  const handleDelete = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const handleEditScript = (id: string) => {
    router.push(`/${localActive}/admin/courseAdmin/lesson/content/video/script?id=${id}`);
  };

  const handleReplaceFile = () => {
    if (!newFile || !editFileId) return;
    if (!window.confirm("Bạn có chắc muốn cập nhật không?")) return;
    const updatedFiles = uploadedFiles.map(file => 
      file.id === editFileId ? { 
        ...file, 
        name: newFile.name, 
        url: URL.createObjectURL(newFile), 
        script: newFile.name.endsWith(".mp4") ? `Generated script for ${newFile.name}` : file.script,
        file: newFile 
      } : file
    );
    setUploadedFiles(updatedFiles);
    setEditFileId(null);
  };

  return (
    <Container style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 className={styles.title}>Upload</h2>
      <Card className={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
        <Card.Body className={styles.dragDropArea}>
          <p className={styles.dragText}>Drag & drop files or <span className={styles.browse} onClick={() => fileInputRef.current?.click()}>Browse</span></p>
          <input
            type="file"
            ref={fileInputRef}
            className={styles.fileInput}
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className={styles.supportedFormats}>Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT</p>
          <Button onClick={handleUpload} className={styles.uploadButton}>UPLOAD FILES</Button>
        </Card.Body>
      </Card>
      <ListGroup className={styles.uploadedSection}>
        <p className={styles.uploadedText}>Uploaded Files</p>
        {uploadedFiles.map(file => (
          <ListGroup.Item key={file.id} className={styles.uploadedFile}>
            {file.name.endsWith(".mp4") ? (
              <video src={file.url} width="150" controls></video>
            ) : (
              <img src={file.url} alt={file.name} width="150" />
            )}
            <span>{file.name}</span>
            {file.script && (
              <Button variant="primary" onClick={() => handleEditScript(file.id)}>Edit Script</Button>
            )}
            <Button variant="warning" onClick={() => setEditFileId(file.id)}>🖉</Button>
            <Button variant="danger" onClick={() => handleDelete(file.id)}>🗑</Button>
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
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditFileId(null)}>Cancel</Button>
          <Button variant="primary" onClick={handleReplaceFile}>Update File</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
