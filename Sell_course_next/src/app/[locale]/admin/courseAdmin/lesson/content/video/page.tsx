"use client";
import { useState, useRef, useEffect } from "react";
import { Container, Card, Button, Spinner, Form } from "react-bootstrap";
import styles from "@/style/Video.module.css";
import { useSession } from "next-auth/react";
import {
  uploadVideo,
  getVideo,
  updateScript,
  updateVideo,
  deleteScript,
  deleteVideo,
} from "@/app/api/video/video";
import { useSearchParams } from "next/navigation";
import Hls from "hls.js";
import { VideoResponse } from "@/app/type/video/video";

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);
  const [script, setScript] = useState("");
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
        setScript(video?.urlScript || "");
      } catch (error) {
        console.error("Failed to fetch video:", error);
      }
    };
    fetchVideo();
  }, [contentId, session]);

  useEffect(() => {
    if (videoData?.url && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoData.url);
        hls.attachMedia(videoRef.current);
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = videoData.url;
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
      const video = await getVideo(contentId, session.user.token);
      setVideoData(video);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScript = async () => {
    if (!session?.user.token || !videoData?.videoId) return;
    try {
      const formattedScript = JSON.stringify(JSON.parse(script), null, 4);
      const jsonData = new Blob([formattedScript], {
        type: "application/json",
      });
      const jsonFile = new File([jsonData], "script.json", {
        type: "application/json",
      });
      await updateScript(jsonFile, videoData?.videoId, session.user.token);
      alert("Script updated successfully!");
    } catch (error) {
      console.error("Error updating script:", error);
      alert("Failed to update script.");
    }
  };

  useEffect(() => {
    const fetchScript = async () => {
      if (videoData?.urlScript) {
        try {
          const response = await fetch(videoData.urlScript);
          const text = await response.text();
          setScript(text);
        } catch (error) {
          console.error("Failed to fetch script:", error);
        }
      }
    };

    fetchScript();
  }, [videoData]);
  const handleUpdateVideo = async () => {
    if (!file || !session?.user.token || !videoData?.videoId) return;
    setLoading(true);
    try {
      await updateVideo(videoData.videoId, file, session.user.token);
      alert("Video updated successfully!");

      if (!contentId) return;
      const updatedVideo = await getVideo(contentId, session.user.token);
      setVideoData(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      alert("Failed to update video.");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteVideo = async () => {
    if (!videoData?.videoId || !session?.user.token) return;
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await deleteVideo(videoData.videoId, session.user.token);
      alert("Video deleted successfully!");
      setVideoData(null);
      setScript("");
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video.");
    }
  };

  const handleDeleteScript = async () => {
    if (!videoData?.videoId || !session?.user.token) return;
    if (!confirm("Are you sure you want to delete this script?")) return;

    try {
      await deleteScript(videoData.videoId, session.user.token);
      alert("Script deleted successfully!");
      setScript("");
    } catch (error) {
      console.error("Error deleting script:", error);
      alert("Failed to delete script.");
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
              <Button variant="danger" onClick={handleDeleteVideo}>
                Delete Video
              </Button>
            </div>
            <Form.Group className="mt-3">
              <Form.Label>Update Video</Form.Label>
              <Form.Control
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  setFile(target.files?.[0] || null);
                }}
              />
              <Button
                className="mt-2"
                onClick={handleUpdateVideo}
                disabled={!file || loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Update Video"
                )}
              </Button>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Edit Script</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <Button className="mt-2" onClick={handleSaveScript}>
                Save Script
              </Button>
              <Button
                className="mt-2 ms-2"
                variant="danger"
                onClick={handleDeleteScript}
              >
                Delete Script
              </Button>
            </Form.Group>
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
