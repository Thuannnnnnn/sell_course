"use client";
import { useState } from "react";
import styles from "@/style/Video.module.css";
import { uploadVideo, updateVideo, deleteVideo } from "@/app/api/video/video";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSearchParams } from "next/navigation";

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState("");
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");
  const handleUpload = async () => {
    if (!file || !contentId) return;
    await uploadVideo(file, contentId);
  };

  const handleUpdate = async () => {
    if (!file || !contentId || !videoId) return;
    await updateVideo(videoId, contentId, file);
  };

  const handleDelete = async () => {
    if (!videoId) return;
    await deleteVideo(videoId);
  };

  return (
    <div className={`container ${styles.videoContainer}`}>
      <h2 className="my-3">Video Management</h2>
      <input
        type="file"
        title="file"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
      />
      <input
        type="text"
        placeholder="Video ID (for update/delete)"
        onChange={(e) => setVideoId(e.target.value)}
        className="form-control my-2"
      />
      <button className="btn btn-primary me-2" onClick={handleUpload}>
        Upload
      </button>
      <button className="btn btn-warning me-2" onClick={handleUpdate}>
        Update
      </button>
      <button className="btn btn-danger" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}
