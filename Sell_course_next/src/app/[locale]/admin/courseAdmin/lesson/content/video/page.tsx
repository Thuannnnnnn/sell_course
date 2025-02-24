"use client";
import { useState, useRef, useEffect } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import styles from "@/style/Video.module.css";
import { useSession } from "next-auth/react";
import { uploadVideo, getVideo } from "@/app/api/video/video";
import { useSearchParams } from "next/navigation";
import Hls from "hls.js";
import { VideoResponse } from "@/app/type/video/video";
export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");
  const fetched = useRef(false);
  useEffect(() => {
    const fetchVideo = async () => {
      if (!contentId || !session?.user.token || fetched.current) return;
      fetched.current = true;
      try {
        const video = await getVideo(contentId, session.user.token);
        setVideoData(video);
      } catch (error) {
        console.error("Failed to fetch video:", error);
      }
    };

    fetchVideo();
  }, [contentId, session]);

  useEffect(() => {
    if (videoData && videoData?.url && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoData?.url);
        hls.attachMedia(videoRef.current);
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = videoData?.url;
      }
    }
  }, [videoData]);

  const handleUpload = async () => {
    if (!file || !session?.user.token || !contentId) return;
    setLoading(true);

    try {
      await uploadVideo(file, contentId, file.name, session.user.token);

      alert("File uploaded successfully!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Reload video after upload
      const video = await getVideo(contentId, session.user.token);
      setVideoData(video);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 className={styles.title}>Video Management</h2>
      {videoData ? (
        <Card className={styles.uploadBox}>
          <Card.Body>
            <video ref={videoRef} width="100%" controls></video>
            <div className="d-flex justify-content-center mt-3">
              <Button className="me-2">Edit Video</Button>
              <Button className="me-2">Edit Script</Button>
              <Button variant="danger">Delete Video</Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className={styles.uploadBox}>
          <Card.Body className={styles.dragDropArea}>
            <p className={styles.dragText}>
              Drag & drop files or{" "}
              <span
                className={styles.browse}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse
              </span>
            </p>
            <input
              type="file"
              title="file"
              ref={fileInputRef}
              className={styles.fileInput}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleUpload}
              className={styles.uploadButton}
              disabled={loading || !file}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "UPLOAD FILE"
              )}
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
